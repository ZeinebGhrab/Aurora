export function renderStudents(students, container) {
    if (!students || !Array.isArray(students)) {
        console.warn("students n'est pas un tableau valide:", students);
        container.innerHTML = `
            <p class="error-message">Erreur lors du chargement des étudiants</p>
        `;
        return;
    }

    container.innerHTML = "";

    if (students.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-user-graduate empty-icon" style="font-size:4rem; color:#5299cf; margin-bottom:1.5rem; opacity:0.6; display:block;"></i>
                <h3 class="empty-title">Aucun étudiant trouvé</h3>
                <p class="empty-text">Cliquez sur "Nouvel Étudiant" pour en ajouter un</p>
            </div>
        `;
        return;
    }

    const avatarColors = ["purple", "blue", "green", "orange", "pink"];

    students.forEach((student, index) => {
        try {
            const initials = `${student.prenom?.charAt(0) || "?"}${student.nom?.charAt(0) || "?"}`.toUpperCase();
            const avatarClass = avatarColors[index % avatarColors.length];

            const card = document.createElement("div");
            card.classList.add("teacher-card");
            
            card.innerHTML = `
                <div class="teacher-header">
                    <div class="teacher-avatar ${avatarClass}">
                        ${initials}
                        ${student.statut === "activé" ? '<div class="online-indicator"></div>' : ""}
                    </div>
                    <div class="teacher-info">
                        <h3>${student.prenom || ""} ${student.nom || ""}</h3>
                        <div class="teacher-title">${student.niveau || "Non défini"}</div>
                    </div>
                </div>
                <div class="teacher-details">
                    <div class="detail-item">
                        <i class="fa-solid fa-circle-user"></i>
                        <span>${student.statut === "activé" ? 'Activé' : "Désactivé"}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fa-regular fa-envelope"></i>
                        <span>${student.email || "Non renseigné"}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fa-solid fa-user-graduate"></i>
                        <span>${student.filiere || "Filière inconnue"}</span>
                    </div>
                </div>
                <div class="teacher-actions">
                    <button class="btn-view" data-id="${student.id_utilisateur}"><i class="fa-solid fa-eye"></i> Voir</button>
                    <button class="btn-edit" data-id="${student.id_utilisateur}"><i class="fa-solid fa-pen"></i> Modifier</button>
                    <button class="btn-delete" data-id="${student.id_utilisateur}"><i class="fa-solid fa-trash"></i> Supprimer</button>
                </div>
            `;

            container.appendChild(card);
        } catch (error) {
            console.error("Erreur lors du rendu d'un étudiant:", error, student);
        }
    });
}
