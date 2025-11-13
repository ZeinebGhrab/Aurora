import { initModal } from "./student_modal.js";
import { populateStudentForm } from "./student_utils.js";
import { handleFormSubmit } from "./student_form.js";
import { handleStudentActions, loadAndRenderStudents, initFilters } from "./student_actions.js";
import { loadAndDisplayStats } from "./student_stats.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Initialiser les modals
    const newModal = initModal("newStudentModal", "newStudentForm");
    const editModal = initModal("editStudentModal", "editStudentForm");
    initModal("viewStudentModal");

    try {
        // Peupler les formulaires avec les filières
        await populateStudentForm("newStudentForm");
        await populateStudentForm("editStudentForm");

        // Gérer les soumissions de formulaires
        handleFormSubmit("newStudentForm", newModal);
        handleFormSubmit("editStudentForm", editModal);

        // Charger et afficher les étudiants avec pagination
        await loadAndRenderStudents(1);

        // Charger et afficher les statistiques
        await loadAndDisplayStats();

        // Gérer les actions (voir, modifier, supprimer)
        handleStudentActions();

        // Initialiser les filtres
        initFilters();

        // Gérer le bouton "Nouvel Étudiant"
        document.querySelector(".btn-new-student").addEventListener("click", () => {
            newModal.classList.add("active");
            document.body.style.overflow = "hidden";
        });

    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
});