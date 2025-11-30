import { getPresencesBySession } from "../presence_api.js";
import { renderPagination } from "../../utils.js";

export async function showAbsences(courseCode, sessionId, sessionTitle = 'Séance', page = 1, limit = 10) {
    const courseName = document.getElementById('courseTitle').textContent;

    document.getElementById('coursesView').style.display = 'none';
    document.getElementById('sessionsView').style.display = 'none';
    document.getElementById('absencesView').style.display = 'block';
    document.getElementById('breadcrumb').style.display = 'flex';
    document.getElementById('breadcrumbText').textContent = `${courseName} > ${sessionTitle}`;
    document.getElementById('btnExportPDF').style.display = 'inline-flex';
    document.getElementById('btnExportExcel').style.display = 'inline-flex';

    const tableBody = document.getElementById('presenceTableBody');
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem;">
        <i class="fas fa-spinner fa-spin"></i> Chargement des étudiants...</td></tr>`;

    try {
        const { presences, pagination } = await getPresencesBySession(sessionId, page, limit);
        if (!presences || presences.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Aucune donnée trouvée.</td></tr>`;
            return;
        }

        const students = presences.map(p => ({
            name: p.full_name,
            avatar: p.full_name.split(' ').map(n => n[0].toUpperCase()).join(''),
            time: p.heure_arrivee || '-',
            status: p.statut.toLowerCase(),
            heure_fin: p.heure_fin || ''
        }));

        const total = students.length;
        const present = students.filter(s => s.status === 'présent').length;
        const absent = students.filter(s => s.status === 'absent').length;
        const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        displaySessionStats(total, present, absent, rate);
        displayStudentsTable(students);

        // Pagination
        const paginationContainer = document.getElementById('presencePagination');
        if (paginationContainer && pagination) {
            renderPagination(
                pagination,
                paginationContainer,
                (newPage) => showAbsences(courseCode, sessionId, sessionTitle, newPage, limit)
            );
        }

    } catch (error) {
        console.error("Erreur chargement présences:", error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">
            Erreur lors du chargement des étudiants: ${error.message}</td></tr>`;
    }
}

// fonctions utilitaires pour le tableau et stats
export function displaySessionStats(total, present, absent = 0, rate = 0) {
    const sessionStats = document.getElementById('sessionStats');
    if (!sessionStats) return;

    sessionStats.innerHTML = `
        <div class="stat-item"><div class="stat-icon blue"><i class="fas fa-users"></i></div><div class="stat-content"><div class="stat-value">${total}</div><div class="stat-label">Total étudiants</div></div></div>
        <div class="stat-item"><div class="stat-icon green"><i class="fas fa-user-check"></i></div><div class="stat-content"><div class="stat-value">${present}</div><div class="stat-label">Présents</div></div></div>
        <div class="stat-item"><div class="stat-icon red"><i class="fas fa-user-xmark"></i></div><div class="stat-content"><div class="stat-value">${absent}</div><div class="stat-label">Absents</div></div></div>
        <div class="stat-item"><div class="stat-icon purple"><i class="fas fa-percentage"></i></div><div class="stat-content"><div class="stat-value">${rate}%</div><div class="stat-label">Taux de présence</div></div></div>
    `;
}

export function displayStudentsTable(students) {
    const tableBody = document.getElementById('presenceTableBody');
    if (!tableBody) return;

    const studentCount = document.getElementById('studentCount');
    if (studentCount) studentCount.textContent = `${students.length} étudiants`;

    tableBody.innerHTML = '';
    students.forEach(student => tableBody.innerHTML += createStudentRow(student));
}

function createStudentRow(student) {
    return `<tr>
        <td><div class="student-info"><div class="avatar">${student.avatar}</div><span>${student.name}</span></div></td>
        <td>${student.time}</td>
        <td>${student.heure_fin}</td>
        <td>${getStatusBadge(student.status)}</td>
    </tr>`;
}

function getStatusBadge(status) {
    switch (status) {
        case 'présent': return '<span class="status-badge present"><i class="fas fa-check-circle"></i> Présent</span>';
        case 'absent': return '<span class="status-badge absent"><i class="fas fa-times-circle"></i>Absent</span>';
        default: return '<span class="status-badge">-</span>';
    }
}
