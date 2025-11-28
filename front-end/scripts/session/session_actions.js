import { deleteSession, getAllSessions } from "./session_api.js";
import { renderSessions } from "./session_render.js";
import { showNotification, renderPagination } from "../utils.js";

let currentState = {
    page: 1,
    limit: 6,
    filters: {
        search: '',
        teacher: null,
        course: null,
        date: null
    }
};

export async function loadAndRenderSessions(page = 1) {
    currentState.page = page;
    const container = document.querySelector(".sessions-grid");
    if (!container) return;

    container.innerHTML = "<div class='loading'>Chargement...</div>";

    const { sessions, pagination } = await getAllSessions(currentState.page, currentState.limit, currentState.filters);

    renderSessions(sessions, container);

    const paginationContainer = document.getElementById('sessions-pagination');
    if (paginationContainer) {
        renderPagination(pagination, paginationContainer, loadAndRenderSessions);
    }

    updateStats(pagination);
}

export function handleSessionActions() {
    const container = document.querySelector(".sessions-grid");
    if (!container) return;

    container.addEventListener("click", async e => {
        const editBtn = e.target.closest(".btn-edit");
        const deleteBtn = e.target.closest(".btn-delete");

        if (editBtn) {
            const modal = document.getElementById("editSessionModal");
            if (modal) {
                modal.classList.add("active");
                document.body.style.overflow = "hidden";
            }
        }

        if (deleteBtn && confirm("Voulez-vous vraiment supprimer cette séance ?")) {
            const res = await deleteSession(deleteBtn.dataset.id);
            if (res.success) {
                showNotification("Séance supprimée !");
                await loadAndRenderSessions(currentState.page);
            } else {
                showNotification("Erreur : " + res.message);
            }
        }
    });
}

export function initFilters() {
    const searchInput = document.querySelector(".search-box input");
    const teacherSelect = document.getElementById("teacherSelect");
    const courseSelect = document.getElementById("courseSelect");
    const dateInput = document.getElementById("dateSelect");

    let searchTimeout;

    if (searchInput) {
        searchInput.addEventListener("input", e => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                currentState.filters.search = e.target.value;
                currentState.page = 1;
                await loadAndRenderSessions(1);
            }, 500);
        });
    }

    if (teacherSelect) {
        teacherSelect.addEventListener("change", async e => {
            currentState.filters.enseignant = e.target.value ? parseInt(e.target.value) : null;
            currentState.page = 1;
            await loadAndRenderSessions(1);
        });
    }

    if (courseSelect) {
       courseSelect.addEventListener("change", async e => {
            currentState.filters.cours = e.target.value ? parseInt(e.target.value) : null;
            currentState.page = 1;
            await loadAndRenderSessions(1);
        });
    } 

    if (dateInput) {
        dateInput.addEventListener("change", async e => {
            currentState.filters.date = e.target.value || null;
            currentState.page = 1;
            await loadAndRenderSessions(1);
        });
    }
}

// Mettre à jour les statistiques
function updateStats(pagination) {
    const totalElement = document.querySelector(".stat-card:first-child .stat-number");
    if (totalElement && pagination.total) totalElement.textContent = pagination.total.toLocaleString();

    const activeElement = document.querySelector(".stat-card:nth-child(2) .stat-number");
    if (activeElement && pagination.totalActive) activeElement.textContent = pagination.totalActive.toLocaleString();
}
