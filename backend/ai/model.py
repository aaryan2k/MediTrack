from typing import TypedDict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_tavily import TavilySearch
from .agent import Agent
from dotenv import load_dotenv
import os
import json

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
tavily_api_key = os.getenv("TAVILY_API_KEY")

tool = TavilySearch(max_results=4, api_key=tavily_api_key)

prompt = """
You are a medication information research assistant.

Your job is to provide accurate information about the medication provided
in the state.

You need to identify:

- warnings: important adverse effects, risks, or conditions associated
  with the medication (for example, hepatotoxicity, serotonin syndrome,
  seizures, or severe skin reactions)
- drug interactions: other drugs or substances that should not be taken
  with the medication, or that have clinically significant interactions
  with it

Use the provided information first. If the provided information is
incomplete or insufficient, use the Tavily search tool to find reliable
information.

If only an RxCUI is available, use the RxCUI to identify the medication first, then search for that medication's warnings and interactions.

When using Tavily:
- Search using the medication's name and the specific information you
  need.
- Do not search using only the RxCUI.
- Prefer authoritative sources such as the FDA, NIH, DailyMed, Mayo Clinic,
  and other reputable medical organizations.
- Do not invent medical information or sources.

Your final response MUST contain exactly these four fields:

{
    "warnings": [],
    "warningSources": [],
    "interactions": [],
    "interactionSources": []
}

Each item in warnings should be a concise name of a warning or important
risk.

Each item in interactions should identify a drug or substance that has a
clinically significant interaction with the medication.

When listing warnings or drug interactions, keep each item concise.
Do not include parenthetical explanations or examples.

For example, instead of:
"Serotonergic drugs (e.g., triptans, tricyclic antidepressants, fentanyl, lithium, tramadol)"

return:
"Serotonergic drugs"

Similarly, remove phrases such as "(e.g., ...)", "(such as ...)", or other
parenthetical details from the warning or interaction name.

Each item in warningSources should correspond to a warning and contain
the source title and URL.

Each item in interactionSources should correspond to an interaction and
contain the source title and URL.

Only include sources that you can actually identify. Do not fabricate
URLs or sources.

Return ONLY the structured JSON object. Do not include explanations,
markdown, or additional fields. Do not wrap the JSON in markdown code fences.

You have at most ONE opportunity to use the Tavily search tool.

Before calling Tavily, construct the most useful search query possible.
The query should include the medication's name and the specific information
you need. Do NOT search using only the RxCUI.

After receiving the Tavily results, do not call Tavily again.
Use the information already provided to produce the final answer.
"""

model = ChatGoogleGenerativeAI(model="gemini-3.6-flash", api_key=api_key)
abot = Agent(model, [tool], system=prompt)

class DrugSource(TypedDict):
    title: str
    url: str


class DrugInfo(TypedDict):
    warnings: list[str]
    warningSources: list[DrugSource]
    interactions: list[str]
    interactionSources: list[DrugSource]


def get_drug_info(rxcui: str, name: str) -> DrugInfo:
    # Build the initial AgentState
    initial_state = {
        "rxcui": rxcui,
        "name": name,
        "warnings": [],
        "warningSources": [],
        "interactions": [],
        "interactionSources": [],
        "tavilyResults": [],
        "toolCalls": 0
    }

    # Run the LangGraph agent
    result = abot.graph.invoke(initial_state)

    llm_result = result["llmResult"]

    # content is a list, so get the first item
    content = llm_result.content[0]

    # Get the actual JSON string
    text = content["text"]

    # Convert JSON string into a Python dictionary
    drug_info = json.loads(text)

    return drug_info