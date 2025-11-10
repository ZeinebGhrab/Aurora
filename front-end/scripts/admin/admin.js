import { getCountTeachers, getCountStudents, getCountCourses } from './admin_api.js';

// Fonction pour mettre à jour les statistiques
async function updateDashboardStats() {
    try {
        // Récupérer les données des APIs
        const [teachers, students, courses] = await Promise.all([
            getCountTeachers(),
            getCountStudents(),
            getCountCourses()
        ]);

        // Mettre à jour le nombre d'étudiants
        const studentsCount = students || 0;
        const studentsElement = document.querySelector('.stat-card:nth-child(1) .stat-number');
        if (studentsElement) {
            studentsElement.textContent = studentsCount.toLocaleString('fr-FR');
        }

        // Mettre à jour le nombre de professeurs
        const teachersCount = teachers || 0;
        const teachersElement = document.querySelector('.stat-card:nth-child(2) .stat-number');
        if (teachersElement) {
            teachersElement.textContent = teachersCount.toLocaleString('fr-FR');
        }

        // Mettre à jour le nombre de cours
        const coursesCount = courses || 0;
        const coursesElement = document.querySelector('.stat-card:nth-child(3) .stat-number');
        if (coursesElement) {
            coursesElement.textContent = coursesCount.toLocaleString('fr-FR');
        }

        console.log('Statistiques mises à jour:', {
            students: studentsCount,
            teachers: teachersCount,
            courses: coursesCount
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques:', error);
        
        // Afficher un message d'erreur à l'utilisateur (optionnel)
        const statsCards = document.querySelectorAll('.stat-number');
        statsCards.forEach(card => {
            if (card.textContent.includes(',')) return; // Ne pas modifier si déjà mis à jour
            card.textContent = '--';
            card.style.color = '#999';
        });
    }
}

// Fonction pour animer le compteur (optionnel - effet visuel)
function animateCounter(element, target) {
    const duration = 1000; // 1 seconde
    const start = 0;
    const increment = target / (duration / 16); // 60 FPS
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString('fr-FR');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString('fr-FR');
        }
    }, 16);
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