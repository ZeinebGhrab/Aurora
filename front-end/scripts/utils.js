import { checkSession } from './authentification/auth.js';

export function showNotification(message, type = 'info') {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px 20px;
            border-radius: 8px; color: white; font-weight: 500; z-index: 10000;
            animation: slideIn 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(notification);

        if (!document.getElementById('notificationStyle')) {
            const style = document.createElement('style');
            style.id = 'notificationStyle';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    const colors = { success: '#4caf50', error: '#f44336', warning: '#ff9800', info: '#2196f3' };
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => { notification.style.display = 'none'; }, 3000);
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

export async function initUser() {
    const currentUser = await checkSession();
    if (!currentUser) return;

    const userNameEl = document.getElementById("user-name");
    const userAvatarEl = document.getElementById("user-avatar");

    userNameEl.textContent = `${currentUser.prenom} ${currentUser.nom}`;
    userAvatarEl.textContent = `${currentUser.prenom[0]}${currentUser.nom[0]}`.toUpperCase();
}