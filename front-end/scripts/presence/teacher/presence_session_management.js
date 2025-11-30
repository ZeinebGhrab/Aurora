import { getSessionsByCourse } from "../../session/session_api.js";
import { showAbsences } from "./presence_student_management.js";
import { renderPagination } from "../../utils.js";

export async function showSessions(courseCode, courseName, page = 1, limit = 4) {
    const coursesView = document.getElementById('coursesView');
    const sessionsView = document.getElementById('sessionsView');
    const breadcrumb = document.getElementById('breadcrumb');
    const breadcrumbText = document.getElementById('breadcrumbText');
    const courseTitle = document.getElementById('courseTitle');
    const sessionsGrid = document.getElementById('sessionsGrid');
    const paginationContainer = document.getElementById('sessionsPagination');

    if (!sessionsGrid) return console.error("Element 'sessionsGrid' introuvable");

    // Affichage des vues
    if (coursesView) coursesView.style.display = 'none';
    if (sessionsView) sessionsView.style.display = 'block';
    if (breadcrumb) breadcrumb.style.display = 'flex';
    if (breadcrumbText) breadcrumbText.textContent = courseName;
    if (courseTitle) courseTitle.textContent = courseName;

    sessionsGrid.innerHTML = `<div class="loading" style="text-align: center; padding: 2rem; color: #6B7280;">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
        <p>Chargement des séances...</p>
    </div>`;
    sessionsGrid.style.display = 'grid';

    try {
        // Appel API avec pagination
        const res = await getSessionsByCourse(courseCode, page, limit); 
        const sessions = res.sessions || [];
        const pagination = res.pagination || { totalPages: 1, page: 1 };

        if (sessions.length === 0) {
            sessionsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-calendar-xmark" style="font-size: 3rem; color: #D1D5DB; margin-bottom: 1rem;"></i>
                <h3 style="font-size: 1.25rem; color: #374151; margin-bottom: 0.5rem;">Aucune séance trouvée</h3>
                <p style="color: #6B7280;">Ce cours n'a pas encore de séances programmées.</p>
            </div>`;
            return;
        }

        sessionsGrid.innerHTML = '';
        sessions.forEach(s => {
            const dateObj = new Date(s.date_heure);
            const day = dateObj.getDate().toString().padStart(2, '0');
            const month = dateObj.toLocaleString('fr-FR', { month: 'short' }).toUpperCase();
            const time = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            const present = s.nb_etudiants ?? 0;
            const absent = s.nb_absents ?? 0;
            const rate = present + absent > 0 ? ((present / (present + absent)) * 100).toFixed(1) : 0;

            const cardDiv = document.createElement('div');
            cardDiv.classList.add('seance-card');
            cardDiv.addEventListener('click', () => showAbsences(courseCode, s.id_seance, s.titre || 'Séance'));

            cardDiv.innerHTML = `
                <div class="seance-header">
                    <div class="seance-date"><div class="date-day">${day}</div><div class="date-month">${month}</div></div>
                    <div class="seance-info"><div class="seance-title">${s.titre || 'Séance'}</div><div class="seance-course">${time}</div></div>
                    <span class="seance-status status-terminee"><i class="fas fa-check-circle"></i> Terminée</span>
                </div>
                <div class="seance-body">
                    <div class="seance-details">
                        <div class="detail-row"><i class="fas fa-user-check"></i> <span>${present} présents</span></div>
                        <div class="detail-row"><i class="fas fa-user-xmark"></i> <span>${absent} absents</span></div>
                        <div class="detail-row"><i class="fas fa-chart-line"></i> <span>Taux: ${rate}%</span></div>
                    </div>
                </div>`;
            sessionsGrid.appendChild(cardDiv);
        });

        // Pagination
        if (paginationContainer) {
            renderPagination(
            pagination,             
            paginationContainer,    
            (newPage) => showSessions(courseCode, courseName, newPage, limit) 
        );
        }

    } catch (error) {
        console.error("Erreur chargement séances:", error);
        sessionsGrid.innerHTML = `<p class="error" style="text-align: center; padding: 2rem; color: #EF4444;">
            Erreur lors du chargement des séances: ${error.message}</p>`;
    }
}
