import { populateSelects, handleFormSubmit } from "./course_form.js";
import { handleCourseActions, initFilters, loadAndRenderCourses } from "./course_actions.js";
import { initCourseModal } from "./course_modal.js"; 
import { initViewCourseModal } from "./course_view_modal.js"; 
import { initEditCourseModal } from './course_edit_modal.js';

document.addEventListener("DOMContentLoaded", async () => {
    
    initCourseModal();
    initViewCourseModal();
    initEditCourseModal(); 

    try {
        // Charger les cours avec pagination
        await loadAndRenderCourses(1);

        // Populer selects et gérer le formulaire
        await populateSelects();
        handleFormSubmit();

        // Gérer suppression et modification
        handleCourseActions();

        // Initialiser les filtres
        initFilters();
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
});