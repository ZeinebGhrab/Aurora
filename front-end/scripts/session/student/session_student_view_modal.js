import { openUploadModal } from './session_student_upload_modal.js';

const viewModal = document.getElementById('viewModal');
let currentSessionData = null;

export function initViewModal() {
    if (!viewModal) return console.error("Modal view introuvable");

    // Fonction pour fermer modal
    const closeModal = () => {
        viewModal.classList.remove('active');
        document.body.style.overflow = '';
        currentSessionData = null;
    };

    // Boutons de fermeture
    viewModal.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Fermer en cliquant sur l'overlay
    viewModal.addEventListener('click', e => {
        if (e.target === viewModal) closeModal();
    });

    // Fermer avec Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && viewModal.classList.contains('active')) closeModal();
    });

    // Bouton "Marquer présence" depuis modal
    const presenceBtn = document.getElementById('viewPresenceBtn');
    presenceBtn?.addEventListener('click', () => {
        if (currentSessionData) openUploadModal(currentSessionData);
        closeModal();
    });
}

// Fonction pour ouvrir le modal
export async function openViewModal(session) {
    if (!session) return;

    currentSessionData = session;

    // Format date & horaire
    const dateObj = session.date_heure ? new Date(session.date_heure) : null;
    const dateFormatted = dateObj ? dateObj.toLocaleDateString('fr-FR') : 'N/A';
    const timeFormatted = session.date_heure ? session.date_heure.split(' ')[1] : 'N/A';

    document.getElementById('viewCourseName').textContent = session.code_cours || '-';
    document.getElementById('viewTitre').textContent = session.titre || '-';
    document.getElementById('viewDate').textContent = dateFormatted;
    document.getElementById('viewHeure').textContent = `${timeFormatted} - ${session.heure_fin || 'N/A'}`;
    document.getElementById('viewSalle').textContent = session.salle || '-';
    document.getElementById('viewTeacher').textContent = `${session.nom_enseignant || ''} ${session.prenom_enseignant || ''}`.trim();
    document.getElementById('viewDescription').textContent = session.description || 'Aucune description';

    // Gestion statut
    const statutElement = document.getElementById('viewStatut');
    const statusClasses = { planifiee: 'status-planifiee', en_cours: 'status-en-cours', terminee: 'status-terminee' };
    statutElement.textContent = session.statut ? session.statut.replace('_', ' ') : '-';
    statutElement.className = 'status-badge ' + (statusClasses[session.statut] || '');

    // Afficher bouton présence uniquement si en cours
    const btnPresence = document.getElementById('viewPresenceBtn');
    if (btnPresence) btnPresence.style.display = session.statut === 'en_cours' ? 'inline-flex' : 'none';

    viewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fonction pour assigner le bouton view de chaque carte
export function initViewButtons() {
    document.addEventListener('click', async e => {
        const btn = e.target.closest('.btn-view');
        if (!btn) return;

        const card = btn.closest('.seance-card');
        if (!card) return;

        let sessionData = JSON.parse(card.dataset.session);
        await openViewModal(sessionData);
    });
}
