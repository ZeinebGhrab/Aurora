import { populateSelects, handleFormSubmit } from "./session_form.js";
import { handleSessionActions, initFilters, loadAndRenderSessions } from "./session_actions.js";
import { initSessionModal } from "./session_modal.js";
import { initEditSessionModal } from "./session_edit_modal.js";
import { initViewSessionModal } from "./session_view_modal.js";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM chargé - Initialisation des séances");

    try {
        // Initialiser les modals AVANT de populer les selects
        initSessionModal();
        
        await initEditSessionModal();

        initViewSessionModal();
        console.log("Modal visualisation initialisé");

        // Attendre un peu pour s'assurer que les modals sont dans le DOM
        await new Promise(resolve => setTimeout(resolve, 100));

        // Maintenant populer les selects
        await populateSelects();
        console.log("Selects populés");

        // Gérer le formulaire
        handleFormSubmit();
        console.log("Formulaire configuré");

        // Charger les séances avec pagination
        await loadAndRenderSessions(1);
        console.log("Séances chargées");

        // Gérer suppression et modification
        handleSessionActions();
        console.log("Actions configurées");

        // Initialiser les filtres
        initFilters();
        console.log("Filtres initialisés");

    } catch (error) {
        console.error('Erreur lors de l\'initialisation des séances:', error);
    }
});