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
            const course = item.course;
            const enseignant = item.enseignant;
            const filiere = item.filiere;

            // Vérifier que course existe
            if (!course) {
                console.warn('Cours invalide:', item);
                return;
            }

            const card = document.createElement("div");
            card.classList.add("course-card");
            card.innerHTML = `
            <div class="course-header">
                <div class="course-code">${course.code_cours || ''}</div>
                <div class="course-name">${course.nom_cours|| ''}</div>
                <div class="course-teacher"><i class="fa-solid fa-user"></i> ${enseignant || 'Non assigné'}</div>
            </div>
            <div class="course-body">
                <div class="course-info">
                    <div class="info-row">
                        <i class="fa-solid fa-users"></i>
                        <span>${course.getNbEtudiants?.() || 0} étudiants inscrits</span>
                    </div>
                    <div class="info-row">
                        <i class="fa-solid fa-clock"></i>
                        <span>${course.getHeures?.() || 0} heures</span>
                    </div>
                    <div class="info-row">
                        <i class="fa-solid fa-building"></i>
                        <span>${filiere || 'N/A'}</span>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="btn-edit" data-id="${course.id_cours}'}"><i class="fa-solid fa-pen"></i> Modifier</button>
                    <button class="btn-delete" data-id="${course.id_cours}}"><i class="fa-solid fa-trash"></i> Supprimer</button>
                </div>
            </div>`;
            container.appendChild(card);
        } catch (error) {
            console.error('Erreur lors du rendu d\'un cours:', error, item);
        }
    });
}