import { getCountStudents } from '../student/student_api.js';
import { getCountTeachers } from '../teacher/teacher_api.js';
import { getCountCourses } from '../course/course_api.js';
import { loadCharts } from './dashboard_charts.js';
import { initUser } from '../utils.js';

document.addEventListener("DOMContentLoaded", loadDashboardStats);

async function loadDashboardStats() {
    try {

        initUser();
        // Récupération des stats via API
        const studentCount = await getCountStudents();
        const teacherCount = await getCountTeachers();
        const courseCount  = await getCountCourses();

        // Sélection des éléments stat-number
        const statNumbers = document.querySelectorAll(".stat-number");

        // Mise à jour des valeurs
        statNumbers[0].textContent = studentCount.count ?? studentCount;
        statNumbers[1].textContent = teacherCount.count ?? teacherCount;
        statNumbers[2].textContent = courseCount.count ?? courseCount;

        // Charger les courbes
        loadCharts()

    } catch (error) {
        console.error("Erreur lors du chargement des statistiques :", error);
    }
}
