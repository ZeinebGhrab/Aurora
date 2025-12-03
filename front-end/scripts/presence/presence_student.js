import { getPresencesByStudent } from "./presence_api.js";
import { renderPagination } from "../utils.js";

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("presences-container");
    const paginationContainer = document.getElementById("presences-pagination");

    if (!container || !paginationContainer) return;

    const limit = 3;

    async function loadPage(page = 1, limitParam = limit) {
        const { presences, pagination } = await getPresencesByStudent(page, limitParam);
        console.log("Stats récupérées:", presences, pagination);

        if (!presences || presences.length === 0) {
            container.innerHTML = `<p class="no-data">Aucune donnée de présence trouvée.</p>`;
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
});
