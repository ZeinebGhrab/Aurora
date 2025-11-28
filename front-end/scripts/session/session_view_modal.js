import { getSessionById } from './session_api.js';
import { showNotification } from '../utils.js';

export function initViewSessionModal() {
    const viewModal = document.getElementById('viewSessionModal');
    if (!viewModal) {
        console.error("Modal de visualisation introuvable");
        return;
    }

    // Fonction pour fermer le modal
    const closeModal = () => {
        viewModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Boutons de fermeture
    const closeModalBtns = viewModal.querySelectorAll('.modal-close, .btn-close, .close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            closeModal();
        });
    });

    // Fermer en cliquant sur l'overlay
    viewModal.addEventListener('click', e => {
        if (e.target === viewModal) closeModal();
    });

    // Fermer avec la touche Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && viewModal.classList.contains('active')) closeModal();
    });

    // Ouvrir le modal sur bouton View
    document.addEventListener('click', async e => {
        const btn = e.target.closest('.btn-view');
        if (!btn) return;

        const idSeance = btn.dataset.id;
        if (!idSeance) {
            showNotification("ID de la séance manquant.");
            return;
        }

        let session = null;
        try {
            session = await getSessionById(idSeance);
        } catch (err) {
            console.error("Erreur lors de la récupération de la séance:", err);
            showNotification("Impossible de récupérer la séance.");
            return;
        }

        if (!session) {
            showNotification("Séance introuvable.");
            return;
        }

        console.log("Séance à afficher:", session);

        // Format date
        const dateFormatted = session.date_heure
            ? new Date(session.date_heure).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
              })
            : 'N/A';

        // Format horaire
        let horaireFormatted = 'N/A';
        if (session.date_heure && session.heure_fin) {
            const [_, time] = session.date_heure.split(' ');
            horaireFormatted = `${time?.substring(0, 5) || '??'} - ${session.heure_fin.substring(0, 5) || '??'}`;
        }

        // Format statut
        const statutLabels = {
            planifiée: 'Planifiée',
            en_cours: 'En cours',
            terminée: 'Terminée',
            annulée: 'Annulée'
        };
        const statutFormatted = statutLabels[session.statut] || session.statut || 'N/A';

        // Remplir le modal
        document.getElementById('viewSessionCours').textContent = session.nom_cours|| 'N/A';
        document.getElementById('viewSessionTitre').textContent = session.titre || 'N/A';
        document.getElementById('viewSessionDate').textContent = dateFormatted;
        document.getElementById('viewSessionHoraire').textContent = horaireFormatted;
        document.getElementById('viewSessionSalle').textContent = session.salle || 'N/A';
        document.getElementById('viewSessionEnseignant').textContent = session.prenom_enseignant + " " + session.nom_enseignant || 'Non assigné';
        document.getElementById('viewSessionStatut').textContent = statutFormatted;
        document.getElementById('viewSessionDescription').textContent = session.description || 'Aucune description';

        // Gestion couleur statut
        const statutElement = document.getElementById('viewSessionStatut');
        statutElement.className = 'view-value';
        const statutClasses = {
            planifiée: 'status-planifiee',
            en_cours: 'status-en-cours',
            terminée: 'status-terminee',
            annulée: 'status-annulee'
        };
        if (statutClasses[session.statut]) statutElement.classList.add(statutClasses[session.statut]);

        // Ouvrir le modal
        viewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}
