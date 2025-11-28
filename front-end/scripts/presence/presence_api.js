const API_BASE = "/Aurora/back-end";

export async function getAllPresences(page = 1, limit = 12, filters = {}) {
    try {
        const res = await fetch(`${API_BASE}/presence/api/get_all_presence.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page, limit, ...filters })
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Données brutes de l\'API:', data);
        
        if (data.success) {
            return {
                presences: data.presences || [],
                pagination: data.pagination || {}
            };
        }

        return { presences: [], pagination: {} };
        
    } catch (error) {
        console.error('Erreur getAllPresences:', error);
        return { presences: [], pagination: {} };
    }
}


export async function addPresence(presenceData) {
    try {
        console.log(presenceData);
        const res = await fetch(`${API_BASE}/presence/api/add_presence.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(presenceData)
        });

        const data = await res.json();
        return data;

    } catch (error) {
        console.error('Erreur addPresence:', error);
        return { success: false, message: error.message };
    }
}


export async function getPresenceeById(id_presence) {
    console.log('....',id_presence);
    try {
        const res = await fetch(`${API_BASE}/presence/api/get_presence.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_presence })
        });
        const data = await res.json();
        console.log("getPresenceById",data);
        if (data.success && data.presence) return data.presence;
        return null;
    } catch (error) {
        console.error('Erreur getPresenceById:', error);
        return null;
    }
}

export async function updatePresence(presenceData) {
    console.log('Updating presence with data:', presenceData);
    
    try {
        const response = await fetch(`${API_BASE}/presence/api/update_presence.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(presenceData)
        });
        
        const result = await response.json();
        console.log('Update result:', result);
        
        return result;
        
    } catch (error) {
        console.error('Erreur updatePresence:', error);
        return { success: false, message: error.message };
    }
}


export async function deletePresence(id_presence) {
    try {
        const res = await fetch(`${API_BASE}/presence/api/delete_presence.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_presence })
        });

        const data = await res.json();
        return data;

    } catch (error) {
        console.error("Erreur deletePresence:", error);
        return { success: false, message: error.message };
    }
}
