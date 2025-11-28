export function renderSessions(sessions, container) {

    if (!sessions || !Array.isArray(sessions)) {
        console.warn("sessions n'est pas un tableau valide:", sessions);
        container.innerHTML = `
            <p class="error-message">Erreur lors du chargement des séances</p>
        `;
        return;
    }

    container.innerHTML = "";

    // Si aucune séance
    if (sessions.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; display:flex;justify-content:center;align-items:center;min-height:300px;width:100%;">
                <div style="text-align:center;color:#6B7280;max-width:500px;">
                    <i class="fa-solid fa-calendar-xmark" 
                        style="font-size:4rem;color:#5299cf;margin-bottom:1.5rem;opacity:0.6;display:block;">
                    </i>
                    <h3 style="font-size:1.5rem;font-weight:700;color:#374151;margin-bottom:0.5rem;">
                        Aucune séance trouvée
                    </h3>
                    <p style="font-size:1rem;margin:0;">
                        Cliquez sur "Nouvelle Séance" pour en ajouter une
                    </p>
                </div>
            </div>
        `;
        return;
    }

    sessions.forEach(item => {
        try {
            const s = item;

            if (!s || !s.id_seance) {
                console.warn("Séance invalide:", item);
                return;
            }

            // Format date
            const dateObj = new Date(s.date);
            const day = String(dateObj.getDate()).padStart(2, "0");
            const month = dateObj.toLocaleString("fr-FR", { month: "short" }).toUpperCase();

            // Classes statut
            const statusClass = {
                "planifiée": "status-planifiee",
                "en_cours": "status-en-cours",
                "terminée": "status-terminee",
                "annulée": "status-annulee"
            }[s.statut] || "status-planifiee";

            const card = document.createElement("div");
            card.classList.add("seance-card");

            card.innerHTML = `
                <div class="seance-header">

                    <div class="seance-info">
                        <h3 class="seance-title">${s.titre || "Séance"}</h3>
                        <p class="seance-course">${s.nom_cours || "Cours N/A"}</p>
                    </div>

                    <span class="seance-status ${statusClass}">
                        ${getStatusIcon(s.statut)} ${formatStatus(s.statut)}
                    </span>
                </div>

                <div class="seance-body">
                    <div class="seance-details">
                        <div class="detail-row">
                            <i class="fa-solid fa-clock"></i>
                            <span>${s.date_heure} - ${s.heure_fin}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fa-solid fa-user-tie"></i>
                            <span>${s.nom_enseignant + " " + s.prenom_enseignant || "Non assigné"}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fa-solid fa-door-open"></i>
                            <span>${s.salle || "Salle N/A"}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fa-solid fa-users"></i>
                            <span>${s.nb_etudiants || 0} étudiants</span>
                        </div>
                    </div>

                    <div class="seance-description">
                        <p>${s.description || ""}</p>
                    </div>

                    <div class="seance-actions">
                        <button class="btn-action btn-view" data-id="${s.id_seance}">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" data-id="${s.id_seance}">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-action btn-delete" data-id="${s.id_seance}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            container.appendChild(card);

        } catch (e) {
            console.error("Erreur lors du rendu d'une séance:", e);
        }
    });
}

// Helpers
function formatStatus(status) {
    return {
        "planifiée": "Planifiée",
        "en_cours": "En cours",
        "terminée": "Terminée",
        "annulée": "Annulée"
    }[status] || status;
}

function getStatusIcon(status) {
    return {
        "planifiée": '<i class="fa-solid fa-clock"></i>',
        "en_cours": '<i class="fa-solid fa-play"></i>',
        "terminée": '<i class="fa-solid fa-check"></i>',
        "annulée": '<i class="fa-solid fa-xmark"></i>'
    }[status] || "";
}
