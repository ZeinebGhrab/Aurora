import { getSessionById, updateSession } from './session_api.js';
import { getAllCourses } from "../course/course_api.js";
import { showNotification } from '../utils.js';

// Populer select cours dans le modal
async function populateEditSelects() {
    try {
        const resC = await getAllCourses();
        let courses = [];

        if (Array.isArray(resC)) {
            courses = resC;
        } else if (resC && resC.courses) {
            courses = resC.courses;
        } else if (resC && resC.data) {
            courses = resC.data;
        }

        const courseSelect = document.getElementById("editCourse");
        if (courseSelect) {
            courseSelect.innerHTML = '<option value="">Sélectionner un cours...</option>';
            courses.forEach(c => {
                const option = document.createElement("option");
                option.value = c.id_cours;
                option.textContent = `${c.nom_cours} - ${c.code_cours}`;
                courseSelect.appendChild(option);
            });
        }
    } catch (err) {
        console.error("Erreur populateEditSelects:", err);
    }
}

export async function initEditSessionModal() {
    const editModal = document.getElementById('editSessionModal');
    const editForm = document.getElementById('editSessionForm');
    
    if (!editModal || !editForm) return;

    const closeModal = () => {
        editModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    const closeModalBtns = editModal.querySelectorAll('.modal-close, .btn-cancel, .close-modal');
    closeModalBtns.forEach(btn => btn.addEventListener('click', e => { e.preventDefault(); closeModal(); }));

    editModal.addEventListener('click', e => { if (e.target === editModal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && editModal.classList.contains('active')) closeModal(); });

    await populateEditSelects();

    // Ouverture du modal d'édition
    document.addEventListener('click', async e => {
        const btn = e.target.closest('.btn-edit');
        if (!btn) return;

        const session = await getSessionById(btn.dataset.id);
        if (!session) {
            return;
        }

        let date = '', heure_debut = '', heure_fin = '';
        if (session.date_heure) {
            const parts = session.date_heure.split(' ');
            date = parts[0];
            heure_debut = parts[1]?.substring(0, 5) || '';
        }
        if (session.heure_fin) heure_fin = session.heure_fin.substring(0, 5);

        document.getElementById('editSessionId').value = session.id_seance;
        document.getElementById('editTitre').value = session.titre || "";
        document.getElementById('editDescription').value = session.description || "";
        document.getElementById('editDate').value = date;
        document.getElementById('editHeureDebut').value = heure_debut;
        document.getElementById('editHeureFin').value = heure_fin;
        document.getElementById('editStatut').value = session.statut || "planifiée";
        document.getElementById('editSalle').value = session.salle || "";

        const courseSelect = document.getElementById('editCourse');
        if (courseSelect && session.id_cours) courseSelect.value = session.id_cours;

        editModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Soumission du formulaire
    editForm.addEventListener('submit', async e => {
        e.preventDefault();

        const formData = {
            id_seance: document.getElementById('editSessionId').value,
            titre: document.getElementById('editTitre').value,
            description: document.getElementById('editDescription').value,
            id_cours: Number(document.getElementById('editCourse').value) || null,
            salle: document.getElementById('editSalle').value || null,
            date: document.getElementById('editDate').value,
            heure_debut: document.getElementById('editHeureDebut').value,
            heure_fin: document.getElementById('editHeureFin').value,
            statut: document.getElementById('editStatut').value
        };

        // Validation obligatoire
        if (!formData.id_cours) return showNotification("Veuillez sélectionner un cours");
        if (!formData.titre) return showNotification("Veuillez saisir un titre");
        if (!formData.date || !formData.heure_debut || !formData.heure_fin) return showNotification("Veuillez remplir tous les champs obligatoires");
        if (!formData.salle) return showNotification("Veuillez saisir une salle");

        // Validation date et heure
        const [year, month, day] = formData.date.split('-').map(Number);
        const [hourDebut, minuteDebut] = formData.heure_debut.split(':').map(Number);
        const [hourFin, minuteFin] = formData.heure_fin.split(':').map(Number);

        const debut = new Date(year, month - 1, day, hourDebut, minuteDebut);
        const fin = new Date(year, month - 1, day, hourFin, minuteFin);
        const now = new Date();
        const duree = Math.round((fin - debut) / (1000 * 60));

        if (debut <= now) return showNotification("La date et l'heure de début doivent être dans le futur");
        if (duree <= 0) return showNotification("L'heure de fin doit être après l'heure de début");

        // Préparer données pour l'API
        const date_heure = `${formData.date} ${formData.heure_debut}:00`;
        const heure_fin_time = `${formData.heure_fin}:00`;

        const data = {
            id_cours: formData.id_cours,
            titre: formData.titre,
            description: formData.description,
            date_heure: date_heure,
            duree: duree,
            heure_fin: heure_fin_time,
            salle: formData.salle,
            statut: formData.statut
        };

        const res = await updateSession(formData.id_seance, data);
        if (res.success) {
            showNotification("Séance modifiée avec succès !");
            closeModal();
            window.location.reload();
        } else {
            showNotification("Erreur : " + res.message);
            if (res.rawResponse) console.error("Réponse brute:", res.rawResponse);
        }
    });
}
