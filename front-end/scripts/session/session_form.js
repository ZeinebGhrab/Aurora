import { addSession } from "./session_api.js";
import { getAllCourses, getAllTeachers } from "../course/course_api.js";
import { showNotification } from '../utils.js';

// Populer le select "Cours" et "Enseignant" dans le modal de nouvelle séance
export async function populateSelects() {
    try {
        // Charger les cours
        const resC = await getAllCourses();
        console.log("Réponse getAllCourses:", resC);
        
        // Gérer différents formats de réponse
        let courses = [];
        if (Array.isArray(resC)) {
            courses = resC;
        } else if (resC && resC.courses) {
            courses = resC.courses;
        } else if (resC && resC.data) {
            courses = resC.data;
        }
        
        console.log("Cours trouvés:", courses);

        const courseSelect = document.getElementById("seanceCours");
        console.log("Element seanceCours:", courseSelect);
        
        if (!courseSelect) {
            console.error("Element seanceCours non trouvé dans le DOM");
            return;
        }
        
        courseSelect.innerHTML = '<option value="">Sélectionner un cours...</option>';
        
        if (!Array.isArray(courses) || courses.length === 0) {
            console.warn("Aucun cours disponible");
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Aucun cours disponible";
            option.disabled = true;
            courseSelect.appendChild(option);
            return;
        }
        
        courses.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id_cours;
            option.textContent = c.nom_cours + " - " + c.code_cours;
            courseSelect.appendChild(option);
        });
        console.log("Nombre d'options ajoutées:", courseSelect.options.length);

        // Charger les enseignants pour les filtres
        const resT = await getAllTeachers();
        console.log("Réponse getAllTeachers:", resT);
        
        // Gérer différents formats de réponse
        let teachers = [];
        if (Array.isArray(resT)) {
            teachers = resT;
        } else if (resT && resT.teachers) {
            teachers = resT.teachers;
        } else if (resT && resT.data) {
            teachers = resT.data;
        }
        
        console.log("Enseignants trouvés:", teachers);

        const teacherFilterSelect = document.getElementById("teacherSelect");
        if (teacherFilterSelect && Array.isArray(teachers)) {
            teacherFilterSelect.innerHTML = '<option value="">Tous les enseignants</option>';
            teachers.forEach(t => {
                const option = document.createElement("option");
                option.value = t.id_utilisateur;
                option.textContent = `${t.prenom} ${t.nom}`;
                teacherFilterSelect.appendChild(option);
            });
            console.log("Filtre enseignants peuplé:", teacherFilterSelect.options.length);
        }

        // Charger les cours pour les filtres
        const courseFilterSelect = document.getElementById("courseSelect");
        if (courseFilterSelect && Array.isArray(courses)) {
            courseFilterSelect.innerHTML = '<option value="">Tous les cours</option>';
            courses.forEach(c => {
                const option = document.createElement("option");
                option.value = c.id_cours;
                option.textContent = c.nom_cours;
                courseFilterSelect.appendChild(option);
            });
            console.log("Filtre cours peuplé:", courseFilterSelect.options.length);
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

        // Récupérer les données brutes du formulaire
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

        console.log("Données brutes du formulaire:", formData);

        // Validation côté client
        if (!formData.id_cours) {
            showNotification("Veuillez sélectionner un cours");
            return;
        }
        if (!formData.titre) {
            showNotification("Veuillez saisir un titre");
            return;
        }
        if (!formData.date) {
            showNotification("Veuillez sélectionner une date");
            return;
        }
        if (!formData.heure_debut || !formData.heure_fin) {
            showNotification("Veuillez saisir les horaires");
            return;
        }
        if (!formData.salle) {
            showNotification("Veuillez saisir une salle");
            return;
        }

        // Transformer les données pour le backend
        // Combiner date + heure_debut en date_heure (format: YYYY-MM-DD HH:MM:SS)
        const date_heure = `${formData.date} ${formData.heure_debut}:00`;
        
        // Calculer la durée en minutes
        const debut = new Date(`${formData.date}T${formData.heure_debut}`);
        const fin = new Date(`${formData.date}T${formData.heure_fin}`);
        const duree = Math.round((fin - debut) / (1000 * 60)); // différence en minutes

        if (duree <= 0) {
            showNotification("L'heure de fin doit être après l'heure de début");
            return;
        }

        // Préparer les données pour l'API backend
        const data = {
            id_cours: formData.id_cours,
            titre: formData.titre,
            date_heure: date_heure,
            duree: duree,
            heure_fin: `${formData.date} ${formData.heure_fin}:00`,
            salle: formData.salle,
            description: formData.description,
            statut: formData.statut
        };

        console.log("Données transformées pour le backend:", data);

        try {
            const res = await addSession(data);
            console.log("Réponse addSession:", res);
            
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
                const errorMsg = res.message || "Une erreur est survenue";
                console.error("Erreur détaillée:", res);
                showNotification("Erreur : " + errorMsg);
                
            }
        } catch (err) {
            console.error("Erreur ajout séance:", err);
            showNotification("Erreur lors de l'ajout de la séance: " + err.message);
        }
    });
}