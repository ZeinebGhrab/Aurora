import { getCountCoursesByFiliere } from '../course/course_api.js';
import { getCountTeachersByFiliere } from '../teacher/teacher_api.js';
import { getCountStudentsByFiliere } from '../student/student_api.js';

// Palette de couleurs moderne pour les graphiques
const CHART_COLORS = [
    'linear-gradient(135deg, #5299cf 0%, #4e90c2 100%)',
    'linear-gradient(135deg, #c14b5f 0%, #bd5062 100%)',
    'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)'
];

// Crée un graphique à barres amélioré avec légendes et tooltips

function createEnhancedBarChart(containerId, data, labelKey, valueKey, chartTitle) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container avec l'id "${containerId}" non trouvé.`);
        return;
    }

    // Vider le conteneur
    container.innerHTML = '';
    
    // Ajouter le titre du graphique
    const titleElement = document.createElement('div');
    titleElement.className = 'chart-title-element';
    titleElement.innerHTML = `<i class="fas fa-chart-bar"></i> ${chartTitle}`;
    container.appendChild(titleElement);

    // Créer le conteneur des barres
    const barsContainer = document.createElement('div');
    barsContainer.className = 'chart-bars-container';
    
    // Vérifier si les données sont disponibles
    if (!data || data.length === 0) {
        barsContainer.innerHTML = `
            <div class="chart-empty-state">
                <i class="fas fa-chart-bar"></i>
                <p>Aucune donnée disponible</p>
            </div>
        `;
        container.appendChild(barsContainer);
        return;
    }

    // Calculer les valeurs max et total
    const maxValue = Math.max(...data.map(item => item[valueKey] || 0));
    const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);

    // Créer les barres
    data.forEach((item, index) => {
        const value = item[valueKey] || 0;
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const color = CHART_COLORS[index % CHART_COLORS.length];

        // Créer la barre avec son conteneur
        const barWrapper = document.createElement('div');
        barWrapper.className = 'chart-bar-wrapper';

        // Valeur au-dessus de la barre
        const barValue = document.createElement('div');
        barValue.className = 'chart-bar-value';
        barValue.textContent = value;
        barWrapper.appendChild(barValue);

        // La barre elle-même
        const bar = document.createElement('div');
        bar.className = 'chart-bar-enhanced';
        bar.style.height = `${Math.max(percentage, 5)}%`; // Minimum 5% pour visibilité
        bar.style.background = color;
        bar.setAttribute('data-value', value);
        bar.setAttribute('data-label', item[labelKey]);
        
        // Animation au chargement avec délai progressif
        setTimeout(() => {
            bar.style.opacity = '1';
            bar.style.transform = 'scaleY(1)';
        }, index * 100);

        barWrapper.appendChild(bar);

        // Label sous la barre
        const label = document.createElement('div');
        label.className = 'chart-bar-label';
        label.textContent = item[labelKey];
        barWrapper.appendChild(label);

        barsContainer.appendChild(barWrapper);
    });

    container.appendChild(barsContainer);

    // Créer la légende
    const legend = document.createElement('div');
    legend.className = 'chart-legend';
    
    data.forEach((item, index) => {
        const value = item[valueKey] || 0;
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        const color = CHART_COLORS[index % CHART_COLORS.length];

        const legendItem = document.createElement('div');
        legendItem.className = 'chart-legend-item';
        legendItem.innerHTML = `
            <div class="legend-color-box" style="background: ${color}"></div>
            <div class="legend-text">
                <span class="legend-label">${item[labelKey]}</span>
                <span class="legend-value">${value} (${percent}%)</span>
            </div>
        `;
        legend.appendChild(legendItem);
    });

    container.appendChild(legend);

    // Ajouter les tooltips interactifs
    addBarTooltips(barsContainer);
}

// Ajoute des tooltips interactifs aux barres du graphique

function addBarTooltips(container) {
    const bars = container.querySelectorAll('.chart-bar-enhanced');
    
    bars.forEach(bar => {
        bar.addEventListener('mouseenter', function(e) {
            const value = this.getAttribute('data-value');
            const label = this.getAttribute('data-label');
            
            // Créer le tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'chart-tooltip';
            tooltip.innerHTML = `
                <strong>${label}</strong>
                <span>${value} éléments</span>
            `;
            
            document.body.appendChild(tooltip);
            
            // Positionner le tooltip au-dessus de la barre
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            
            // Animation d'apparition
            setTimeout(() => tooltip.classList.add('show'), 10);
            
            // Stocker la référence pour le nettoyage
            this._tooltip = tooltip;
        });

        bar.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.classList.remove('show');
                setTimeout(() => {
                    if (this._tooltip && this._tooltip.parentNode) {
                        this._tooltip.parentNode.removeChild(this._tooltip);
                    }
                }, 200);
                this._tooltip = null;
            }
        });
    });
}

// Normalise le niveau pour afficher "Niveau X"

function normalizeLevel(niveau) {
    if (!niveau) return '';
    const lowerNiveau = niveau.toLowerCase();
    if (lowerNiveau.includes('niveau1') || lowerNiveau === '1') return 'Niveau 1';
    if (lowerNiveau.includes('niveau2') || lowerNiveau === '2') return 'Niveau 2';
    if (lowerNiveau.includes('niveau3') || lowerNiveau === '3') return 'Niveau 3';
    return niveau;
}

// Charge tous les graphiques du dashboard

async function loadCharts() {
    try {
        // 1. Graphique des étudiants par filière
        const studentsRes = await getCountStudentsByFiliere();
        if (Array.isArray(studentsRes) && studentsRes.length > 0) {
            const studentsData = studentsRes.map(s => ({
                label: s.nom_filiere || 'Non spécifié',
                value: s.nb_etudiants || 0
            }));
            createEnhancedBarChart('studentsChart', studentsData, 'label', 'value', 'Étudiants par Filière');
        } else {
            createEnhancedBarChart('studentsChart', [], 'label', 'value', 'Étudiants par Filière');
        }

        // 2. Graphique des cours par filière
        const coursesRes = await getCountCoursesByFiliere();
        if (Array.isArray(coursesRes) && coursesRes.length > 0) {
            const coursesData = coursesRes.map(c => ({
                label: c.nom_filiere || 'Non spécifié',
                value: c.nb_cours || 0
            }));
            createEnhancedBarChart('coursesChart', coursesData, 'label', 'value', 'Cours par Filière');
        } else {
            createEnhancedBarChart('coursesChart', [], 'label', 'value', 'Cours par Filière');
        }

        // 3. Graphique des enseignants par filière 
        const teachersRes = await getCountTeachersByFiliere();
        if (Array.isArray(teachersRes) && teachersRes.length > 0) {
            const teachersData = teachersRes.map(t => ({
                label: `${t.nom_filiere || 'Non spécifié'} ${normalizeLevel(t.niveau)}`,
                value: t.nb_enseignants || 0
            }));
            createEnhancedBarChart('teachersChart', teachersData, 'label', 'value', 'Enseignants par Filière');
        } else {
            createEnhancedBarChart('teachersChart', [], 'label', 'value', 'Enseignants par Filière');
        }

    } catch (error) {
        console.error('Erreur lors du chargement des graphiques :', error);
        
        // Afficher un état d'erreur pour chaque graphique
        ['studentsChart', 'coursesChart', 'teachersChart'].forEach(chartId => {
            const container = document.getElementById(chartId);
            if (container) {
                container.innerHTML = `
                    <div class="chart-error-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Erreur de chargement des données</p>
                    </div>
                `;
            }
        });
    }
}

// Charger les graphiques lorsque la page est prête
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCharts);
} else {
    loadCharts();
}

// Exporter les fonctions pour utilisation externe
export { loadCharts, createEnhancedBarChart };
