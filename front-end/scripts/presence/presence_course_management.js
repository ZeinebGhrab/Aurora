import { renderPagination } from "../utils.js";
import { showSessions } from "./presence_session_management.js"; 

export async function loadCourses(getCoursesByTeacher, isAdmin = false, page = 1, limit = 4) {
    const container = document.getElementById("coursesContainer");
    const paginationContainer = document.getElementById("courses-pagination");

    if (!container) return console.error("Container 'coursesContainer' introuvable");

    container.innerHTML = `<div class="loading" style="text-align: center; padding: 2rem; color: #6B7280;">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
        <p>Chargement des cours...</p>
    </div>`;

    try {
        const res = await getCoursesByTeacher(page, limit);
        const courses = res.courses || [];
        const pagination = res.pagination || {};

        if (courses.length === 0) {
            container.innerHTML = `<p class="no-data" style="text-align: center; padding: 2rem; color: #6B7280;">Aucun cours trouvé.</p>`;
            return;
        }

        container.innerHTML = '';
        courses.forEach(course => {
            const card = document.createElement("div");
            card.classList.add("course-card");
            card.addEventListener('click', () => showSessions(course.id_cours, course.nom_cours, isAdmin, page = 1, limit = 4));

            card.innerHTML = `
                <div class="course-header">
                    <div>
                        <div class="course-code">${course.code_cours || course.id_cours}</div>
                        <div class="course-name">${course.nom_cours}</div>
                        <div class="course-teacher">${course.filiere ?? ""} - ${course.niveau ?? ""}</div>
                    </div>
                </div>
                <div class="course-body">
                    <div class="course-info">
                        <div class="info-row"><i class="fas fa-users"></i> <span>${course.nb_etudiants ?? 0} étudiants</span></div>
                        <div class="info-row"><i class="fas fa-calendar-check"></i> <span>${course.nb_seances ?? 0} séances</span></div>
                        <div class="info-row"><i class="fas fa-chart-line"></i> <span>Taux: ${course.nb_absences && course.nb_etudiants ? ((course.nb_etudiants - course.nb_absences) / course.nb_etudiants * 100).toFixed(1) : 0}%</span></div>
                        <div class="info-row"><i class="fas fa-user-xmark"></i> <span>${course.nb_absences ?? 0} absences</span></div>
                    </div>
                </div>`;
            container.appendChild(card);
        });

        if (paginationContainer) 
            renderPagination(pagination, paginationContainer, (p) => loadCourses(getCoursesByTeacher,isAdmin, p, limit));

    } catch (error) {
        console.error("Erreur chargement cours:", error);
        container.innerHTML = `<p class="error" style="text-align: center; padding: 2rem; color: #EF4444;">Erreur lors du chargement des cours.</p>`;
    }
}
