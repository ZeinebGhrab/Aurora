import { showNotification } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form[action$="login.php"]');
    const errorMsg = document.getElementById('errorMessage');
    
    if (!form) console.error("Formulaire non trouvé !");
    //if (!form || !errorMsg) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = form.querySelector('input[name="email"]');
        const passwordInput = form.querySelector('input[name="mot_passe"]');

        const email = emailInput?.value.trim();
        const password = passwordInput?.value;

        if (!email || !password) {
            showNotification('Veuillez remplir tous les champs.');
            showError('Veuillez remplir tous les champs.');
            return;
        }

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log(result);

            if (result.success) {
                // Redirection selon le rôle de l'utilisateur
                const role = result.user.role.toLowerCase().trim();

                switch(role) {
                    case 'etudiant':
                        window.location.href = '/Aurora/front-end/interfaces/student-management/aurora-student-dashboard.html';
                        break;
                    case 'enseignant':
                        window.location.href = '/Aurora/front-end/interfaces/teacher-management/aurora-teacher-dashboard.html';
                        break;
                    case 'admin':
                        window.location.href = '/Aurora/front-end/interfaces/admin-management/course-management/aurora-course.html';
                        break;
                    default:
                        window.location.href = '/Aurora/front-end/interfaces/aurora-landing-page.html';
                }

            } else {
                showNotification(result.message || 'Email ou mot de passe incorrect.');
                showError(result.message || 'Email ou mot de passe incorrect.');
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
            showNotification('Impossible de contacter le serveur. Veuillez réessayer.');
            showError('Impossible de contacter le serveur. Veuillez réessayer.');
        }
    });

    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';

        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 5000);
    }

    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (errorMsg.style.display === 'block') {
                errorMsg.style.display = 'none';
            }
        });
    });
});
