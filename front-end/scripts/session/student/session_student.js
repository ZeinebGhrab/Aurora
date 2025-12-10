import { getSessionsByStudent, getStatsSessionsForStudents } from "../session_api.js";
import { renderPagination, initUser } from "../../utils.js";
import { renderSessions } from './session_student_render.js';
import { loadCourseFilter, getFilters } from './session_student_filters.js';
import { initUploadSubmit } from './session_student_upload_modal.js';
import { initViewModal, initViewButtons } from './session_student_view_modal.js';

document.addEventListener("DOMContentLoaded", async () => {

    initUser();

    const container = document.getElementById("sessionsContainer");
    const paginationContainer = document.getElementById("sessions-pagination");
    const filterStatus = document.getElementById("filterStatus");
    const filterCourse = document.getElementById("filterCourse");
    const searchInput = document.getElementById("searchSeance");

    if (!container || !paginationContainer) return;

    let currentPage = 1;
    const limit = 6;

     // Charger les statistiques
    async function loadSessionsStats() {
        try {
            const stats = await getStatsSessionsForStudents();
            console.log(stats);

            document.getElementById("totalSeances").textContent = stats.terminées + stats.en_cours + stats.à_venir ?? 0;
            document.getElementById("completedSeances").textContent = stats.terminées ?? 0;
            document.getElementById("ongoingSeances").textContent = stats.en_cours ?? 0;
            document.getElementById("upcomingSeances").textContent = stats.à_venir ?? 0;

        } catch (err) {
            console.error("Erreur chargement stats sessions :", err);
        }
    }
    
    // Charger la liste des séances
    async function loadSessions(page = 1, filters = {}) {
        currentPage = page;
        try {
            const { sessions, pagination } = await getSessionsByStudent(currentPage, limit, filters);
            renderSessions(sessions, container);
            renderPagination(pagination, paginationContainer, (newPage) => loadSessions(newPage, filters));
        } catch (err) {
            console.error(err);
            container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-calendar-xmark empty-icon"></i><h3>Impossible de charger les séances</h3></div>`;
            paginationContainer.innerHTML = "";
        }
    }

    filterStatus?.addEventListener("change", () => loadSessions(1, getFilters(filterStatus, filterCourse, searchInput)));
    filterCourse?.addEventListener("change", () => loadSessions(1, getFilters(filterStatus, filterCourse, searchInput)));
    searchInput?.addEventListener("input", () => {
        clearTimeout(searchInput._timeout);
        searchInput._timeout = setTimeout(() => loadSessions(1, getFilters(filterStatus, filterCourse, searchInput)), 300);
    });

    // Lancer le chargement
    await loadSessionsStats();
    await loadCourseFilter(filterCourse);
    await loadSessions(currentPage, getFilters(filterStatus, filterCourse, searchInput));
    initUploadSubmit(loadSessions, () => getFilters(filterStatus, filterCourse, searchInput));
    initViewModal();  
    initViewButtons()
});
