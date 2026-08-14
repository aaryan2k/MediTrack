from fastapi import FastAPI
from services.openfda import (fetch_openfda_drug_info, parse_openfda_warnings, parse_openfda_interactions)
from ai.model import get_drug_info


app = FastAPI()

@app.get("/drug-info/{rxcui}")
def get_fda_drug_info(rxcui: str):

    data = fetch_openfda_drug_info(rxcui)

    warnings = parse_openfda_warnings(data)
    interactions = parse_openfda_interactions(data)

    return {
        "warnings": warnings,
        "warningSources": ["openFDA"] if warnings else [],
        "interactions": interactions,
        "interactionSources": ["openFDA"] if interactions else []
    }

@app.get("/llm-drug-info/{rxcui}")
def get_llm_drug_info(rxcui: str, name: str):

    data = get_drug_info(rxcui, name)

    return {
        "warnings": data["warnings"],
        "warningSources": data["warningSources"],
        "interactions": data["interactions"],
        "interactionSources": data["interactionSources"]
    }