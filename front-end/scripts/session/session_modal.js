export function initSessionModal() {
    const newSessionBtn = document.querySelector('.btn-new-session');
    const newSessionModal = document.getElementById('newSessionModal');
    const closeModalBtns = document.querySelectorAll('.modal-close, .btn-cancel');

    if (!newSessionBtn || !newSessionModal) {
        console.error("Éléments manquants");
        return;
    }

    newSessionBtn.addEventListener('click', e => {
        e.preventDefault();
        newSessionModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    const closeModal = () => {
        newSessionModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeModalBtns.forEach(btn => btn.addEventListener('click', e => {
        e.preventDefault();
        closeModal();
    }));

    newSessionModal.addEventListener('click', e => {
        if (e.target === newSessionModal) closeModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && newSessionModal.classList.contains('active')) closeModal();
    });
}


