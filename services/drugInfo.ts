import { db } from "../firebase/config";
import { doc, addDoc, getDoc, setDoc } from 'firebase/firestore';

type DrugInfo = {
  id: string;
  warnings: string[];
  warningSources: string[];
  interactions: string[];
  interactionSources: string[];
};


export const getDrugInfo = async (id: any, name: string): Promise<DrugInfo | undefined> => {
    try {
        const docRef = doc(db, "DrugInfo", String(id));
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as DrugInfo;
        }
        const fdaDrugInfo = await fetchFDADrugInfo(String(id));
        if (
            fdaDrugInfo?.warnings?.length &&
            fdaDrugInfo?.warningSources?.length &&
            fdaDrugInfo?.interactions?.length &&
            fdaDrugInfo?.interactionSources?.length
        ) {
            return fdaDrugInfo;
        }

        const llmDrugInfo = await fetchLLMDrugInfo(String(id), name);

        const warnings = fdaDrugInfo?.warnings?.length
            ? fdaDrugInfo.warnings
            : llmDrugInfo?.warnings || [];

        const warningSources = fdaDrugInfo?.warningSources?.length
            ? fdaDrugInfo.warningSources
            : llmDrugInfo?.warningSources || [];

        const interactions = fdaDrugInfo?.interactions?.length
            ? fdaDrugInfo.interactions
            : llmDrugInfo?.interactions || [];

        const interactionSources = fdaDrugInfo?.interactionSources?.length
            ? fdaDrugInfo.interactionSources
            : llmDrugInfo?.interactionSources || [];

        setDoc(doc(db, "DrugInfo", String(id)), {
            id,
            warnings,
            warningSources,
            interactions,
            interactionSources,
        });
        return {
            id,
            warnings,
            warningSources,
            interactions,
            interactionSources,
        }
    } catch (error) {
        console.error("Error fetching drug info:", error);
    }
    return undefined;
};

const fetchFDADrugInfo = async (
    rxcui: string
): Promise<DrugInfo | undefined> => {
    try {
        const response = await fetch(
            `http://127.0.0.1:8000/drug-info/${rxcui}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch drug info");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching drug info:", error);
        return undefined;
    }
};

const fetchLLMDrugInfo = async (
    rxcui: string,
    name: string
): Promise<DrugInfo | undefined> => {
    try {
        if (!name) {
            return undefined;
        }
        const response = await fetch(
            `http://127.0.0.1:8000/llm-drug-info/${rxcui}?name=${encodeURIComponent(name)}`
        );
        if (!response.ok) {
            const errorText = await response.text();
            console.log("FastAPI error:", response.status, errorText);
            throw new Error("Failed to fetch drug info");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching drug info:", error);
        return undefined;
    }
};