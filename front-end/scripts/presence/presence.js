import { loadCourses } from "./presence_course_management.js";
import { showSessions } from "./presence_session_management.js";
import { showAbsences } from "./presence_student_management.js";
import { exportPDF, exportExcel } from "./presence_export.js";
import { getAllCourses } from "../course/course_api.js";
import { getStatsPresence } from "../presence/presence_api.js";

// Attacher les fonctions globales pour HTML
window.showCourses = function() {
    document.getElementById('coursesView').style.display = 'block';
    document.getElementById('sessionsView').style.display = 'none';
    document.getElementById('absencesView').style.display = 'none';
    document.getElementById('breadcrumb').style.display = 'none';
    document.getElementById('btnExportPDF').style.display = 'none';
    document.getElementById('btnExportExcel').style.display = 'none';
};

window.showSessions = showSessions;
window.showAbsences = showAbsences;
window.searchTable = function() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const filter = input.value.toUpperCase();
    const table = document.getElementById('presenceTable');
    if (!table) return;
    const tr = table.getElementsByTagName('tr');
    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td')[1];
        if (td) {
            const txtValue = td.textContent || td.innerText;
            tr[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? '' : 'none';
        }
    }
};

window.printTable = function() { window.print(); };
window.exportPDF = exportPDF;
window.exportExcel = exportExcel;

// Fonction pour charger les stats et mettre à jour le DOM
async function loadPresenceStats() {
    try {
        const stats = await getStatsPresence();
        if (!stats) return;

        document.getElementById('statTotal').textContent = stats.total_seances ?? 0;
        document.getElementById('statPresences').textContent = stats.total_presences ?? 0;
        document.getElementById('statAbsences').textContent = stats.total_absences ?? 0;
    } catch (error) {
        console.error("Erreur lors du chargement des stats de présence :", error);
    }
}

const isAdmin = true;

// Charger les stats au démarrage
document.addEventListener("DOMContentLoaded", () => {
    loadPresenceStats();
    loadCourses(getAllCourses, isAdmin);
});
