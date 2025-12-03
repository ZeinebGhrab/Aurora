export function initCourseModal() {
    
    const newCourseBtn = document.querySelector('.btn-new-course');
    const newCourseModal = document.getElementById('newCourseModal');
    const closeModalBtns = document.querySelectorAll('.modal-close, .btn-cancel');
    
    if (!newCourseBtn || !newCourseModal) {
        console.error("Éléments manquants");
        return;
    }
    
    // Ouvrir le modal
    newCourseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        newCourseModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Fonction de fermeture
    const closeModal = () => {
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