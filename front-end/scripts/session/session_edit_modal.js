import { getSessionById, updateSession } from './session_api.js';
import { getAllCourses } from "../course/course_api.js";
import { showNotification } from '../utils.js';

// Populer select cours et enseignants dans le modal
async function populateEditSelects() {
    try {
        console.log("Début de populateEditSelects");
        
        // Charger les cours
        const resC = await getAllCourses();
        console.log("Réponse getAllCourses pour edit:", resC);
        
        // Gérer différents formats de réponse
        let courses = [];
        if (Array.isArray(resC)) {
            courses = resC;
        } else if (resC && resC.courses) {
            courses = resC.courses;
        } else if (resC && resC.data) {
            courses = resC.data;
        }
        
        console.log("Cours pour edit:", courses);

        const courseSelect = document.getElementById("editCourse");
        console.log("Element editCourse:", courseSelect);
        
        if (courseSelect) {
            courseSelect.innerHTML = '<option value="">Sélectionner un cours...</option>';
            
            if (Array.isArray(courses) && courses.length > 0) {
                courses.forEach(c => {
                    const option = document.createElement("option");
                    option.value = c.id_cours;
                    option.textContent = c.nom_cours + " - " + c.code_cours;
                    courseSelect.appendChild(option);
                });
                console.log("Options de cours ajoutées:", courseSelect.options.length);
            } else {
                console.warn("Aucun cours disponible pour le modal d'édition");
            }
        } else {
            console.error("Element editCourse non trouvé");
        }

    } catch (err) {
        console.error("Erreur populateEditSelects:", err);
    }
}

export async function initEditSessionModal() {
    const editModal = document.getElementById('editSessionModal');
    const editForm = document.getElementById('editSessionForm');
    
    if (!editModal || !editForm) {
        console.error("Modal d'édition ou formulaire introuvable");
        return;
    }

    // Fonction pour fermer le modal
    const closeModal = () => {
        editModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Sélectionner tous les boutons de fermeture dans le modal d'édition
    const closeModalBtns = editModal.querySelectorAll('.modal-close, .btn-cancel, .close-modal');
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            closeModal();
        });
    });

    // Fermer en cliquant sur l'overlay
    editModal.addEventListener('click', e => {
        if (e.target === editModal) {
            closeModal();
        }
    });

    // Fermer avec la touche Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && editModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Populer les selects
    await populateEditSelects();

    // Ouvrir le modal quand on clique sur le bouton Edit
    document.addEventListener('click', async e => {
        const btn = e.target.closest('.btn-edit');
        if (!btn) return;

        const session = await getSessionById(btn.dataset.id);
        if (!session) {
            showNotification("Impossible de récupérer la séance.");
            return;
        }

        console.log("Séance à éditer:", session);

        // Extraire date et heures depuis date_heure
        let date = '';
        let heure_debut = '';
        let heure_fin = '';

        if (session.date_heure) {
            // Format attendu: "YYYY-MM-DD HH:MM:SS"
            const parts = session.date_heure.split(' ');
            date = parts[0]; // "YYYY-MM-DD"
            heure_debut = parts[1] ? parts[1].substring(0, 5) : ''; // "HH:MM"
        }

        // heure_fin est stocké comme TIME dans la BD: "HH:MM:SS"
        if (session.heure_fin) {
            // Si format "HH:MM:SS", prendre juste "HH:MM"
            heure_fin = session.heure_fin.substring(0, 5);
        }

        // Remplir le formulaire avec les données de la session
        document.getElementById('editSessionId').value = session.id_seance;
        document.getElementById('editTitre').value = session.titre || "";
        document.getElementById('editDescription').value = session.description || "";
        document.getElementById('editDate').value = date;
        document.getElementById('editHeureDebut').value = heure_debut;
        document.getElementById('editHeureFin').value = heure_fin;
        document.getElementById('editStatut').value = session.statut || "planifiée";
        document.getElementById('editSalle').value = session.salle || "";

        // Sélection du cours
        const courseSelect = document.getElementById('editCourse');
        if (courseSelect && session.id_cours) {
            courseSelect.value = session.id_cours;
        }

        editModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Gérer la soumission du formulaire
    editForm.addEventListener('submit', async e => {
        e.preventDefault();
        
        // Récupérer les données brutes
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

        console.log("Données brutes du formulaire d'édition:", formData);

        // Validation
        if (!formData.id_cours) {
            showNotification("Veuillez sélectionner un cours");
            return;
        }
        if (!formData.titre) {
            showNotification("Veuillez saisir un titre");
            return;
        }
        if (!formData.date || !formData.heure_debut || !formData.heure_fin) {
            showNotification("Veuillez remplir tous les champs obligatoires");
            return;
        }
        if (!formData.salle) {
            showNotification("Veuillez saisir une salle");
            return;
        }

        // Transformer les données pour le backend
        const date_heure = `${formData.date} ${formData.heure_debut}:00`;
        
        // Calculer la durée en minutes
        const debut = new Date(`${formData.date}T${formData.heure_debut}`);
        const fin = new Date(`${formData.date}T${formData.heure_fin}`);
        const duree = Math.round((fin - debut) / (1000 * 60));

        if (duree <= 0) {
            showNotification("L'heure de fin doit être après l'heure de début");
            return;
        }

        // heure_fin est stockée comme TIME dans la BD, donc envoyer juste "HH:MM:SS"
        const heure_fin_time = `${formData.heure_fin}:00`;

        // Données formatées pour l'API
        const data = {
            id_cours: formData.id_cours,
            titre: formData.titre,
            description: formData.description,
            date_heure: date_heure,
            duree: duree,
            heure_fin: heure_fin_time,  // Format TIME: "HH:MM:SS"
            salle: formData.salle,
            statut: formData.statut
        };

        console.log("Données transformées pour updateSession:", data);

        const res = await updateSession(formData.id_seance, data);
        
        if (res.success) {
            showNotification("Séance modifiée avec succès !");
            closeModal();
            window.location.reload();
        } else {
            showNotification("Erreur : " + res.message);
            if (res.rawResponse) {
                console.error("Réponse brute:", res.rawResponse);
            }
        }
    });
}