from typing import TypedDict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_tavily import TavilySearch
from agent import Agent
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
tavily_api_key = os.getenv("TAVILY_API_KEY")

tool = TavilySearch(max_results=4, api_key=tavily_api_key)

prompt = """
You are a medication information research assistant.

Your job is to provide accurate information about a medication's:
- warnings (important adverse effects, risks, or conditions associated with the medication)
- drug interactions (other drugs or substances that should not be taken with the medication, or that have clinically significant interactions with it)

Use the provided information first. If the information is incomplete
or insufficient, use the Tavily search tool to find reliable sources.

Prioritize authoritative medical sources such as the FDA, NIH, and
other reputable medical organizations.

Do not invent medical information or sources.

For every warning or interaction you provide, include the source when
one is available.

Return the final information in the requested structured format.
"""

model = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0, api_key=api_key)
abot = Agent(model, [tool], system=prompt)

class DrugSource(TypedDict):
    title: str
    url: str


class DrugInfo(TypedDict):
    warnings: list[str]
    warningSources: list[DrugSource]
    interactions: list[str]
    interactionSources: list[DrugSource]


def get_drug_info(rxcui: str, drugName: str) -> DrugInfo:
    # Build the initial AgentState
    initial_state = {
        "rxcui": rxcui,
        "drugName": drugName,
        "warnings": [],
        "warningSources": [],
        "interactions": [],
        "interactionSources": [],
        "tavilyResults": [],
        "toolCalls": 0
    }

    # Run the LangGraph agent
    result = abot.graph.invoke(initial_state)

    # Return only the information your API needs
    return {
        "warnings": result["warnings"],
        "warningSources": result["warningSources"],
        "interactions": result["interactions"],
        "interactionSources": result["interactionSources"]
    }