export let currentUser = null;

// Vérifier session utilisateur
export async function checkSession() {
    try {
        const response = await fetch(`/Aurora/back-end/user/api/auth/check_session.php`);
        const data = await response.json();

        if (data.connected) {
            currentUser = data.user;
            updateUserDisplay();
        } else {
            if (!window.location.href.includes('aurora-login-page.html') &&
                !window.location.href.includes('aurora-sign-page.html')) {
                window.location.href = '/Aurora/front-end/interfaces/authentification/aurora-login-page.html';
            }
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de session:', error);
    }
}

// Mettre à jour l’affichage utilisateur dans le nav
export function updateUserDisplay() {
    const userElement = document.querySelector('.nav-buttons span');
    if (userElement && currentUser) {
        userElement.innerHTML = `<i class="fas fa-user"></i> ${currentUser.prenom} ${currentUser.nom}`;
    }
}


// Déconnexion
export function logout() {
    window.location.href = `/Aurora/back-end/user/api/auth/logout.php`;
}
