import { getCourseByTeacher } from "../course_api.js";
import {  renderPagination } from "../../utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("coursesContainer");
    const paginationContainer = document.getElementById("courses-pagination");
    const filiereSelect = document.getElementById("filiereSelect");
    const searchInput = document.querySelector(".search-box input");

    if (!container || !paginationContainer) return;

    let currentPage = 1;
    const limit = 6;
    let filters = {};

    async function loadCourses(page = 1) {
        currentPage = page;

        try {
            const { courses, pagination } = await getCourseByTeacher(currentPage, limit, filters);

            // Si aucun cours
            if (!courses || courses.length === 0) {
                container.innerHTML = `
                    <div style="display:flex; justify-content:center; align-items:center; min-height:400px; width:100%;">
                        <div style="text-align:center; color:#6B7280; max-width:500px;">
                            <i class="fa-solid fa-book-open" style="font-size:4rem; color:#5299cf; margin-bottom:1.5rem; opacity:0.6; display:block;"></i>
                            <h3 style="font-size:1.5rem; font-weight:700; color:#374151; margin-bottom:0.5rem;">Aucun cours disponible</h3>
                            <p style="font-size:1rem; margin:0;">Cliquez sur "Nouveau Cours" pour commencer</p>
                        </div>
                    </div>
                `;
                paginationContainer.innerHTML = '';
                return;
            }

            // Rendu des cours
            container.innerHTML = '';
            courses.forEach(course => {
                const card = document.createElement("div");
                card.classList.add("course-card");
                card.innerHTML = `
                    <div class="course-header">
                        <div class="course-code">${course.code_cours || ''}</div>
                        <div class="course-name">${course.nom_cours || ''}</div>
                        <div class="course-teacher"><i class="fa-solid fa-user"></i> ${course.enseignant || 'Non assigné'}</div>
                    </div>
                    <div class="course-body">
                        <div class="course-info">
                            <div class="info-row">
                                <i class="fa-solid fa-users"></i>
                                <span>${course.nb_etudiants || 0} étudiants inscrits</span>
                            </div>
                            <div class="info-row">
                                <i class="fa-solid fa-building"></i>
                                <span>${course.filiere || 'N/A'}</span>
                            </div>
                            <div class="info-row">
                                <i class="fa-solid fa-layer-group"></i>
                                <span>${course.niveau || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });

            // Pagination
            renderPagination(pagination, paginationContainer, loadCourses);

        } catch (err) {
            console.error("Erreur chargement des cours :", err);
            container.innerHTML = `<p class="no-course">Erreur lors du chargement des cours.</p>`;
            paginationContainer.innerHTML = '';
        }
    }

    // Filtre par filière
    filiereSelect?.addEventListener("change", () => {
        filters.filiere = filiereSelect.value || '';
        loadCourses(1);
    });

    // Recherche avec debounce
    searchInput?.addEventListener("input", () => {
        clearTimeout(searchInput._timeout);
        searchInput._timeout = setTimeout(() => {
            filters.search = searchInput.value.trim();
            loadCourses(1);
        }, 300);
    });

    // Charger la première page
    loadCourses(currentPage);
});
