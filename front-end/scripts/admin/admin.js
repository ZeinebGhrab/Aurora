import { getCountTeachers, getCountStudents, getCountCourses, getCountStudentsByNiveau } from './admin_api.js';
import { updateNiveauChart } from './chart.js';

/**
 * Fonction pour mettre à jour les statistiques du tableau de bord
 */
async function updateDashboardStats() {
    try {
        // Récupérer les données des APIs en parallèle
        const [teachers, students, courses, studentsByNiveau] = await Promise.all([
            getCountTeachers(),
            getCountStudents(),
            getCountCourses(),
            getCountStudentsByNiveau()
        ]);

        // Mettre à jour le nombre d'étudiants
        updateStatCard(1, students);

        // Mettre à jour le nombre de professeurs
        updateStatCard(2, teachers);

        // Mettre à jour le nombre de cours
        updateStatCard(3, courses);

        // Mettre à jour le graphique des niveaux
        updateNiveauChart(studentsByNiveau);

        console.log('Statistiques mises à jour:', {
            students,
            teachers,
            courses,
            studentsByNiveau
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques:', error);
        displayError();
    }
}

/**
 * Met à jour une carte de statistique
 * @param {Number} cardIndex - Index de la carte (1, 2, 3)
 * @param {Number} value - Valeur à afficher
 */
function updateStatCard(cardIndex, value) {
    const count = value || 0;
    const element = document.querySelector(`.stat-card:nth-child(${cardIndex}) .stat-number`);
    
    if (element) {
        element.textContent = count.toLocaleString('fr-FR');
        element.style.color = ''; // Reset color
    }
}

/**
 * Affiche un message d'erreur sur les cartes de statistiques
 */
function displayError() {
    const statsCards = document.querySelectorAll('.stat-number');
    statsCards.forEach(card => {
        if (card.textContent.includes(',')) return; 
        card.textContent = '--';
        card.style.color = '#999';
    });
}

// Initialiser le tableau de bord au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Chargement du tableau de bord...');
    updateDashboardStats();
    
    // Actualiser les statistiques toutes les 5 minutes (optionnel)
    setInterval(updateDashboardStats, 5 * 60 * 1000);
});

// Rafraîchir manuellement si nécessaire
window.refreshStats = updateDashboardStats;