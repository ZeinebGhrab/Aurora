import { addSession } from "./session_api.js";
import { getAllCourses, getAllTeachers } from "../course/course_api.js";
import { showNotification } from '../utils.js';

// Populer le select "Cours" et "Enseignant" dans le modal de nouvelle séance
export async function populateSelects() {
    try {
        // Charger les cours
        const resC = await getAllCourses();
        let courses = [];
        if (Array.isArray(resC)) courses = resC;
        else if (resC?.courses) courses = resC.courses;
        else if (resC?.data) courses = resC.data;

        const courseSelect = document.getElementById("seanceCours");
        if (!courseSelect) return;

        courseSelect.innerHTML = '<option value="">Sélectionner un cours...</option>';
        if (!courses.length) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Aucun cours disponible";
            option.disabled = true;
            courseSelect.appendChild(option);
        } else {
            courses.forEach(c => {
                const option = document.createElement("option");
                option.value = c.id_cours;
                option.textContent = `${c.nom_cours} - ${c.code_cours}`;
                courseSelect.appendChild(option);
            });
        }

        // Charger les enseignants
        const resT = await getAllTeachers();
        let teachers = [];
        if (Array.isArray(resT)) teachers = resT;
        else if (resT?.teachers) teachers = resT.teachers;
        else if (resT?.data) teachers = resT.data;

        const teacherFilterSelect = document.getElementById("teacherSelect");
        if (teacherFilterSelect && Array.isArray(teachers)) {
            teacherFilterSelect.innerHTML = '<option value="">Tous les enseignants</option>';
            teachers.forEach(t => {
                const option = document.createElement("option");
                option.value = t.id_utilisateur;
                option.textContent = `${t.prenom} ${t.nom}`;
                teacherFilterSelect.appendChild(option);
            });
        }

        // Charger les cours pour le filtre
        const courseFilterSelect = document.getElementById("courseSelect");
        if (courseFilterSelect && Array.isArray(courses)) {
            courseFilterSelect.innerHTML = '<option value="">Tous les cours</option>';
            courses.forEach(c => {
                const option = document.createElement("option");
                option.value = c.id_cours;
                option.textContent = c.nom_cours;
                courseFilterSelect.appendChild(option);
            });
        }
    } catch (err) {
        console.error("Erreur populateSelects:", err);
    }
}

// Gérer la soumission du formulaire
export function handleFormSubmit() {
    const form = document.getElementById("newSessionForm");
    if (!form) return;

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const formData = {
            id_cours: parseInt(form.id_cours.value) || null,
            titre: form.titre.value || "",
            date: form.date.value || "",
            heure_debut: form.heure_debut.value || "",
            heure_fin: form.heure_fin.value || "",
            salle: form.salle.value || "",
            description: form.description.value || "",
            statut: form.statut.value || "planifiée"
        };

        // Validation côté client
        if (!formData.id_cours) return showNotification("Veuillez sélectionner un cours");
        if (!formData.titre) return showNotification("Veuillez saisir un titre");
        if (!formData.date) return showNotification("Veuillez sélectionner une date");
        if (!formData.heure_debut || !formData.heure_fin) return showNotification("Veuillez saisir les horaires");
        if (!formData.salle) return showNotification("Veuillez saisir une salle");

        // Date et heures
        const debut = new Date(`${formData.date}T${formData.heure_debut}`);
        const fin = new Date(`${formData.date}T${formData.heure_fin}`);
        const now = new Date();
        const duree = Math.round((fin - debut) / (1000 * 60));

        // Vérification date et heure dans le futur
        if (debut <= now) return showNotification("La date et l'heure de début doivent être dans le futur");
        if (duree <= 0) return showNotification("L'heure de fin doit être après l'heure de début");

        // Préparer les données pour l'API backend
        const date_heure = `${formData.date} ${formData.heure_debut}:00`;
        const heure_fin_time = `${formData.heure_fin}:00`;

        const data = {
            id_cours: formData.id_cours,
            titre: formData.titre,
            date_heure: date_heure,
            duree: duree,
            heure_fin: heure_fin_time,
            salle: formData.salle,
            description: formData.description,
            statut: formData.statut
        };

        try {
            const res = await addSession(data);
            if (res.success) {
                showNotification("Séance ajoutée avec succès !");
                form.reset();
                const modal = document.getElementById("newSessionModal");
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
                window.location.reload();
            } else {
                showNotification("Erreur : " + (res.message || "Une erreur est survenue"));
            }
        } catch (err) {
            console.error("Erreur ajout séance:", err);
            showNotification("Erreur lors de l'ajout de la séance: " + err.message);
        }
    });
}
