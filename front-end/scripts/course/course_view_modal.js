import { getCourseById } from './course_api.js';
import { showNotification } from '../utils.js';

export function initViewCourseModal() {
    const viewModal = document.getElementById('viewCourseModal');
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

        const idCours= btn.dataset.id;
        if (!idCours) {
            showNotification("ID de la cours manquant.");
            return;
        }

        let course = null;
        try {
            course = await getCourseById(idCours);
            console.log(idCours);
        } catch (err) {
            console.error("Erreur lors de la récupération de cours:", err);
            showNotification("Impossible de récupérer le cours.");
            return;
        }

        if (!course) {
            showNotification("Cours introuvable.");
            return;
        }

        console.log("Cours à afficher:", course);

        // Remplir le modal
        document.getElementById('viewCoursCode').textContent = course.code_cours|| 'N/A';
        document.getElementById('viewCoursNom').textContent = course.nom_cours || 'N/A';
        document.getElementById('viewCoursEnseignant').textContent = course.prenom_enseignant + " " + course.nom_enseignant || 'Non assigné';
        document.getElementById('viewCoursMailEnseignant').textContent = course.mail_enseignant || 'N/A';
        document.getElementById('viewCoursNiveau').textContent = course.niveau || 'Aucun niveau';

        // Ouvrir le modal
        viewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}
