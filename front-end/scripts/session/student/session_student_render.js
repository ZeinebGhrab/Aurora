import { openUploadModal } from './session_student_upload_modal.js';

export function renderSessions(sessions, container) {
    if (!sessions.length) {
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-calendar-xmark empty-icon"></i><h3>Aucune séance trouvée</h3></div>`;
        return;
    }

    function getStatusClass(s) {
        return { planifiée: "status-planifiee", en_cours: "status-en-cours", terminée: "status-terminee" }[s] || "";
    }
    function getStatusText(s) {
        return { planifiée: "Planifiée", en_cours: "En cours", terminée: "Terminée" }[s] || s;
    }
    function getStatusIcon(s) {
        return { planifiée: "fa-calendar-plus", en_cours: "fa-spinner fa-spin", terminée: "fa-check-circle" }[s] || "fa-circle";
    }

    container.innerHTML = sessions.map(s => {
        const dateObj = new Date(s.date_heure);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleDateString('fr-FR', { month: 'short' });
        const showPresenceBtn = s.statut === 'en_cours';

        return `
            <div class="seance-card" data-session='${JSON.stringify(s).replace(/'/g, "&apos;")}'>
                <div class="seance-header">
                    <div class="seance-date">
                        <div class="date-day">${day}</div>
                        <div class="date-month">${month}</div>
                    </div>
                    <div class="seance-info">
                        <div class="seance-title">${s.titre}</div>
                        <div class="seance-course">${s.code_cours}</div>
                    </div>
                    <div class="seance-status ${getStatusClass(s.statut)}">
                        <i class="fa-solid ${getStatusIcon(s.statut)}"></i> ${getStatusText(s.statut)}
                    </div>
                </div>
                <div class="seance-body">
                    <div class="seance-details">
                        <div class="detail-row"><i class="fa-solid fa-clock"></i> ${s.date_heure.split(' ')[1]} - ${s.heure_fin}</div>
                        <div class="detail-row"><i class="fa-solid fa-door-open"></i> ${s.salle}</div>
                        <div class="detail-row"><i class="fa-solid fa-chalkboard-user"></i> ${s.nom_enseignant} ${s.prenom_enseignant}</div>
                    </div>
                    <div class="seance-actions">
                        <button class="btn-action btn-view"><i class="fa-solid fa-eye"></i></button>
                        ${showPresenceBtn ? `<button class="btn-action btn-presence" onclick="markPresence(this)"><i class="fa-solid fa-camera"></i></button>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // boutons globaux
    window.markPresence = function(btn) {
        const card = btn.closest('.seance-card');
        if (card) openUploadModal(JSON.parse(card.dataset.session));
    };
}
