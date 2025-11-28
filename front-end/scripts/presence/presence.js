import { loadAndRenderPresences, initFilters, handlePresenceActions, loadCourses } from "./presence_actions.js";


document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM chargé - Initialisation des présences");

    try {

        // Maintenant populer les selects
        await loadCourses();
        console.log("Selects populés");

        // Charger les présences avec pagination
        await loadAndRenderPresences(1);

        // Gérer suppression et modification
        handlePresenceActions();
        console.log("Actions configurées");

        // Initialiser les filtres
        initFilters();
        console.log("Filtres initialisés");

    } catch (error) {
        console.error('Erreur lors de l\'initialisation des présences:', error);
    }
});