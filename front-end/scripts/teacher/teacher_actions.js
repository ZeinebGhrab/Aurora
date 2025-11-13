import { deleteTeacher } from "./teacher_api.js";
import { renderTeachers, renderPagination } from "./teacher_render.js";
import { fillEditForm, fillViewModal } from "./teacher_form.js";
import { showNotification } from "../utils.js";

// État de pagination et filtrage
let currentState = {
    page: 1,
    limit: 4,
    filters: {
        search: '',
        statut: null
    }
};

export async function loadAndRenderTeachers(page = currentState.page) {
    const { getAllTeachers } = await import("./teacher_api.js");

    // Mettre à jour l'état actuel
    currentState.page = page;

    const { teachers, pagination } = await getAllTeachers(
        currentState.page,
        currentState.limit,
        currentState.filters
    );

    const container = document.querySelector(".teachers-grid");
    if (!container) {
        console.error("Container .teachers-grid introuvable !");
        return;
    }

    renderTeachers(teachers, container);

    // Pagination
    let paginationContainer = document.querySelector("#teachers-pagination");
    if (!paginationContainer) {
        paginationContainer = document.createElement("div");
        paginationContainer.id = "teachers-pagination";
        container.after(paginationContainer);
    }

    renderPagination(pagination, paginationContainer, loadAndRenderTeachers);

    updateStats(pagination);

}


export function handleTeacherActions() {
    const container = document.querySelector(".teachers-grid");
    if (!container) {
        console.error("Container .teachers-grid introuvable !");
        return;
    }
    
    container.addEventListener("click", async e => {
        const viewBtn = e.target.closest(".btn-view");
        const editBtn = e.target.closest(".btn-edit");
        const deleteBtn = e.target.closest(".btn-delete");

        if (viewBtn) {
            await fillViewModal(viewBtn.dataset.id);
            document.getElementById("viewTeacherModal").classList.add("active");
            document.body.style.overflow = "hidden";
        }

        if (editBtn) {
            await fillEditForm(editBtn.dataset.id);
            document.getElementById("editTeacherModal").classList.add("active");
            document.body.style.overflow = "hidden";
        }

        if (deleteBtn && confirm("Voulez-vous vraiment supprimer cet enseignant ?")) {
            const res = await deleteTeacher(deleteBtn.dataset.id);
            if (res.success) {
                showNotification("Enseignant supprimé !");
                await loadAndRenderTeachers();
            } else {
                showNotification("Erreur : " + res.message);
            }
        }
    });
}

export function initFilters() {
    const searchInput = document.querySelector(".search-box input");
    const statutSelect = document.getElementById("statutSelect");

    
    // Debounce pour la recherche
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                currentState.filters.search = e.target.value;
                currentState.page = 1;
                await loadAndRenderTeachers(1);
            }, 500);
        });
    }
    
    
    // Filtre par statut
    if (statutSelect) {
        statutSelect.addEventListener("change", async (e) => {
            const value = e.target.value;
            currentState.filters.statut = value !== "" ? value : null;
            currentState.page = 1;
            await loadAndRenderTeachers(1);
        });
    }
}

// Mettre à jour les statistiques
function updateStats(pagination) {
    const totalElement = document.querySelector(".stat-card:first-child .stat-number");
    if (totalElement && pagination.total) {
        totalElement.textContent = pagination.total.toLocaleString();
    }
}