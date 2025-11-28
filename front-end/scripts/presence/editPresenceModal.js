import { getPresenceeById, updatePresence } from './presence_api.js';

export async function openEditPresenceModal(id_presence) {

    if (!id_presence) {
        console.error("Aucun id_presence fourni !");
        return;
    }

    const modal = document.getElementById('editPresenceModal');

    if (!modal) {
        console.error("Modal not found");
        return;
    }

    const presence = await getPresenceeById(id_presence);

    if (!presence) {
        alert("Impossible de charger les données de présence !");
        return;
    }

    // Remplir les champs cachés
    document.getElementById('presenceId').value = presence.id_presence;
    document.getElementById('etudiantId').value = presence.id_etudiant;
    document.getElementById('seanceId').value = presence.id_seance;

    // Infos étudiant
    const fullName = presence.full_name || 'N/A';
    const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase();
    document.getElementById('studentAvatar').textContent = initials;
    document.getElementById('studentName').textContent = fullName;
    document.getElementById('studentId').textContent = presence.course || 'N/A';
    document.getElementById('studentLevel').textContent = presence.niveau || 'N/A';

    // Infos séance
    document.getElementById('courseName').textContent = presence.titre || 'N/A';
    document.getElementById('courseDate').textContent = presence.date_heure.split(' ')[0] || 'N/A';
    document.getElementById('courseTime').textContent = presence.date_heure.split(' ')[1] + ' - ' + presence.heure_fin || 'N/A';

    // Statut
    if (presence.statut === "présent") {
        document.getElementById("statusPresent").checked = true;
    } else {
        document.getElementById("statusAbsent").checked = true;
    }

    // Heure arrivée
    document.getElementById('heureArrivee').value = presence.heure_arrivee || "";

    // Justification
    document.getElementById('justification').value = presence.justification || "";

    // Afficher le modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Ferme le modal
 
export function closeEditPresenceModal() {
    const modal = document.getElementById('editPresenceModal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('editPresenceForm').reset();
}


// Initialisation des événements du modal

export function initEditPresenceModal() {

    //  Bouton fermer
    const closeBtn = document.getElementById('closeEditModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEditPresenceModal);
    }

    // Bouton annuler
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeEditPresenceModal);
    }

    // Bouton enregistrer 
    const saveBtn = document.getElementById('savePresenceBtn');
    if (saveBtn) {

        saveBtn.addEventListener('click', async () => {

            const form = document.getElementById('editPresenceForm');
            const formData = new FormData(form);

            const presenceData = {
                id_presence: formData.get('id_presence'),
                id_etudiant: formData.get('id_etudiant'),
                id_seance: formData.get('id_seance'),
                statut: formData.get('statut'),
                heure_arrivee: formData.get('heure_arrivee') || null,
                justification: formData.get('justification') || null
            };

            // Vérification 
            if (!presenceData.id_presence || !presenceData.id_etudiant || !presenceData.id_seance) {
                alert("Champs obligatoires manquants.");
                return;
            }

            const result = await updatePresence(presenceData);

            if (result.success) {
                closeEditPresenceModal();
                window.location.reload();
            } else {
                alert("Erreur : " + result.message);
            }

        });
    }

    // Fermer modal en cliquant dehors
    const modal = document.getElementById('editPresenceModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeEditPresenceModal();
            }
        });
    }
}

// Lancer l’init une seule fois
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEditPresenceModal);
} else {
    initEditPresenceModal();
}
