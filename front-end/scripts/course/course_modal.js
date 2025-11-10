// course_modal.js
export function initCourseModal() {
    console.log('Initialisation du modal...');
    
    const newCourseBtn = document.querySelector('.btn-new-course');
    const newCourseModal = document.getElementById('newCourseModal');
    const closeModalBtns = document.querySelectorAll('.modal-close, .btn-cancel');
    
    if (!newCourseBtn || !newCourseModal) {
        console.error("Éléments manquants");
        return;
    }
    
    console.log('Éléments trouvés ✓');
    
    // Ouvrir le modal
    newCourseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Ouverture du modal');
        newCourseModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Fonction de fermeture
    const closeModal = () => {
        console.log('Fermeture du modal');
        newCourseModal.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    // Fermer avec les boutons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    });
    
    // Fermer en cliquant sur l'overlay
    newCourseModal.addEventListener('click', (e) => {
        if (e.target === newCourseModal) {
            closeModal();
        }
    });
    
    // Fermer avec la touche Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && newCourseModal.classList.contains('active')) {
            closeModal();
        }
    });
 
}