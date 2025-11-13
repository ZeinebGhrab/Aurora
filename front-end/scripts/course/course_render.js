export function renderCourses(courses, container) {
    
    if (!courses || !Array.isArray(courses)) {
        console.warn('courses n\'est pas un tableau valide:', courses);
        container.innerHTML = '<p class="error-message">Erreur lors du chargement des cours</p>';
        return;
    }

    container.innerHTML = "";
    
    // Si le tableau est vide
    if (courses.length === 0) {
        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; min-height: 400px; width: 100%;">
                <div style="text-align: center; color: #6B7280; max-width: 500px;">
                    <i class="fa-solid fa-book-open" style="font-size: 4rem; color: #5299cf; margin-bottom: 1.5rem; opacity: 0.6; display: block;"></i>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: #374151; margin-bottom: 0.5rem;">Aucun cours disponible</h3>
                    <p style="font-size: 1rem; margin: 0;">Cliquez sur "Nouveau Cours" pour commencer</p>
                </div>
            </div>
        `;
        return;
    }

    courses.forEach(item => {
        try {
            const course = item;
        
            // Vérifier que course existe
            if (!course || !course.id_cours) {
                console.warn('Cours invalide:', item);
                return;
            }

            const card = document.createElement("div");
            card.classList.add("course-card");
            card.innerHTML = `
            <div class="course-header">
                <div class="course-code">${course.code_cours || ''}</div>
                <div class="course-name">${course.nom_cours|| ''}</div>
                <div class="course-teacher"><i class="fa-solid fa-user"></i> ${course.enseignant || 'Non assigné'}</div>
            </div>
            <div class="course-body">
                <div class="course-info">
                    <div class="info-row">
                        <i class="fa-solid fa-users"></i>
                        <span>${course.nb_etudiants || 0} étudiants inscrits</span>
                    </div>
                    <div class="info-row">
                        <i class="fa-solid fa-building"></i>
                        <span>${course.filiere || 'N/A'}</span>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="btn-edit" data-id="${course.id_cours}"><i class="fa-solid fa-pen"></i> Modifier</button>
                    <button class="btn-delete" data-id="${course.id_cours}"><i class="fa-solid fa-trash"></i> Supprimer</button>
                </div>
            </div>`;
            container.appendChild(card);
        } catch (error) {
            console.error('Erreur lors du rendu d\'un cours:', error, item);
        }
    });
}


export function renderPagination(pagination, parentElement, onPageChange) {
    if (!parentElement) {
        console.error("Parent element introuvable pour la pagination");
        return;
    }

    // Vider le conteneur de pagination
    parentElement.innerHTML = "";

    // Ne rien afficher si pas de pagination ou une seule page
    if (!pagination || pagination.totalPages <= 1) return;

    const paginationContainer = document.createElement("div");
    paginationContainer.classList.add("pagination-container");

    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;

    let paginationHTML = '<div class="pagination">';

    // Précédent
    paginationHTML += `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                data-page="${currentPage - 1}" 
                ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-left"></i> Précédent
        </button>
    `;

    // Pages visibles
    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn page-number" data-page="1">1</button>`;
        if (startPage > 2) paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn page-number ${i === currentPage ? 'active' : ''}" 
                    data-page="${i}">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        paginationHTML += `<button class="pagination-btn page-number" data-page="${totalPages}">${totalPages}</button>`;
    }

    // Suivant
    paginationHTML += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                data-page="${currentPage + 1}" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            Suivant <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;

    paginationHTML += '</div>';

    paginationContainer.innerHTML = paginationHTML;
    parentElement.appendChild(paginationContainer);

    // Événements clic sur les boutons
    paginationContainer.querySelectorAll("button[data-page]:not(.disabled)").forEach(btn => {
        btn.addEventListener("click", () => {
            const page = parseInt(btn.dataset.page);
            if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
                onPageChange(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}