export function renderTeachers(teachers, container) {
    if (!teachers || !Array.isArray(teachers)) {
        console.warn("teachers n'est pas un tableau valide:", teachers);
        container.innerHTML = '<p class="error-message">Erreur lors du chargement des enseignants</p>';
        return;
    }

    container.innerHTML = "";

    // Si le tableau est vide
    if (teachers.length === 0) {
        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; min-height: 400px; width: 100%;">
                <div style="text-align: center; color: #6B7280; max-width: 500px;">
                    <i class="fa-solid fa-chalkboard-teacher" style="font-size: 4rem; color: #5299cf; margin-bottom: 1.5rem; opacity: 0.6; display: block;"></i>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: #374151; margin-bottom: 0.5rem;">Aucun enseignant disponible</h3>
                    <p style="font-size: 1rem; margin: 0;">Cliquez sur "Nouvel Enseignant" pour commencer</p>
                </div>
            </div>
        `;
        return;
    }

    const avatarColors = ["purple", "blue", "green", "orange", "pink"];

    teachers.forEach((teacher, index) => {
        try {
            const user = teacher;
            const enseignant = {
                grade: teacher.grade || "N/A",
                specialite: teacher.specialite || "N/A",
                cours: teacher.cours || Math.floor(Math.random() * 6) + 1,
                etudiants: teacher.etudiants || Math.floor(Math.random() * 150) + 20,
                note: teacher.note || (Math.random() * 1 + 4).toFixed(1)
            };

            const initials = `${user.prenom.charAt(0)}${user.nom.charAt(0)}`;

            const card = document.createElement("div");
            card.classList.add("teacher-card");
            card.innerHTML = `
                <div class="teacher-header">
                    <div class="teacher-avatar ${avatarColors[index % avatarColors.length]}">
                        ${initials}
                        <div class="online-badge"></div>
                    </div>
                    <div class="teacher-info">
                        <h3>Prof. ${user.prenom} ${user.nom}</h3>
                        <div class="teacher-title">${enseignant.specialite}</div>
                        <span class="teacher-badge">Temps plein</span>
                    </div>
                </div>
                <div class="teacher-details">
                    <div class="detail-item">
                        <i class="fa-regular fa-envelope"></i>
                        <span>${user.email}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fa-solid fa-phone"></i>
                        <span>${user.telephone || "+216 71 234 567"}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fa-solid fa-building"></i>
                        <span>Département ${enseignant.specialite}</span>
                    </div>
                </div>
                <div class="teacher-stats">
                    <div class="stat-item">
                        <div class="stat-value">${enseignant.cours}</div>
                        <div class="stat-label-small">Cours</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${enseignant.etudiants}</div>
                        <div class="stat-label-small">Étudiants</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${enseignant.note}</div>
                        <div class="stat-label-small">Note</div>
                    </div>
                </div>
                <div class="teacher-actions">
                    <button class="btn-view" data-id="${user.id_utilisateur}"><i class="fa-solid fa-eye"></i> Voir</button>
                    <button class="btn-edit" data-id="${user.id_utilisateur}"><i class="fa-solid fa-pen"></i> Modifier</button>
                    <button class="btn-delete" data-id="${user.id_utilisateur}"><i class="fa-solid fa-trash"></i> Supprimer</button>
                </div>
            `;
            container.appendChild(card);

        } catch (error) {
            console.error("Erreur lors du rendu d'un enseignant:", error, teacher);
        }
    });
}

export function renderPagination(pagination, parentElement, onPageChange) {
    // Supprimer l'ancienne pagination
    const oldPagination = parentElement.querySelector(".pagination-container");
    if (oldPagination) oldPagination.remove();

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
    paginationContainer.querySelectorAll("button[data-page]").forEach(btn => {
        btn.addEventListener("click", () => {
            const page = parseInt(btn.dataset.page);
            if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
                onPageChange(page);
            }
        });
    });
}
