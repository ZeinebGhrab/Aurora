import { getSessionsByTeacher, deleteSession } from "../session_api.js";
import { renderPagination } from "../../utils.js";

let seancesData = [];
let currentPage = 1;
const limit = 6;

document.addEventListener('DOMContentLoaded', async () => {
    await loadCourseFilter();
    await loadSessions();
    setupEventListeners();
});

const filterStatus = document.getElementById('filterStatus');
const filterCourse = document.getElementById('filterCourse');
const searchInput = document.getElementById('searchSeance');
const container = document.getElementById('sessionsContainer');
const paginationContainer = document.getElementById('sessions-pagination');

// FILTRE COURS

async function loadCourseFilter() {
    if (!filterCourse) return;

    try {
        const data = await getSessionsByTeacher(currentPage, limit, {}); 
        if (!data.sessions) return;

        seancesData = data.sessions.map(s => ({
            ...s,
            cours: s.nom_cours ?? "Cours inconnu"
        }));

        const courses = [...new Set(seancesData.map(s => s.cours))];
        filterCourse.innerHTML = '<option value="all">Tous les cours</option>';
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            filterCourse.appendChild(option);
        });
    } catch (err) {
        console.error("Erreur chargement cours :", err);
    }
}

// CHARGEMENT SÉANCES

async function loadSessions(page = 1) {
    currentPage = page;

    let statutVal = filterStatus?.value ? filterStatus?.value : "" ;

    const filters = {
        page,
        limit,
        id_cours: filterCourse?.value ? parseInt(filterCourse.value) : null,
        statut: statutVal,
        search: searchInput?.value.trim() || ''
    };

    console.log(filters);

    try {
        const { sessions, pagination } = await getSessionsByTeacher(currentPage, limit, filters);
        seancesData = sessions; 
        renderSessions(seancesData);

        renderPagination(pagination, paginationContainer, (newPage) => {
            loadSessions(newPage);
        });
    } catch (err) {
        console.error("Erreur chargement séances :", err);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-calendar-xmark empty-icon"></i>
                <h3>Aucune séance trouvée</h3>
                <p>Aucune séance ne correspond à votre recherche.</p>
            </div>
        `;
        paginationContainer.innerHTML = "";
    }
}


// FILTRE & RECHERCHE

function applyFilters() {
    currentPage = 1;
    loadSessions();
}


// ÉVÉNEMENTS

function setupEventListeners() {
    filterStatus?.addEventListener('change', applyFilters);
    filterCourse?.addEventListener('change', applyFilters);
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchInput._timeout);
        searchInput._timeout = setTimeout(applyFilters, 300);
    });
}


// RENDU SÉANCES

function renderSessions(sessions) {
    if (!sessions || sessions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-calendar-xmark empty-icon"></i>
                <h3>Aucune séance trouvée</h3>
                <p>Aucune séance ne correspond à votre recherche.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = sessions.map(s => {
        const dateObj = new Date(s.date_heure);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleDateString('fr-FR', { month: 'short' });
        const tauxPresence = s.nb_etudiants > 0 ? Math.round((s.nb_presents / s.nb_etudiants) * 100) : 0;

        return `
            <div class="seance-card">
                <div class="seance-header">
                    <div class="seance-date">
                        <div class="date-day">${day}</div>
                        <div class="date-month">${month}</div>
                    </div>
                    <div class="seance-info">
                        <div class="seance-title">${s.titre}</div>
                        <div class="seance-course">${s.nom_cours}</div>
                    </div>
                    <div class="seance-status ${getStatusClass(s.statut)}">
                        <i class="fa-solid ${getStatusIcon(s.statut)}"></i>
                        ${getStatusText(s.statut)}
                    </div>
                </div>
                <div class="seance-body">
                    <div class="seance-details">
                        <div class="detail-row"><i class="fa-solid fa-clock"></i> ${s.date_heure.split(' ')[1]} - ${s.heure_fin}</div>
                        <div class="detail-row"><i class="fa-solid fa-door-open"></i> ${s.salle ?? "Salle non spécifiée"}</div>
                        <div class="detail-row"><i class="fa-solid fa-users"></i> ${s.nb_etudiants ?? 0} étudiants</div>
                        ${s.statut === 'terminee' ? `<div class="detail-row"><i class="fa-solid fa-chart-pie"></i> Présence: ${tauxPresence}% (${s.nb_presents}/${s.nb_etudiants})</div>` : ''}
                    </div>
                    ${s.description ? `<div class="seance-description"><p>${s.description}</p></div>` : ''}
                    <div class="seance-actions">
                        ${getActionButtons(s)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}


// STATUTS & ICONES

function getStatusClass(s) {
    return { planifiee: "status-planifiee", en_cours: "status-en-cours", terminee: "status-terminee", annulee: "status-annulee" }[s] || "";
}
function getStatusText(s) {
    return { planifiee: "Planifiée", en_cours: "En cours", terminee: "Terminée", annulee: "Annulée" }[s] || s;
}
function getStatusIcon(s) {
    return { planifiee: "fa-calendar-plus", en_cours: "fa-spinner fa-spin", terminee: "fa-check-circle", annulee: "fa-times-circle" }[s] || "fa-circle";
}


// BOUTONS ACTION

function getActionButtons(s) {
    if (s.statut === 'en_cours') {
        return `<button class="btn-action btn-view" onclick="managePresence(${s.id_seance})"><i class="fa-solid fa-user-check"></i></button>`;
    }
    if (s.statut === 'terminee') {
        return `<button class="btn-action btn-view" onclick="viewPresenceReport(${s.id_seance})"><i class="fa-solid fa-chart-bar"></i></button>`;
    }
    return '';
}
