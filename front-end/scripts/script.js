// ========================================
// AURORA - JavaScript Principal
// ========================================

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // SECTION VALEURS - Gestion interactive
    // ========================================
    
    const valeurItems = document.querySelectorAll('.valeur-item');
    const valeurImages = document.querySelectorAll('.valeur-image');
    let currentIndex = 0;
    let progressTimer = null;
    let autoplayTimer = null;
    let isAutoPlaying = true;
    const DURATION = 5000; // 5 secondes par valeur
    
    /**
     * Change la valeur active
     */
    function changeValeur(index) {
        console.log('Changement vers valeur:', index);
        
        // Nettoyer les timers existants
        if (progressTimer) clearInterval(progressTimer);
        if (autoplayTimer) clearTimeout(autoplayTimer);
        
        // Retirer toutes les classes actives
        valeurItems.forEach(item => item.classList.remove('active'));
        valeurImages.forEach(img => img.classList.remove('active'));
        
        // Réinitialiser toutes les barres de progression
        for (let i = 0; i < 6; i++) {
            const bar = document.getElementById(`progressBar${i}`);
            if (bar) bar.style.height = '0%';
        }
        
        // Activer l'élément courant
        if (valeurItems[index]) {
            valeurItems[index].classList.add('active');
        }
        if (valeurImages[index]) {
            valeurImages[index].classList.add('active');
        }
        
        currentIndex = index;
        
        // Démarrer la barre de progression
        animateProgress(index);
    }
    
    /**
     * Anime la barre de progression
     */
    function animateProgress(index) {
        const progressBar = document.getElementById(`progressBar${index}`);
        if (!progressBar) {
            console.error('Barre de progression non trouvée pour index:', index);
            return;
        }
        
        let progress = 0;
        const step = 2; // Incrément de 2% toutes les 100ms = 5 secondes au total
        
        progressTimer = setInterval(() => {
            progress += step;
            progressBar.style.height = progress + '%';
            
            if (progress >= 100) {
                clearInterval(progressTimer);
                
                // Passer à la valeur suivante si autoplay est actif
                if (isAutoPlaying) {
                    autoplayTimer = setTimeout(() => {
                        const nextIndex = (currentIndex + 1) % valeurItems.length;
                        changeValeur(nextIndex);
                    }, 300);
                }
            }
        }, 100);
    }
    
    /**
     * Arrête l'autoplay
     */
    function stopAutoplay() {
        isAutoPlaying = false;
        if (progressTimer) clearInterval(progressTimer);
        if (autoplayTimer) clearTimeout(autoplayTimer);
        console.log('Autoplay arrêté');
    }
    
    /**
     * Redémarre l'autoplay
     */
    function startAutoplay() {
        isAutoPlaying = true;
        changeValeur(currentIndex);
        console.log('Autoplay redémarré');
    }
    
    // Ajouter les événements de clic sur chaque valeur
    valeurItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            console.log('Clic sur valeur:', index);
            stopAutoplay();
            changeValeur(index);
            
            // Redémarrer l'autoplay après 10 secondes d'inactivité
            setTimeout(() => {
                if (!isAutoPlaying) {
                    startAutoplay();
                }
            }, 10000);
        });
    });
    
    // Démarrer avec la première valeur
    console.log('Initialisation - Total valeurs:', valeurItems.length);
    changeValeur(0);
    
    
    // ========================================
    // NAVIGATION - Smooth Scroll
    // ========================================
    
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = document.querySelector('nav').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    
    // ========================================
    // NAVIGATION - Sticky avec effet au scroll
    // ========================================
    
    const nav = document.querySelector('nav');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Ajouter une ombre à la navigation lors du scroll
        if (scrollTop > 100) {
            nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    
    // ========================================
    // ANIMATIONS - Fade in au scroll
    // ========================================
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observer les sections pour les animations
    const sections = document.querySelectorAll('.mission-section, .valeurs-section, .contact-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    
    // ========================================
    // VIDÉO - Gestion de la lecture
    // ========================================
    
    const video = document.querySelector('.background-video');
    
    if (video) {
        // Assurer la lecture automatique de la vidéo
        video.play().catch(error => {
            console.log('Autoplay prevented:', error);
        });
        
        // Réduire la qualité de la vidéo si nécessaire pour les performances
        if (window.innerWidth < 768) {
            video.style.filter = 'brightness(60%)';
        }
    }
    
    
    // ========================================
    // PERFORMANCE - Lazy Loading des images
    // ========================================
    
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    
    // ========================================
    // CONSOLE - Message de bienvenue
    // ========================================
    
    console.log('%c🚀 Bienvenue sur Aurora! 🌌', 'color: #bd5062; font-size: 20px; font-weight: bold;');
    console.log('%cIllumine ton esprit, explore l\'univers!', 'color: #4e90c2; font-size: 14px;');
    
});


// ========================================
// UTILITAIRES - Fonctions helpers
// ========================================

/**
 * Détecte si l'utilisateur est sur mobile
 * @returns {boolean}
 */
function isMobile() {
    return window.innerWidth <= 768;
}

/**
 * Détecte si l'utilisateur est sur tablette
 * @returns {boolean}
 */
function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.mission-carousel .carousel-image');
    let currentIndex = 0;

    function showNextImage() {
        // Retirer la classe active de l'image actuelle
        images[currentIndex].classList.remove('active');
        
        // Passer à l'image suivante
        currentIndex = (currentIndex + 1) % images.length;
        
        // Ajouter la classe active à la nouvelle image
        images[currentIndex].classList.add('active');
    }

    // Changer d'image toutes les 2 secondes (2000ms)
    setInterval(showNextImage, 2000);
});

/**
 * Débounce function pour optimiser les événements
 * @param {Function} func - La fonction à débouncer
 * @param {number} wait - Le délai d'attente en ms
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
    
}