import { deletePresence, getAllPresences } from "./presence_api.js";
import { renderPresences } from "./presence_render.js";
import { showNotification, renderPagination } from "../utils.js";
import { getAllCourses } from "../course/course_api.js";

let currentState = {
    page: 1,
    limit: 6,
    filters: {
        filiere: '',
        statut: null,
        id_cours: null,
        niveau: '',
    }
};

// Charger et afficher les présences 
export async function loadAndRenderPresences(page = 1) {
    currentState.page = page;
    const container = document.querySelector(".presence-grid");
    if (!container) return;

    container.innerHTML = "<div class='loading'>Chargement...</div>";

    const { presences, pagination } = await getAllPresences(currentState.page, currentState.limit, currentState.filters);

    renderPresences(presences, container);

    const paginationContainer = document.getElementById('presence-pagination');
    if (paginationContainer) {
        renderPagination(pagination, paginationContainer, loadAndRenderPresences);
    }

    updateStats(pagination);
}

// Charger les cours dans le <select> 
export async function loadCourses() {
    const courseSelect = document.getElementById("courseSelect");
    if (!courseSelect) return;

    try {
        const { courses } = await getAllCourses(); // récupère tous les cours
        courses.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id_cours;
            option.textContent = `${c.nom_cours} (${c.code_cours})`;
            courseSelect.appendChild(option);
        });
    } catch (err) {
        console.error("Erreur lors du chargement des cours :", err);
    }
}

// Actions sur les présences (edit / delete) 
export function handlePresenceActions() {
    const container = document.querySelector(".presence-grid");
    if (!container) return;

    container.addEventListener("click", async e => {
        const editBtn = e.target.closest(".btn-edit");
        const deleteBtn = e.target.closest(".btn-delete");

        if (editBtn) {
            const modal = document.getElementById("editPresenceModal");
            if (modal) {
                modal.classList.add("active");
                document.body.style.overflow = "hidden";
            }
        }

        if (deleteBtn && confirm("Voulez-vous vraiment supprimer cette séance ?")) {
            const res = await deletePresence(deleteBtn.dataset.id);
            if (res.success) {
                showNotification("Séance supprimée !");
                await loadAndRenderPresences(currentState.page);
            } else {
                showNotification("Erreur : " + res.message);
            }
        }
    });
}

// Initialisation des filtres 
export function initFilters() {
    const searchInput = document.getElementById("studentInput");
    const statutSelect = document.getElementById("statutSelect");
    const courseSelect = document.getElementById("courseSelect");
    const filiereSelect = document.getElementById("filiereSelect");
    const niveauSelect = document.getElementById("niveauSelect");

    let searchTimeout;

    if (searchInput) {
        searchInput.addEventListener("input", e => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                currentState.filters.etudiant = e.target.value.trim();
                currentState.page = 1;
                await loadAndRenderPresences(1);
            }, 500);
        });
    }

    if (statutSelect) {
        statutSelect.addEventListener("change", async e => {
            currentState.filters.statut = e.target.value || null;
            currentState.page = 1;
            await loadAndRenderPresences(1);
        });
    }

    if (courseSelect) {
        courseSelect.addEventListener("change", async e => {
            currentState.filters.id_cours = e.target.value ? parseInt(e.target.value) : null;
            currentState.page = 1;
            await loadAndRenderPresences(1);
        });
    }

    if (filiereSelect) {
        filiereSelect.addEventListener("change", async e => {
            currentState.filters.filiere = e.target.value ? parseInt(e.target.value) : null;
            currentState.page = 1;
            await loadAndRenderPresences(1);
        });
    }

    if (niveauSelect) {
        niveauSelect.addEventListener("change", async e => {
            currentState.filters.niveau = e.target.value || null; // ← corrigé
            currentState.page = 1;
            await loadAndRenderPresences(1);
        });
    }
}


// ==================== Mettre à jour les statistiques ====================
function updateStats(pagination) {
    const totalElement = document.querySelector(".stat-card:first-child .stat-number");
    if (totalElement && pagination.total) totalElement.textContent = pagination.total.toLocaleString();

    const activeElement = document.querySelector(".stat-card:nth-child(2) .stat-number");
    if (activeElement && pagination.totalActive) activeElement.textContent = pagination.totalActive.toLocaleString();
}

