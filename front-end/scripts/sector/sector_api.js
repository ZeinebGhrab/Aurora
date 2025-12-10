const API_BASE = "/Aurora/back-end";

export async function getAllFilieres() {
    try {
        const res = await fetch(`${API_BASE}/sector/api/get_all_sector.php`);
        const data = await res.json();
        console.log('Filières:', data);
        
        if (data.programs && Array.isArray(data.programs)) return data.programs;
        if (Array.isArray(data)) return data;
        return [];
        
    } catch (error) {
        console.error('Erreur getAllFilieres:', error);
        return [];
    }
}