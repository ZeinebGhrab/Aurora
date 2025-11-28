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
                <i class="fa-solid fa-user-graduate empty-icon"></i>
                <h3 class="empty-title">Aucun étudiant trouvé</h3>
                <p class="empty-text">Cliquez sur "Nouvel Étudiant" pour en ajouter un</p>
            </div>
        `;
        return;
    }

    const avatarColors = ["avatar-red", "avatar-blue", "avatar-green", "avatar-purple", "avatar-orange"];

    students.forEach((student, index) => {
        try {
            const initials = `${student.prenom?.charAt(0) || "?"}${student.nom?.charAt(0) || "?"}`.toUpperCase();
            const avatarClass = avatarColors[index % avatarColors.length];

            const card = document.createElement("div");
            card.classList.add("student-card");
            card.innerHTML = `
                <div class="student-actions">
                    <button class="btn-edit" title="Modifier" data-id="${student.id_utilisateur}">
                        <i class="fa-solid fa-user-pen"></i>
                    </button>
                    <button class="btn-delete" title="Supprimer" data-id="${student.id_utilisateur}">
                        <i class="fa-solid fa-user-minus"></i>
                    </button>
                </div>

                <div class="student-header">
                    <div class="student-avatar ${avatarClass}">
                        ${initials}
                        ${student.statut === "actif" ? '<div class="online-indicator"></div>' : ""}
                    </div>
                    <div class="student-info">
                        <h3>${student.prenom || ""} ${student.nom || ""}</h3>
                        <div class="student-id">${student.id_utilisateur || "ID Inconnu"}</div>
                        <span class="badge">${student.niveau || "Non défini"}</span>
                    </div>
                </div>

                <div class="student-details">
                    <div class="detail-row">
                        <i class="fa-regular fa-envelope"></i>${student.email || "Non renseigné"}
                    </div>
                    <div class="detail-row">
                        <i class="fa-regular fa-clock"></i>${student.filiere || "Filière inconnue"}
                    </div>
                </div>
            `;

            container.appendChild(card);
        } catch (error) {
            console.error("Erreur lors du rendu d'un étudiant:", error, student);
        }
    });
}
