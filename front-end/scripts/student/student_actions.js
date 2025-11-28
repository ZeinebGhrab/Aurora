import { deleteStudent, getAllStudents } from "./student_api.js";
import { renderStudents } from "./student_render.js";
import { fillEditForm, fillViewModal } from "./student_form.js";
import { showNotification, renderPagination } from "../utils.js";

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

// Charger et afficher les étudiants
export async function loadAndRenderStudents(page = 1) {
    currentState.page = page;

    const container = document.querySelector(".students-grid");
    if (!container) {
        console.error("Container .students-grid introuvable !");
        return;
    }

    container.innerHTML = "<div class='loading'>Chargement...</div>";

    try {
        const { students, pagination } = await getAllStudents(
            currentState.page,
            currentState.limit,
            currentState.filters
        );

        renderStudents(students, container);

        const paginationContainer = document.getElementById("students-pagination");
        if (paginationContainer) {
            renderPagination(pagination, paginationContainer);
        }

        updateStats(pagination);
    } catch (error) {
        console.error("Erreur lors du chargement des étudiants :", error);
        container.innerHTML = "<div class='error'>Erreur lors du chargement.</div>";
    }
}

// Gérer les actions sur les étudiants
export function handleStudentActions() {
    const container = document.querySelector(".students-grid");
    if (!container) {
        console.error("Container .students-grid introuvable !");
        return;
    }

    // Actions voir, modifier, supprimer
    container.addEventListener("click", async e => {
        const viewBtn = e.target.closest(".btn-view");
        const editBtn = e.target.closest(".btn-edit");
        const deleteBtn = e.target.closest(".btn-delete");

        if (viewBtn) {
            await fillViewModal(viewBtn.dataset.id);
            const modal = document.getElementById("viewStudentModal");
            if (modal) {
                modal.classList.add("active");
                document.body.style.overflow = "hidden";
            }
        }

        if (editBtn) {
            await fillEditForm(editBtn.dataset.id);
            const modal = document.getElementById("editStudentModal");
            if (modal) {
                modal.classList.add("active");
                document.body.style.overflow = "hidden";
            }
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

    // Pagination
    const paginationContainer = document.getElementById("students-pagination");
    if (paginationContainer) {
        paginationContainer.addEventListener("click", async e => {
            const btn = e.target.closest(".pagination-btn");
            if (btn) {
                const page = parseInt(btn.dataset.page);
                if (!isNaN(page)) {
                    await loadAndRenderStudents(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });
    }
}

// Initialiser les filtres
export function initFilters() {
    const searchInput = document.querySelector(".search-box input");
    const filiereSelect = document.getElementById("filiereSelect");
    const niveauSelect = document.getElementById("niveauSelect");

    // Recherche avec debounce
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

// Mettre à jour les statistiques
function updateStats(pagination) {
    const totalElement = document.querySelector(".stat-card:first-child .stat-number");
    const activeElement = document.querySelector(".stat-card:nth-child(2) .stat-number");
    const newElement = document.querySelector(".stat-card:nth-child(3) .stat-number");

    if (totalElement && pagination?.total_students != null) {
        totalElement.textContent = pagination.total_students.toLocaleString();
    }
    if (activeElement && pagination?.active_students != null) {
        activeElement.textContent = pagination.active_students.toLocaleString();
    }
    if (newElement && pagination?.new_students != null) {
        newElement.textContent = pagination.new_students.toLocaleString();
    }
}
