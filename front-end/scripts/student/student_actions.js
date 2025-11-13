import { deleteStudent, getAllStudents } from "./student_api.js";
import { renderStudents, renderPagination } from "./student_render.js";
import { fillEditForm, fillViewModal } from "./student_form.js";
import { showNotification } from "../utils.js";

// État de pagination et filtrage
let currentState = {
    page: 1,
    limit: 6,
    filters: {
        search: '',
        filiere: null,
        niveau: null
    }
};

export async function loadAndRenderStudents(page = 1) {
    currentState.page = page;

    const container = document.querySelector(".students-grid");
    if (!container) return;

    container.innerHTML = "<div class='loading'>Chargement...</div>";

    const { students, pagination } = await getAllStudents(
        currentState.page,
        currentState.limit,
        currentState.filters
    );

    renderStudents(students, container);
    renderPagination(pagination, container.parentElement);
    updateStats(pagination);
}

export function handleStudentActions() {
    const container = document.querySelector(".students-grid");
    if (!container) {
        console.error("Container .students-grid introuvable !");
        return;
    }
    
    container.addEventListener("click", async e => {
        const viewBtn = e.target.closest(".btn-view");
        const editBtn = e.target.closest(".btn-edit");
        const deleteBtn = e.target.closest(".btn-delete");

        if (viewBtn) {
            await fillViewModal(viewBtn.dataset.id);
            document.getElementById("viewStudentModal").classList.add("active");
            document.body.style.overflow = "hidden";
        }

        if (editBtn) {
            await fillEditForm(editBtn.dataset.id);
            document.getElementById("editStudentModal").classList.add("active");
            document.body.style.overflow = "hidden";
        }

        if (deleteBtn && confirm("Voulez-vous vraiment supprimer cet étudiant ?")) {
            const res = await deleteStudent(deleteBtn.dataset.id);
            if (res.success) {
                showNotification("Étudiant supprimé !");
                await loadAndRenderStudents(currentState.page);
            } else {
                showNotification("Erreur : " + res.message);
            }
        }
    });
    
    // Gérer la pagination
    document.addEventListener("click", async e => {
        if (e.target.closest(".pagination-btn")) {
            const btn = e.target.closest(".pagination-btn");
            const page = parseInt(btn.dataset.page);
            if (!isNaN(page)) {
                await loadAndRenderStudents(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });
}

export function initFilters() {
    const searchInput = document.querySelector(".search-box input");
    const filiereSelect = document.getElementById("filiereSelect");
    const niveauSelect = document.getElementById("niveauSelect");

    
    // Debounce pour la recherche
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                currentState.filters.search = e.target.value;
                currentState.page = 1;
                await loadAndRenderStudents(1);
            }, 500);
        });
    }
    
    // Filtre par filière
    if (filiereSelect) {
        filiereSelect.addEventListener("change", async (e) => {
            const value = e.target.value;
            currentState.filters.filiere = value && !isNaN(value) ? parseInt(value) : null;
            currentState.page = 1;
            await loadAndRenderStudents(1);
        });
    }
    
    // Filtre par niveau
    if (niveauSelect) {
        niveauSelect.addEventListener("change", async (e) => {
            currentState.filters.niveau = e.target.value || null;
            currentState.page = 1;
            await loadAndRenderStudents(1);
        });
    }
}

function updateStats(pagination) {
    const totalElement = document.querySelector(".stat-card:first-child .stat-number");
    if (totalElement && pagination.total_students) {
        totalElement.textContent = pagination.total_students.toLocaleString();
    }
}