import requests
from dotenv import load_dotenv
import os
import re

load_dotenv()
openfda_api_key = os.getenv("EXPO_PUBLIC_FDA_API_KEY")
FDA_BASE_URL = "https://api.fda.gov/drug/label.json"

def fetch_openfda_drug_info(rxcui: str):
    # Query OpenFDA
    if not openfda_api_key:
        raise ValueError("FDA_API_KEY is not set")
    search = f"openfda.rxcui:{rxcui}" if rxcui else ""
    params = {
        "api_key": openfda_api_key,
        "search": search,
        "limit": 1
    }
    response = requests.get(FDA_BASE_URL, params=params)
    response.raise_for_status()
    return response.json()


def parse_openfda_warnings(data) -> list[str]:
    # Extract warnings from OpenFDA's response
    regex = r"([A-Z][A-Za-z0-9'’\- ]+(?:, [A-Z][A-Za-z0-9'’\- ]+)*(?: and [A-Z][A-Za-z0-9'’\- ]+)?)\s*:"
    text = data.get("results", [{}])[0].get("warnings_and_cautions", [None])[0]
    warnings = re.findall(regex, text) if text else []
    warnings = [warning.strip() for warning in warnings]
    if len(warnings) > 0:
        warnings[0] = warnings[0][25:].strip()
        warnings = warnings[:-1]
    return warnings


def parse_openfda_interactions(data) -> list[str]:
    # Extract interactions from OpenFDA's response
    regex = r'<content styleCode="bold">([^<]+)'
    text = data.get("results", [{}])[0].get("drug_interactions_table", [None])[0]
    interactions = re.findall(regex, text) if text else []
    interactions = [interaction.strip() for interaction in interactions]
    interactions = interactions[1:] if len(interactions) > 1 else []
    return interactions