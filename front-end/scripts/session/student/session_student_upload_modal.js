import { addPresence } from "../../presence/presence_api.js";
export let currentSessionData = null;

const uploadModal = document.getElementById('uploadModal');

export function openUploadModal(seanceData) {
    if (!seanceData) return console.error("Aucune donnée de séance reçue");
    currentSessionData = seanceData;

    document.getElementById('uploadCourseName').textContent = seanceData.code_cours || '-';
    document.getElementById('uploadTitre').textContent = seanceData.titre || '-';
    document.getElementById('uploadDateTime').textContent = seanceData.date_heure
        ? `${new Date(seanceData.date_heure).toLocaleDateString('fr-FR')} à ${seanceData.date_heure.split(' ')[1]}`
        : '-';
    document.getElementById('uploadTeacher').textContent = `${seanceData.nom_enseignant || ''} ${seanceData.prenom_enseignant || ''}`.trim() || '-';

    const submitBtn = document.getElementById("submitPresenceBtn");

    // Désactiver si déjà présent
    if (seanceData.statut_presence === "présent") {
        submitBtn.disabled = true;
        submitBtn.classList.add("disabled-btn");
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Présence déjà enregistrée';
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove("disabled-btn");
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirmer la Présence';
    }

    uploadModal.classList.add('active');
}


// Fermer modal
document.querySelectorAll('#uploadModal .modal-close, #uploadModal .btn-cancel')
    .forEach(btn => btn.addEventListener('click', () => uploadModal.classList.remove('active')));

// Gestion upload photo
document.getElementById("photoUpload")?.addEventListener("change", function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById("photoPreview");
    const msg = document.getElementById("uploadMessage");

    if (!file) return;
    if (!file.type.startsWith('image/')) return showMessage(msg, "error", "Veuillez sélectionner une image valide");
    if (file.size > 5 * 1024 * 1024) return showMessage(msg, "error", "L'image ne doit pas dépasser 5MB");

    const reader = new FileReader();
    reader.onload = e => {
        preview.src = e.target.result;
        preview.style.display = "block";
        showMessage(msg, "success", "Image chargée avec succès!");
    };
    reader.readAsDataURL(file);
});

function showMessage(container, type, message) {
    container.className = `message-container show ${type}`;
    container.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
}

// Soumettre présence
export function initUploadSubmit(loadSessions, getFilters) {
    document.getElementById("submitPresenceBtn")?.addEventListener("click", async function() {
        const fileInput = document.getElementById("photoUpload");
        const msg = document.getElementById("uploadMessage");

        if (!fileInput.files.length) return showMessage(msg, "error", "Veuillez sélectionner une photo");

        const btn = this;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours...';

        try {
            // Récupérer le fichier depuis le input
            const file = fileInput.files[0];

            // Préparer FormData
            const formData = new FormData();
            formData.append("probe", file); 
            formData.append("id_seance", currentSessionData.id_seance); // ID de la session
            
            // Appel à addPresence
            const response = await addPresence(formData);

            if (response.success) {
                showMessage(msg, "success", "Présence enregistrée avec succès!");
                setTimeout(() => {
                    uploadModal.classList.remove('active');
                    loadSessions(1, getFilters());
                }, 1500);
            } else {
                showMessage(msg, "error", response.message || "Erreur lors de l'enregistrement");
            }
        } catch (err) {
            console.error(err);
            showMessage(msg, "error", "Erreur lors de l'enregistrement");
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Confirmer la Présence';
        }
    });
}

