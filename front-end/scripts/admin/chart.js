/**
 * Module de gestion du graphique des statistiques par niveau
 */

/**
 * Met à jour le graphique avec les données des niveaux
 * @param {Array} niveauxData - Tableau des données par niveau [{niveau, total}, ...]
 */
export function updateNiveauChart(niveauxData) {
    if (!niveauxData || niveauxData.length === 0) {
        console.warn('Aucune donnée de niveau disponible');
        displayEmptyChart();
        return;
    }

    // Trouver le maximum pour calculer les pourcentages
    const maxCount = Math.max(...niveauxData.map(n => parseInt(n.total) || 0));
    
    // Sélectionner toutes les barres du graphique
    const chartBars = document.querySelectorAll('.chart-bar');
    
    if (chartBars.length === 0) {
        console.error('Aucune barre de graphique trouvée dans le DOM');
        return;
    }

    // Mettre à jour chaque barre
    niveauxData.forEach((niveau, index) => {
        if (chartBars[index]) {
            updateChartBar(chartBars[index], niveau, maxCount, index);
        }
    });

    // Appliquer les animations
    applyChartAnimations(chartBars);
}

/**
 * Met à jour une barre individuelle du graphique
 * @param {HTMLElement} bar - Élément DOM de la barre
 * @param {Object} niveau - Données du niveau {niveau, total, pourcentage}
 * @param {Number} maxCount - Valeur maximale pour le calcul des pourcentages
 * @param {Number} index - Index de la barre
 */
function updateChartBar(bar, niveau, maxCount, index) {
    const count = parseInt(niveau.total) || 0;
    const pourcentage = parseFloat(niveau.pourcentage) || 0;
    
    // Utiliser le pourcentage pour la hauteur (minimum 5% pour la visibilité)
    const displayHeight = pourcentage > 0 ? Math.max(pourcentage, 5) : 5;
    bar.style.height = `${displayHeight}%`;
    bar.setAttribute('data-value', count);
    bar.setAttribute('data-percentage', pourcentage.toFixed(1));
    
    // Mettre à jour le label du niveau
    updateBarLabel(bar, niveau.niveau || (index + 1));
    
    // Ajouter le tooltip amélioré
    bar.title = `${count} étudiant${count > 1 ? 's' : ''} (${pourcentage.toFixed(1)}%)`;
    
    // Afficher le nombre et le pourcentage au-dessus de la barre
    updateBarInfo(bar, count, pourcentage);
}

/**
 * Met à jour le label d'une barre
 * @param {HTMLElement} bar - Élément DOM de la barre
 * @param {String|Number} niveauName - Nom ou numéro du niveau
 */
function updateBarLabel(bar, niveauName) {
    let label = bar.querySelector('span');
    if (!label) {
        label = document.createElement('span');
        bar.appendChild(label);
    }
    label.textContent = `Niveau ${niveauName}`;
}

/**
 * Met à jour l'affichage du pourcentage uniquement
 * @param {HTMLElement} bar - Élément DOM de la barre
 * @param {Number} pourcentage - Pourcentage
 */
function updateBarInfo(bar, count, pourcentage) {
    let infoDisplay = bar.querySelector('.bar-info');
    if (!infoDisplay) {
        infoDisplay = document.createElement('div');
        infoDisplay.className = 'bar-info';
        bar.appendChild(infoDisplay);
    }
    
    infoDisplay.innerHTML = `
        <div class="bar-percentage-main">${pourcentage.toFixed(1)}%</div>
    `;
}

/**
 * Applique les animations aux barres du graphique
 * @param {NodeList} chartBars - Liste des barres du graphique
 */
function applyChartAnimations(chartBars) {
    setTimeout(() => {
        chartBars.forEach(bar => {
            bar.style.transition = 'height 0.8s ease-in-out, transform 0.3s ease';
        });
    }, 100);
}

/**
 * Affiche un graphique vide avec un message
 */
function displayEmptyChart() {
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach(bar => {
        bar.style.height = '20%';
        bar.style.opacity = '0.3';
        bar.title = 'Aucune donnée disponible';
        
        let infoDisplay = bar.querySelector('.bar-info');
        if (!infoDisplay) {
            infoDisplay = document.createElement('div');
            infoDisplay.className = 'bar-info';
            bar.appendChild(infoDisplay);
        }
        infoDisplay.innerHTML = `
            <div class="bar-count">--</div>
            <div class="bar-percentage">--</div>
        `;
    });
}

/**
 * Réinitialise le graphique
 */
export function resetChart() {
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach(bar => {
        bar.style.height = '0%';
        bar.style.transition = 'none';
        const infoDisplay = bar.querySelector('.bar-info');
        if (infoDisplay) {
            infoDisplay.remove();
        }
    });
}

/**
 * Crée un graphique animé avec effet de compteur
 * @param {Array} niveauxData - Données des niveaux
 * @param {Number} duration - Durée de l'animation en ms (défaut: 1000)
 */
export function animateChart(niveauxData, duration = 1000) {
    if (!niveauxData || niveauxData.length === 0) {
        displayEmptyChart();
        return;
    }

    const chartBars = document.querySelectorAll('.chart-bar');
    const maxCount = Math.max(...niveauxData.map(n => parseInt(n.total) || 0));
    
    niveauxData.forEach((niveau, index) => {
        if (chartBars[index]) {
            const count = parseInt(niveau.total) || 0;
            const pourcentage = parseFloat(niveau.pourcentage) || 0;
            animateBarCount(chartBars[index], count, pourcentage, duration);
            
            // Animation de la hauteur
            setTimeout(() => {
                updateChartBar(chartBars[index], niveau, maxCount, index);
            }, 100);
        }
    });
}

/**
 * Anime le compteur d'une barre avec pourcentage
 * @param {HTMLElement} bar - Élément de la barre
 * @param {Number} targetCount - Valeur cible
 * @param {Number} targetPercentage - Pourcentage cible
 * @param {Number} duration - Durée de l'animation
 */
function animateBarCount(bar, targetCount, targetPercentage, duration) {
    let infoDisplay = bar.querySelector('.bar-info');
    if (!infoDisplay) {
        infoDisplay = document.createElement('div');
        infoDisplay.className = 'bar-info';
        bar.appendChild(infoDisplay);
    }

    const startTime = Date.now();
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentCount = Math.floor(progress * targetCount);
        const currentPercentage = progress * targetPercentage;
        
        infoDisplay.innerHTML = `
            <div class="bar-count">${currentCount}</div>
            <div class="bar-percentage">${currentPercentage.toFixed(1)}%</div>
        `;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            infoDisplay.innerHTML = `
                <div class="bar-count">${targetCount}</div>
                <div class="bar-percentage">${targetPercentage.toFixed(1)}%</div>
            `;
        }
    };
    
    requestAnimationFrame(animate);
}