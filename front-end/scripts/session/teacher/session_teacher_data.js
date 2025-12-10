import { getSessionsByTeacher } from "../session_api.js";
import { renderPagination, initUser } from "../../utils.js";
import { renderSessions, showEmptyState } from "./session_teacher_render.js";

let seancesData = [];
let currentPage = 1;
const limit = 6;

const filterStatus = document.getElementById('filterStatus');
const filterCourse = document.getElementById('filterCourse');
const searchInput = document.getElementById('searchSeance');
const paginationContainer = document.getElementById('sessions-pagination');

export async function initSessions() {
    initUser();
    await loadCourseFilter();
    await loadSessions();
    setupEventListeners();
}

export async function loadCourseFilter() {
    if (!filterCourse) return;

    try {
        const data = await getSessionsByTeacher(currentPage, limit, {}); 
        if (!data.sessions) return;

        seancesData = data.sessions.map(s => ({
            ...s,
            cours: s.nom_cours ?? "Cours inconnu"
        }));

        const courses = [...new Map(seancesData.map(s => [s.id_cours, s.nom_cours])).entries()];
        filterCourse.innerHTML = '<option value="all">Tous les cours</option>';
        courses.forEach(([id_cours, nom_cours]) => {
            const option = document.createElement('option');
            option.value = id_cours;
            option.textContent = nom_cours;
            filterCourse.appendChild(option);
        });
    } catch (err) {
        console.error("Erreur chargement cours :", err);
    }
}

export async function loadSessions(page = 1) {
    currentPage = page;

    const filters = {
        page,
        limit,
        cours: filterCourse?.value && filterCourse.value !== 'all' ? parseInt(filterCourse.value) : null,
        statut: filterStatus?.value || "",
        search: searchInput?.value.trim() || ''
    };

    try {
        const { sessions, pagination } = await getSessionsByTeacher(currentPage, limit, filters);
        seancesData = sessions;
        renderSessions(seancesData);
        renderPagination(pagination, paginationContainer, loadSessions);
    } catch (err) {
        console.error("Erreur chargement séances :", err);
        showEmptyState();
    }
}

function applyFilters() {
    currentPage = 1;
    loadSessions();
}

function setupEventListeners() {
    filterStatus?.addEventListener('change', applyFilters);
    filterCourse?.addEventListener('change', applyFilters);
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchInput._timeout);
        searchInput._timeout = setTimeout(applyFilters, 300);
    });
}
