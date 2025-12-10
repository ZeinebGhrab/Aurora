export let currentUser = null;

// Vérifier session utilisateur
export async function checkSession() {
    try {
        const response = await fetch(`/Aurora/back-end/user/api/auth/check_session.php`);
        const data = await response.json();

        if (data.connect) {
            currentUser = data.user;
            updateUserDisplay();
            return currentUser; // renvoie l'utilisateur connecté
        } else {
            // redirection si non connecté
            if (!window.location.href.includes('aurora-login-page.html') &&
                !window.location.href.includes('aurora-sign-page.html')) {
                window.location.href = '/Aurora/front-end/interfaces/authentification/aurora-login-page.html';
            }
            return null; // renvoie null pour indiquer qu'il n'y a pas d'utilisateur
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de session :', error);
        return null; // renvoie null en cas d'erreur
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
