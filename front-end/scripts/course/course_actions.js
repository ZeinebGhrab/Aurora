import { deleteCourse, getAllCourses } from "./course_api.js";
import { renderCourses} from "./course_render.js";
import { showNotification, renderPagination } from "../utils.js";

// État de pagination et filtrage
let currentState = {
    page: 1,
    limit: 6,
    filters: {
        search: '',
        filiere: null,
    }
};

// Charger et afficher les cours
export async function loadAndRenderCourses(page = 1) {
    currentState.page = page;

    const container = document.querySelector(".courses-grid");
    if (!container) return;

    container.innerHTML = "<div class='loading'>Chargement...</div>";

    const { courses, pagination } = await getAllCourses(
        currentState.page,
        currentState.limit,
        currentState.filters
    );

    renderCourses(courses, container);
    
    // Passer la fonction de callback pour gérer le changement de page
    const paginationContainer = document.getElementById('courses-pagination');
    if (paginationContainer) {
        renderPagination(pagination, paginationContainer, loadAndRenderCourses);
    }
    
    updateStats(pagination);
}

// Gérer les actions sur les cours (ouvrir modal, supprimer)
export function handleCourseActions() {
    const container = document.querySelector(".courses-grid");
    if (!container) {
        console.error("Container .courses-grid introuvable !");
        return;
    }

    container.addEventListener("click", async e => {
        const editBtn = e.target.closest(".btn-edit");
        const deleteBtn = e.target.closest(".btn-delete");

        if (editBtn) {
            const modal = document.getElementById("editCourseModal");
            if (modal) {
                modal.classList.add("active");
                document.body.style.overflow = "hidden";
            }
        }

        if (deleteBtn && confirm("Voulez-vous vraiment supprimer ce cours ?")) {
            const res = await deleteCourse(deleteBtn.dataset.id);
            if (res.success) {
                showNotification("Cours supprimé !");
                await loadAndRenderCourses(currentState.page);
            } else {
                showNotification("Erreur : " + res.message);
            }
        }
    });
}

// Initialiser les filtres
export function initFilters() {
    const searchInput = document.querySelector(".search-box input");
    const filiereSelect = document.getElementById("filiereSelect");

    let searchTimeout;

    if (searchInput) {
        searchInput.addEventListener("input", e => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                currentState.filters.search = e.target.value;
                currentState.page = 1;
                await loadAndRenderCourses(1);
            }, 500);
        });
    }

    if (filiereSelect) {
        filiereSelect.addEventListener("change", async e => {
            const value = e.target.value;
            currentState.filters.filiere = value && !isNaN(value) ? parseInt(value) : null;
            currentState.page = 1;
            await loadAndRenderCourses(1);
        });
    }
}

// Mettre à jour les statistiques
function updateStats(pagination) {
    const totalElement = document.querySelector(".stat-card:first-child .stat-number");
    if (totalElement && pagination.total) {
        totalElement.textContent = pagination.total.toLocaleString();
    }
    const totalElementActive = document.querySelector(".stat-card:nth-child(2) .stat-number");
    if (totalElementActive && pagination.total) {
        totalElementActive.textContent = pagination.total.toLocaleString();
    }
}