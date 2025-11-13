import { getAllTeachers } from "./teacher_api.js";


// Calcule les statistiques à partir de la pagination

export function calculateStatsFromPagination(pagination, teachers) {
    if (!pagination || !teachers) {
        return {
            total: 0,
            actifs: 0,
            nouveaux_semaine: 0,
            pourcentage_actifs: 0
        };
    }

    // Compter les enseignants actifs dans la page actuelle
    const actifsPage = teachers.filter(s => s.statut === 'activé').length;
    
    // Calculer les nouveaux cette semaine (7 derniers jours)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const nouveauxSemaine = teachers.filter(s => {
        if (!s.date_creation) return false;
        const dateCreation = new Date(s.date_creation);
        return dateCreation >= oneWeekAgo;
    }).length;

    const total = pagination.total || 0;
    
    // Si on n'a pas le statut, on estime tous comme actifs
    const actifsEstimes = actifsPage > 0 ? 
        Math.round(total * (actifsPage / teachers.length)) : 
        total; // Par défaut, on considère tous actifs si pas d'info
    
    const pourcentageActifs = total > 0 ? Math.round((actifsEstimes / total) * 100) : 0;

    return {
        total: total,
        actifs: actifsEstimes,
        nouveaux_semaine: nouveauxSemaine,
        pourcentage_actifs: pourcentageActifs
    };
}


// Met à jour l'affichage des statistiques dans le DOM

export function updateTeachersStatsDisplay(stats) {
    if (!stats) {
        console.warn('Aucune statistique à afficher');
        return;
    }

    // Carte 1: Total enseignants
    const totalElement = document.querySelector('.stat-card:nth-child(1) .stat-number');
    if (totalElement) {
        animateNumber(totalElement, stats.total);
    }

    const totalDetail = document.querySelector('.stat-card:nth-child(1) .stat-detail');
    if (totalDetail && stats.nouveaux_semaine !== undefined) {
        totalDetail.textContent = `+${stats.nouveaux_semaine} cette semaine`;
    }

    // Carte 2: Enseignants actifs
    const actifsElement = document.querySelector('.stat-card:nth-child(2) .stat-number');
    if (actifsElement) {
        animateNumber(actifsElement, stats.actifs);
    }

    const actifsDetail = document.querySelector('.stat-card:nth-child(2) .stat-detail');
    if (actifsDetail) {
        actifsDetail.textContent = `${stats.pourcentage_actifs}% du total`;
    }

    // Carte 3: Nouveaux enseignants
    const nouveauxElement = document.querySelector('.stat-card:nth-child(3) .stat-number');
    if (nouveauxElement) {
        animateNumber(nouveauxElement, stats.nouveaux_semaine);
    }
}


// Anime le changement de nombre avec un compteur

function animateNumber(element, targetValue) {
    const currentValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
    const duration = 500; // ms
    const steps = 20;
    const increment = (targetValue - currentValue) / steps;
    let current = currentValue;
    let step = 0;

    const timer = setInterval(() => {
        step++;
        current += increment;
        
        if (step >= steps) {
            element.textContent = targetValue.toLocaleString('fr-FR');
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current).toLocaleString('fr-FR');
        }
    }, duration / steps);
}


// Récupère et affiche les statistiques complètes

export async function loadAndDisplayStats() {
    try {
        // Récupérer tous les étudiants (première page)
        const { teachers, pagination } = await getAllTeachers(1, 100, {});
        
        // Calculer les statistiques
        const stats = calculateStatsFromPagination(pagination, teachers);
        
        // Mettre à jour l'affichage
        updateTeachersStatsDisplay(stats);
        
        return stats;
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        return null;
    }
}


// Met à jour les statistiques après un changement (ajout, suppression, modification)

export async function refreshStats() {
    await loadAndDisplayStats();
}