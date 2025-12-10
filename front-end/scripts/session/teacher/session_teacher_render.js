const container = document.getElementById('sessionsContainer');

export function renderSessions(sessions) {
    if (!sessions || sessions.length === 0) {
        showEmptyState();
        return;
    }

    container.innerHTML = sessions.map(s => {
        const dateObj = new Date(s.date_heure);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleDateString('fr-FR', { month: 'short' });
        const tauxPresence = s.nb_etudiants > 0 ? Math.round((s.nb_presents / s.nb_etudiants) * 100) : 0;

        return `
            <div class="seance-card">
                <div class="seance-header">
                    <div class="seance-date">
                        <div class="date-day">${day}</div>
                        <div class="date-month">${month}</div>
                    </div>
                    <div class="seance-info">
                        <div class="seance-title">${s.titre}</div>
                        <div class="seance-course">${s.nom_cours}</div>
                    </div>
                    <div class="seance-status ${getStatusClass(s.statut)}">
                        <i class="fa-solid ${getStatusIcon(s.statut)}"></i>
                        ${getStatusText(s.statut)}
                    </div>
                </div>
                <div class="seance-body">
                    <div class="seance-details">
                        <div class="detail-row"><i class="fa-solid fa-clock"></i> ${s.date_heure.split(' ')[1]} - ${s.heure_fin}</div>
                        <div class="detail-row"><i class="fa-solid fa-door-open"></i> ${s.salle ?? "Salle non spécifiée"}</div>
                        <div class="detail-row"><i class="fa-solid fa-users"></i> ${s.nb_etudiants ?? 0} étudiants</div>
                        ${s.statut === 'terminee' ? `<div class="detail-row"><i class="fa-solid fa-chart-pie"></i> Présence: ${tauxPresence}% (${s.nb_presents}/${s.nb_etudiants})</div>` : ''}
                    </div>
                    ${s.description ? `<div class="seance-description"><p>${s.description}</p></div>` : ''}
                    <div class="seance-actions">
                        ${getActionButtons(s)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

export function showEmptyState() {
    container.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-calendar-xmark empty-icon"></i>
            <h3>Aucune séance trouvée</h3>
            <p>Aucune séance ne correspond à votre recherche.</p>
        </div>
    `;
}

// STATUTS & BOUTONS

function getStatusClass(s) {
    return { planifiee: "status-planifiee", en_cours: "status-en-cours", terminee: "status-terminee", annulee: "status-annulee" }[s] || "";
}
function getStatusText(s) {
    return { planifiee: "Planifiée", en_cours: "En cours", terminee: "Terminée", annulee: "Annulée" }[s] || s;
}
function getStatusIcon(s) {
    return { planifiee: "fa-calendar-plus", en_cours: "fa-spinner fa-spin", terminee: "fa-check-circle", annulee: "fa-times-circle" }[s] || "fa-circle";
}
function getActionButtons(s) {
    if (s.statut === 'en_cours') return `<button class="btn-action btn-view" onclick="managePresence(${s.id_seance})"><i class="fa-solid fa-user-check"></i></button>`;
    if (s.statut === 'terminee') return `<button class="btn-action btn-view" onclick="viewPresenceReport(${s.id_seance})"><i class="fa-solid fa-chart-bar"></i></button>`;
    return '';
}
