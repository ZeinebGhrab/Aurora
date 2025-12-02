import { loadCourses } from "./presence_course_management.js";
import { showSessions } from "./presence_session_management.js";
import { showAbsences } from "./presence_student_management.js";
import { exportPDF, exportExcel } from "./presence_export.js";
import { getCourseByTeacher } from "../course/course_api.js";

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

// Charger les cours au démarrage
document.addEventListener("DOMContentLoaded", () => {
    loadCourses(getCourseByTeacher);
});
