export const FDA_CONFIG = {
    BASE_URL: 'https://api.fda.gov/drug/label.json',
    API_KEY: process.env.EXPO_PUBLIC_FDA_API_KEY,
    headers: {
        accept: 'application/json',
        Authorization: `Bearer  ${process.env.EXPO_PUBLIC_FDA_API_KEY}`,
    }
}

export const fetchFDA = async ({ query }: {query: string}) => {
    const endpoint = query
        ? `${FDA_CONFIG.BASE_URL}?api_key=${FDA_CONFIG.API_KEY}&search=openfda.rxcui:${encodeURIComponent(query)}&limit=1`
        : `${FDA_CONFIG.BASE_URL}?api_key=${FDA_CONFIG.API_KEY}&limit=1`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: FDA_CONFIG.headers,
    })

    if (!response.ok) {
        // @ts-ignore
        throw new Error('Failed to fetch medications', response.statusText);
    }

    return await response.json();
}


export const RX_CONFIG = {
    BASE_URL: 'https://rxnav.nlm.nih.gov/REST',
    headers: {
        accept: 'application/json',
    }
}

export const fetchRX = async ({ query }: {query: string}) => {
    const endpoint = query
        ? `${RX_CONFIG.BASE_URL}/drugs.json?name=${encodeURIComponent(query)}`
        : `${RX_CONFIG.BASE_URL}/drugs.json`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: RX_CONFIG.headers,
    })

    if (!response.ok) {
        // @ts-ignore
        throw new Error('Failed to fetch medications', response.statusText);
    }

    return await response.json();
}