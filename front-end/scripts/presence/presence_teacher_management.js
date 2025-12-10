import { loadCourses } from "./presence_course_management.js";
import { showSessions } from "./presence_session_management.js";
import { showAbsences } from "./presence_student_management.js";
import { exportPDF, exportExcel } from "./presence_export.js";
import { getCourseByTeacher } from "../course/course_api.js";
import { getStatsPresencesForTeacher } from './presence_api.js';
import { initUser} from '../utils.js';

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
document.addEventListener("DOMContentLoaded", async () => {

    initUser();
    
    // 1. Charger les cours
    loadCourses(getCourseByTeacher);

    // 2. Récupérer les stats pour l'enseignant courant
    try {
        // Appel API
        const stats = await getStatsPresencesForTeacher(); // doit renvoyer { total_seances, total_presences, total_absences, total_courses }
        
        // 3. Mettre à jour le DOM
        if (stats) {
            // Nombre de cours
            document.getElementById('myCourses').innerText = stats.total_courses ?? 0;

            // Total séances
            document.getElementById('totalSessions').innerText = stats.total_seances ?? 0;

            // Total absences
            document.getElementById('totalAbsences').innerText = stats.total_absences ?? 0;

            // Taux global (présences / séances)
            const tauxGlobal = stats.total_seances > 0 
                ? Math.round((stats.total_presences / (stats.total_seances)) * 100) 
                : 0;
            document.getElementById('globalRate').innerText = `${tauxGlobal}%`;
        }
    } catch (error) {
        console.error("Erreur lors du chargement des stats : ", error);
    }
});
