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