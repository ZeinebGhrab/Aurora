import { getCourseByStudent, getStatsStudentsCourses } from "../course_api.js";
import {  renderPagination, initUser } from "../../utils.js";
import {  initViewCourseModal } from "../course_view_modal.js";

document.addEventListener("DOMContentLoaded", async () => {
    
    initUser();
    
    // Charger les statistiques d’un étudiant
    async function loadStudentStats() {
        try {
            const stats = await getStatsStudentsCourses();

            // Mettre les valeurs dans l’interface
            document.getElementById("totalCours").textContent = stats.total_cours ?? 0;
            document.getElementById("totalSeances").textContent = stats.total_seances ?? 0;
            document.getElementById("totalPresences").textContent = stats.total_presences ?? 0;
            document.getElementById("totalAbsences").textContent = stats.total_absences ?? 0;

        } catch (e) {
            console.error("Erreur chargement stats étudiant", e);
        }
    }


    const container = document.getElementById("coursesContainer");
    const paginationContainer = document.getElementById("courses-pagination");

    initViewCourseModal()

    if (!container || !paginationContainer) return;

    let currentPage = 1;
    const limit = 6;

    // Fonction pour générer les cartes des cours
    function renderCourses(courses) {
        container.innerHTML = courses.map(course => `
            <div class="course-card">
                <div class="course-header">
                    <div class="course-code">${course.code_cours}</div>
                    <div class="course-name">${course.nom_cours ?? "Nom non défini"}</div>
                    <div class="course-teacher">
                        <i class="fa-solid fa-user"></i> ${course.enseignant ?? "Enseignant"}
                    </div>
                </div>

                <div class="course-body">
                    <div class="course-info">
                        <div class="info-row">
                            <i class="fa-solid fa-chart-line"></i>
                            <span> ${course.email_enseignant ?? ''}</span>
                        </div>
                        <div class="info-row">
                            <i class="fa-solid fa-clock"></i>
                            <span>${course.filiere ?? "Filière inconnue"}</span>
                        </div>
                        <div class="info-row">
                            <i class="fa-solid fa-calendar"></i>
                            <span>${course.niveau ?? ""}</span>
                        </div>
                    </div>
                    <div class="course-actions">
                        <button class="btn-view" data-id="${course.id_cours}">
                            <i class="fa-solid fa-eye"></i> Voir
                        </button>
                    </div>
                </div>
            </div>
        `).join("");
    }

    async function loadCourses(page = 1, filters = {}) {
        currentPage = page;

        // Appel API avec pagination
        const { courses, pagination } = await getCourseByStudent(currentPage, limit, filters);

        if (!courses || courses.length === 0) {
            container.innerHTML = `<p class="no-course">Aucun cours disponible pour le moment.</p>`;
            paginationContainer.innerHTML = '';
            return;
        }

        // Préparer les données pour l'affichage
        courses.forEach(c => {
            c.nom_enseignant = c.nom_enseignant && c.prenom_enseignant
                ? `${c.nom_enseignant} ${c.prenom_enseignant}`
                : "Non assigné";
            c.nom_filiere = c.nom_filiere || "N/A";
            c.progress = c.progress ?? 0;
        });

        // Affichage des cartes
        renderCourses(courses);

        // Affichage de la pagination
        renderPagination(pagination, paginationContainer, loadCourses);
    }

    // Charger la première page
    loadStudentStats();
    loadCourses(currentPage);

    // Gestion de la recherche
    const searchInput = document.querySelector(".filters-section input[type='text']");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.trim();
            loadCourses(1, { search: searchTerm });
        });
    }
});

