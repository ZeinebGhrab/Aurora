import { initModal } from "./teacher_modal.js";
import { populateTeacherForm } from "./teacher_utils.js";
import { handleFormSubmit } from "./teacher_form.js";
import { handleTeacherActions, loadAndRenderTeachers, initFilters } from "./teacher_actions.js";
import { loadAndDisplayStats } from "./teacher_stats.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Initialiser les modals
    const newModal = initModal("newTeacherModal", "newTeacherForm");
    const editModal = initModal("editTeacherModal", "editTeacherForm");
    initModal("viewTeacherModal");

    // Peupler les formulaires avec les filières
    await populateTeacherForm("newTeacherForm");
    await populateTeacherForm("editTeacherForm");
    
    // Gérer les soumissions de formulaires
    handleFormSubmit("newTeacherForm", newModal);
    handleFormSubmit("editTeacherForm", editModal);
    
    // Charger et afficher les enseignants avec pagination
    await loadAndRenderTeachers();
    
    // Charger et afficher les statistiques
    await loadAndDisplayStats();
    
    // Gérer les actions (voir, modifier, supprimer)
    handleTeacherActions();

    // Initialiser les filtres
    initFilters();
    
    // Gérer le bouton "Nouvel Enseignant"
    document.querySelector(".btn-new-teacher").addEventListener("click", () => {
        newModal.classList.add("active");
        document.body.style.overflow = "hidden";
    });
});
