export function initModal(modalId, formId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const closeBtns = modal.querySelectorAll(".modal-close, .btn-cancel, .btn-close");

    const closeModal = () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
        if (formId) {
            const form = document.getElementById(formId);
            if (form) form.reset();
            delete form.dataset.editingId;
        }
    };

    closeBtns.forEach(btn => btn.addEventListener("click", closeModal));
    modal.addEventListener("click", e => e.target === modal && closeModal());
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
    });

    return modal;
}
