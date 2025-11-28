import { getSessionsByStudent } from "../session_api.js";
import { getCourseByStudent } from "../../course/course_api.js";
import { renderPagination } from "../../utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("sessionsContainer");
    const paginationContainer = document.getElementById("sessions-pagination");
    const filterStatus = document.getElementById("filterStatus");
    const filterCourse = document.getElementById("filterCourse");
    const searchInput = document.getElementById("searchSeance");

    // Éléments modals
    const viewModal = document.getElementById("viewModal");
    const uploadModal = document.getElementById("uploadModal");

    if (!container || !paginationContainer) return;

    let currentPage = 1;
    const limit = 6;
    let currentSessionData = null;

    // ==================== FONCTIONS MODALS ====================

    // Modal Visualisation
    function openViewModal(session) {
        currentSessionData = session;
        const dateObj = new Date(session.date_heure);
        
        document.getElementById("viewCourseName").textContent = session.code_cours;
        document.getElementById("viewTitre").textContent = session.titre;
        document.getElementById("viewDate").textContent = dateObj.toLocaleDateString('fr-FR');
        document.getElementById("viewHeure").textContent = `${session.date_heure.split(' ')[1]} - ${session.heure_fin}`;
        document.getElementById("viewSalle").textContent = session.salle;
        document.getElementById("viewTeacher").textContent = `${session.nom_enseignant} ${session.prenom_enseignant}`;
        document.getElementById("viewStatut").textContent = getStatusText(session.statut);
        document.getElementById("viewStatut").className = `status-badge ${getStatusClass(session.statut)}`;
        document.getElementById("viewDescription").textContent = session.description || "Aucune description disponible";

        // Afficher/masquer le bouton "Marquer Présence" selon le statut
        const presenceBtn = document.getElementById("viewPresenceBtn");
        if (presenceBtn) {
            if (session.statut === 'en_cours') {
                presenceBtn.style.display = 'inline-flex';
            } else {
                presenceBtn.style.display = 'none';
            }
        }

        viewModal.classList.add("active");
    }

    function closeViewModal() {
        viewModal.classList.remove("active");
        currentSessionData = null;
    }

    // Modal Upload Photo
    function openUploadModal(sessionData = null) {
        // Si on passe une sessionData, on l'utilise, sinon on garde currentSessionData
        if (sessionData) {
            currentSessionData = sessionData;
        }
        
        if (!currentSessionData) {
            console.error("Aucune donnée de séance disponible");
            return;
        }
        
        // Fermer modal view
        closeViewModal();
        
        // Remplir les infos de la séance
        document.getElementById("uploadCourseName").textContent = currentSessionData.code_cours || "-";
        document.getElementById("uploadTitre").textContent = currentSessionData.titre || "-";
        const dateObj = new Date(currentSessionData.date_heure);
        document.getElementById("uploadDateTime").textContent = 
            `${dateObj.toLocaleDateString('fr-FR')} à ${currentSessionData.date_heure.split(' ')[1]}`;
        document.getElementById("uploadTeacher").textContent = 
            `${currentSessionData.nom_enseignant} ${currentSessionData.prenom_enseignant}`;

        // Réinitialiser le formulaire
        document.getElementById("photoUpload").value = "";
        document.getElementById("photoPreview").style.display = "none";
        document.getElementById("photoPreview").src = "";
        document.getElementById("uploadMessage").innerHTML = "";
        document.getElementById("uploadMessage").className = "message-container";

        uploadModal.classList.add("active");
    }

    function closeUploadModal() {
        uploadModal.classList.remove("active");
    }

    // Gestion upload photo
    document.getElementById("photoUpload")?.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (file) {
            // Vérifier le type de fichier
            if (!file.type.startsWith('image/')) {
                showMessage("error", "Veuillez sélectionner une image valide");
                return;
            }

            // Vérifier la taille (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showMessage("error", "L'image ne doit pas dépasser 5MB");
                return;
            }

            // Afficher l'aperçu
            const reader = new FileReader();
            reader.onload = function(event) {
                const preview = document.getElementById("photoPreview");
                preview.src = event.target.result;
                preview.style.display = "block";
                showMessage("success", "Image chargée avec succès!");
            };
            reader.readAsDataURL(file);
        }
    });

    // Soumettre la présence
    document.getElementById("submitPresenceBtn")?.addEventListener("click", async function() {
        const fileInput = document.getElementById("photoUpload");
        
        if (!fileInput.files.length) {
            showMessage("error", "Veuillez sélectionner une photo");
            return;
        }

        const submitBtn = this;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours...';

        try {
            // Simuler l'envoi (remplacer par votre API)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // TODO: Implémenter l'appel API réel
            // const formData = new FormData();
            // formData.append('photo', fileInput.files[0]);
            // formData.append('id_seance', currentSessionData.id_seance);
            // await markPresence(formData);

            showMessage("success", "Présence enregistrée avec succès!");
            
            setTimeout(() => {
                closeUploadModal();
                // Recharger les séances
                loadSessions(currentPage, getFilters());
            }, 2000);

        } catch (error) {
            console.error("Erreur:", error);
            showMessage("error", "Erreur lors de l'enregistrement de la présence");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirmer la Présence';
        }
    });

    function showMessage(type, message) {
        const messageContainer = document.getElementById("uploadMessage");
        messageContainer.className = `message-container show ${type}`;
        messageContainer.innerHTML = `
            <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
    }

    // Event listeners pour fermer les modals
    document.querySelectorAll(".modal-close, .btn-cancel").forEach(btn => {
        btn.addEventListener("click", function() {
            closeViewModal();
            closeUploadModal();
        });
    });

    // Fermer modal en cliquant à l'extérieur
    [viewModal, uploadModal].forEach(modal => {
        modal?.addEventListener("click", function(e) {
            if (e.target === modal) {
                closeViewModal();
                closeUploadModal();
            }
        });
    });

    // ==================== FONCTIONS DE RENDU ====================

    function renderSessions(sessions) {
        if (!sessions.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-calendar-xmark empty-icon"></i>
                    <h3>Aucune séance trouvée</h3>
                    <p>Aucune séance ne correspond à votre recherche.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = sessions.map(s => {
            const dateObj = new Date(s.date_heure);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleDateString('fr-FR', { month: 'short' });
            
            // Afficher le bouton de présence uniquement si la séance est en cours
            const showPresenceBtn = s.statut === 'en_cours';

            return `
                <div class="seance-card" data-session='${JSON.stringify(s).replace(/'/g, "&apos;")}'>
                    <div class="seance-header">
                        <div class="seance-date">
                            <div class="date-day">${day}</div>
                            <div class="date-month">${month}</div>
                        </div>
                        <div class="seance-info">
                            <div class="seance-title">${s.titre}</div>
                            <div class="seance-course">${s.code_cours}</div>
                        </div>
                        <div class="seance-status ${getStatusClass(s.statut)}">
                            <i class="fa-solid ${getStatusIcon(s.statut)}"></i>
                            ${getStatusText(s.statut)}
                        </div>
                    </div>
                    <div class="seance-body">
                        <div class="seance-details">
                            <div class="detail-row"><i class="fa-solid fa-clock"></i> ${s.date_heure.split(' ')[1]} - ${s.heure_fin}</div>
                            <div class="detail-row"><i class="fa-solid fa-door-open"></i> ${s.salle}</div>
                            <div class="detail-row"><i class="fa-solid fa-chalkboard-user"></i> ${s.nom_enseignant} ${s.prenom_enseignant}</div>
                        </div>
                        <div class="seance-description"><p>${s.description}</p></div>
                        <div class="seance-actions">
                            <button class="btn-action btn-view" onclick="window.viewSession(this)" title="Voir les détails">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            ${showPresenceBtn ? `
                                <button class="btn-action btn-presence" onclick="window.markPresence(this)" title="Marquer présence">
                                    <i class="fa-solid fa-camera"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    // Fonctions globales pour les boutons
    window.viewSession = function(btn) {
        const card = btn.closest('.seance-card');
        const sessionData = JSON.parse(card.dataset.session);
        openViewModal(sessionData);
    };

    window.markPresence = function(btn) {
        const card = btn.closest('.seance-card');
        if (card) {
            const sessionData = JSON.parse(card.dataset.session);
            openUploadModal(sessionData);
        } else {
            // Si appelé depuis le modal view
            openUploadModal();
        }
    };
    
    // Fonction globale pour ouvrir l'upload depuis le modal view
    window.openUploadModalFromView = function() {
        openUploadModal();
    };

    function getStatusClass(s) {
        return { planifiee: "status-planifiee", en_cours: "status-en-cours", terminee: "status-terminee" }[s] || "";
    }
    
    function getStatusText(s) {
        return { planifiee: "Planifiée", en_cours: "En cours", terminee: "Terminée" }[s] || s;
    }
    
    function getStatusIcon(s) {
        return { planifiee: "fa-calendar-plus", en_cours: "fa-spinner fa-spin", terminee: "fa-check-circle" }[s] || "fa-circle";
    }

    // ==================== FILTRE COURS ====================

    async function loadCourseFilter() {
        if (!filterCourse) return;
        try {
            const data = await getCourseByStudent();
            data.courses.forEach(course => {
                const option = document.createElement("option");
                option.value = course.id_cours; 
                option.textContent = course.nom_cours;
                filterCourse.appendChild(option);
            });
        } catch (err) {
            console.error("Erreur chargement cours :", err);
        }
    }

    // ==================== CHARGEMENT SÉANCES ====================

    async function loadSessions(page = 1, filters = {}) {
        currentPage = page;

        try {
            const { sessions, pagination } = await getSessionsByStudent(currentPage, limit, filters);
            renderSessions(sessions);

            renderPagination(pagination, paginationContainer, (newPage) => {
                loadSessions(newPage, filters);
            });
        } catch (err) {
            console.error("Erreur chargement séances :", err);
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-calendar-xmark empty-icon"></i>
                    <h3>Impossible de charger les séances</h3>
                </div>
            `;
            paginationContainer.innerHTML = "";
        }
    }

    // ==================== FILTRES & RECHERCHE ====================
 
    function getFilters() {
        return {
            statut: filterStatus?.value === "all" ? null : filterStatus?.value,
            cours: filterCourse?.value || null,
            search: searchInput?.value.trim() || ''
        };
    }

    filterStatus?.addEventListener("change", () => loadSessions(1, getFilters()));
    filterCourse?.addEventListener("change", () => loadSessions(1, getFilters()));
    searchInput?.addEventListener("input", () => {
        clearTimeout(searchInput._timeout);
        searchInput._timeout = setTimeout(() => loadSessions(1, getFilters()), 300);
    });

    // ==================== INITIALISATION ====================
 
    await loadCourseFilter();
    await loadSessions(currentPage, getFilters());
});