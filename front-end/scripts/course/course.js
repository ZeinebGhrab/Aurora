// course.js
import { getAllCourses } from "./course_api.js";
import { renderCourses } from "./course_render.js";
import { populateSelects, handleFormSubmit } from "./course_form.js";
import { handleCourseActions } from "./course_actions.js";
import { initCourseModal } from "./course_modal.js"; 
import { initEditCourseModal } from './course_edit_modal.js';

document.addEventListener("DOMContentLoaded", async () => {
    
    initCourseModal();
    initEditCourseModal(); 

    const container = document.querySelector(".courses-grid");

    try {
        // Afficher tous les cours
        const courses = await getAllCourses();
        renderCourses(courses, container);

        // Populer selects et gérer le formulaire
        await populateSelects();
        handleFormSubmit();

        // Gérer suppression et modification
        handleCourseActions(container);
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
   
    }
});