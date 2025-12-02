import { getPresencesByStudent } from "./presence_api.js";

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("presences-container");

    if (!container) {
        return;
    }

    // Appel API
    const { presences } = await getPresencesByStudent();

    console.log("Presences récupérées:", presences);

    if (!presences || presences.length === 0) {
        container.innerHTML = `<p class="no-data">Aucune donnée de présence trouvée.</p>`;
        return;
    }

    // Regroupement par matière
    const grouped = {};

    presences.forEach(p => {
        const matiere = p.course || "Matière inconnue";

        if (!grouped[matiere]) {
            grouped[matiere] = {
                total: 0,
                presences: 0,
                absJust: 0,
                absNonJust: 0,
            };
        }

        grouped[matiere].total++;

        switch (p.statut) {
            case "present":
                grouped[matiere].presences++;
                break;
            case "abs_justifie":
                grouped[matiere].absJust++;
                break;
            case "abs_non_justifie":
                grouped[matiere].absNonJust++;
                break;
        }
    });

    // Générer les cards dynamiques
    container.innerHTML = Object.keys(grouped)
        .map(matiere => {
            const data = grouped[matiere];

            const absenceRate = Math.round(
                ((data.absJust + data.absNonJust) / data.total) * 100
            );

            const progress = Math.round((data.presences / data.total) * 100);

            const status = absenceRate < 25 ? "Correct" : "À surveiller";

            return `
                <div class="course-card">
                    <div class="course-header">
                        <p class="status"><span class="dot"></span> ${status}</p>
                        <div class="course-name">${matiere}</div>
                        <div class="absence-rate">
                            <span>${absenceRate}%</span>
                            <p>Absences</p>
                        </div>
                    </div>

                    <div class="absence-stats">
                        <div class="stat">
                            <div class="icon red"><i class="fa-solid fa-xmark"></i></div>
                            <p class="count">${data.absNonJust}</p>
                            <span>Non justifiées</span>
                        </div>

                        <div class="stat">
                            <div class="icon orange"><i class="fa-solid fa-exclamation"></i></div>
                            <p class="count">${data.absJust}</p>
                            <span>Justifiées</span>
                        </div>

                        <div class="stat">
                            <div class="icon blue"><i class="fa-solid fa-check"></i></div>
                            <p class="count">${data.presences}</p>
                            <span>Présences</span>
                        </div>
                    </div>

                    <div class="progress-info">
                        <p>Répartition des séances</p>
                        <p>${data.total} séances</p>
                    </div>

                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%;"></div>
                    </div>
                </div>
            `;
        })
        .join("");
});
