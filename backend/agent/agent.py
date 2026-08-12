from langgraph.graph import StateGraph, END
from typing import TypedDict, NotRequired
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage

class AgentState(TypedDict):
    rxcui: str
    drugName: str
    warnings: list[str]
    warningSources: list[dict]
    interactions: list[str]
    interactionSources: list[dict]
    llmResult: NotRequired[AIMessage]
    tavilyResults: list[dict]
    toolCalls: int

class Agent:
    def __init__(self, model, tools, system=""):
        self.system = system
        graph = StateGraph(AgentState)
        graph.add_node("llm", self.call_llm)
        graph.add_node("action", self.take_action)
        graph.add_conditional_edges(
            "llm",
            self.exists_action,
            {True: "action", False: END}
        )
        graph.add_edge("action", "llm")
        graph.set_entry_point("llm")
        self.graph = graph.compile()
        self.tools = {t.name: t for t in tools}
        self.model = model.bind_tools(tools)

    def exists_action(self, state: AgentState) -> bool:
        # If no tool call → False
        # If tool call exists but we've already used our 1 call → False
        # Otherwise → True
        result = state['llmResult']
        calls = state["toolCalls"]
        if len(result.toolCalls) == 0:
            return False
        if calls >= 1:
            return False
        return True
        


    def call_llm(self, state: AgentState):
        # Send state/messages to Gemini
        rxcui = state['rxcui']
        name = state['drugName']
        warnings = state['warnings']
        warningSources = state['warningSources']
        interactions = state['interactions']
        interactionSources = state['interactionSources']
        tavilyResults = state['tavilyResults']
        messages = []
        if self.system:
            messages.append(SystemMessage(content=self.system))
        hMessage = HumanMessage(content=f"Drug name: {name}\nRXCUI: {rxcui}\nWarnings: {warnings}\nWarning Sources: {warningSources}\nNegative Drug Interactions: {interactions}\nInteraction Sources: {interactionSources}\nTavily Results: {tavilyResults}")
        messages.append(hMessage)
        message = self.model.invoke(messages)
        return {'llmResult': message}


    def take_action(self, state: AgentState):
        # Execute Tavily tool calls
        tool_calls = state['llmResult'].tool_calls
        t = tool_calls[0]
        print(f"Calling: {t}")
        if not t['name'] in self.tools:
            print("\n ....bad tool name....")
            result = "bad tool name, retry"
        else:
            result = self.tools[t['name']].invoke(t['args'])
        print("Back to the model!")
        return {
            'tavilyResults': [result],
            'toolCalls': state['toolCalls'] + 1
        }