import { openEditPresenceModal } from './editPresenceModal.js';
import { deletePresence } from './presence_api.js';
import { showNotification } from '../utils.js';

export function renderPresences(presences, container) {
    if (!presences || presences.length === 0) {
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #6B7280;">
                <i class="fa-solid fa-clipboard-question" style="font-size: 4rem; color: #D1D5DB; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.1rem; font-weight: 500;">Aucune présence trouvée.</p>
        </div>
    `;
    return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Nom complet</th>
                    <th>Cours</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Salle</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
               ${presences.map(p => `
    <tr>
        <td>
            <div class="student-info">
                <div class="avatar">
                    ${p.full_name ? p.full_name.split(" ").map(w => w[0]).join("") : "-"}
                </div>
                <span>${p.full_name ?? "-"}</span>
            </div>
        </td>
        <td>${p.course ?? "-"}</td>
        <td>${p.date_heure ? p.date_heure.split(' ')[0] : "-"}</td>
        <td>${p.date_heure ? p.date_heure.split(' ')[1] : "-"} - ${p.heure_fin ?? "-"}</td>
        <td>${p.salle ?? "-"}</td>
        <td>
            <span class="status-badge ${p.statut ?? ""}">
                ${formatStatus(p.statut)}
            </span>
        </td>
        <td>
            <div class="action-buttons">
                <button class="btn-update" data-presence='${JSON.stringify(p).replace(/'/g, "&apos;")}' title="Modifier">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-delete" data-id="${p.id_presence}" title="Supprimer">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
    </tr>
`).join("")}
            </tbody>
        </table>
    `;

    // Attacher les événements aux boutons Update
    container.querySelectorAll('.btn-update').forEach(btn => {
    btn.addEventListener('click', () => {
        const presenceData = JSON.parse(btn.getAttribute('data-presence').replace(/&apos;/g, "'"));

        openEditPresenceModal(presenceData.id_presence);
    });
});


    // Attacher les événements aux boutons Delete
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            
            if (confirm('Voulez-vous vraiment supprimer cette présence ?')) {
                const result = await deletePresence(id);
                
                if (result.success) {
                    showNotification('Présence supprimée avec succès!', 'success');
                    window.location.reload();
                } else {
                    showNotification('Erreur: ' + result.message, 'error');
                }
            }
        });
    });
}

function formatStatus(status) {
    switch(status) {
        case "présent":
            return "<i class='fa-solid fa-circle-check'></i> Présent";
        case "absent": 
            return "<i class='fa-solid fa-circle-xmark'></i> Absent";
        case "justifié": 
            return "<i class='fa-solid fa-file-lines'></i> Justifié";
        default: 
            return status;
    }
}