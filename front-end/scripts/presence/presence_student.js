import { getPresencesByStudent, getStatsPresencesForStudent } from "./presence_api.js";
import { renderPagination, initUser } from "../utils.js";

document.addEventListener("DOMContentLoaded", async () => {

    initUser();

    const container = document.getElementById("presences-container");
    const paginationContainer = document.getElementById("presences-pagination");

    if (!container || !paginationContainer) return;

    const limit = 3;

    async function loadPage(page = 1, limitParam = limit) {
        const { presences, pagination } = await getPresencesByStudent(page, limitParam);
        console.log("Stats récupérées:", presences, pagination);

        if (!presences || presences.length === 0) {
            container.innerHTML = `<div class="empty-state" style="text-align:center;display:flex; justify-content:center; align-items:center; min-height:400px; width:100%;">
                        <div style="text-align:center; color:#6B7280; max-width:500px;">
                            <i class="fa-solid fa-book-open" style="font-size:4rem; color:#5299cf; margin-bottom:1.5rem; opacity:0.6; display:block;"></i>
                            <h3 style="font-size:1.5rem; font-weight:700; color:#374151; margin-bottom:0.5rem;">Aucune présence disponible</h3>
                        </div>
                    </div>`;
            paginationContainer.innerHTML = "";
            return;
        }

        container.innerHTML = presences.map(s => {
            const total = s.nb_presences + s.nb_absences;
            const progress = total > 0 ? Math.round((s.nb_presences / total) * 100) : 0;
            const absenceRate = total > 0 ? Math.round((s.nb_absences / total) * 100) : 0;
            const status = absenceRate < 25 ? "Correct" : "À surveiller";

            return `
                <div class="course-card">
                    <div class="course-header">
                        <p class="status"><span class="dot"></span> ${status}</p>
                        <div class="course-name">${s.nom_cours}</div>
                        <div class="absence-rate">
                            <span>${absenceRate}%</span>
                            <p>Absences</p>
                        </div>
                    </div>
                    <div class="absence-stats">
                        <div class="stat">
                            <div class="icon red"><i class="fa-solid fa-xmark"></i></div>
                            <p class="count">${s.nb_absences}</p>
                            <span>Absences</span>
                        </div>
                        <div class="stat">
                            <div class="icon blue"><i class="fa-solid fa-check"></i></div>
                            <p class="count">${s.nb_presences}</p>
                            <span>Présences</span>
                        </div>
                    </div>
                    <div class="progress-info">
                        <p>Répartition des séances</p>
                        <p>${total} séances</p>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%;"></div>
                    </div>
                </div>
            `;
        }).join("");

        // Pagination
        renderPagination(pagination, paginationContainer, (newPage) => loadPage(newPage, limitParam));
    }

    // Charger la première page
    loadPage(1, limit);
    loadPresenceStats();

    // Fonction pour charger les stats et mettre à jour le DOM
    async function loadPresenceStats() {
        try {
            const stats = await getStatsPresencesForStudent();
            if (!stats) return;
    
            document.getElementById('statTotal').textContent = stats.total_seances ?? 0;
            document.getElementById('statPresences').textContent = stats.total_presences ?? 0;
            document.getElementById('statAbsences').textContent = stats.total_absences ?? 0;
        } catch (error) {
            console.error("Erreur lors du chargement des stats de présence :", error);
        }
    }
});
