import { getStatsSessionsForTeacher } from "../session_api.js";

export async function loadStats() {
    try {
        const stats = await getStatsSessionsForTeacher();
        if (!stats) return;

        document.getElementById('completedSeances').textContent = stats['terminées'] ?? 0;
        document.getElementById('ongoingSeances').textContent = stats['en_cours'] ?? 0;
        document.getElementById('upcomingSeances').textContent = stats['à_venir'] ?? 0;

        const total = (stats['terminées'] ?? 0) + (stats['en_cours'] ?? 0) + (stats['à_venir'] ?? 0);
        document.getElementById('totalSeances').textContent = total;
    } catch (err) {
        console.error("Erreur chargement stats :", err);
    }
}
