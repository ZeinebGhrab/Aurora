import { addTeacher, updateTeacher, getTeacherById } from "./teacher_api.js";
import { showNotification } from "../utils.js";
import { loadAndRenderTeachers } from "./teacher_actions.js";

export function handleFormSubmit(formId, modal) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", async e => {
        e.preventDefault();
        const data = {
            prenom: form.querySelector("[name='prenom']").value,
            nom: form.querySelector("[name='nom']").value,
            email: form.querySelector("[name='email']").value,
            mot_de_passe: form.querySelector("[name='mot_de_passe']")?.value || "",
            grade: form.querySelector("[name='grade']").value || "",
            specialite: form.querySelector("[name='specialite']").value || "",
            id_filiere: form.querySelector("[name='id_filiere']")?.value ? parseInt(form.querySelector("[name='id_filiere']").value) : null,
            statut: form.querySelector("[name='statut']").value || "activé"
        };

        const editingId = form.dataset.editingId;
        const res = editingId ? await updateTeacher(editingId, data) : await addTeacher(data);

        if (res.success) {
            showNotification(editingId ? "Enseignant mis à jour !" : "Enseignant ajouté !");
            modal.classList.remove("active");
            document.body.style.overflow = "";
            form.reset();
            delete form.dataset.editingId;
            await loadAndRenderTeachers();
        } else {
            showNotification("Erreur : " + res.message);
        }
    });
}

// ✅ AJOUT : Fonction pour remplir le formulaire d'édition
export async function fillEditForm(teacherId) {
    const teacher = await getTeacherById(teacherId);
    if (!teacher) {
        showNotification("Impossible de récupérer les données de l'enseignant");
        return;
    }

    const form = document.getElementById("editTeacherForm");
    if (!form) return;

    // Stocker l'ID pour la mise à jour
    form.dataset.editingId = teacherId;

    // Remplir les champs
    form.querySelector("#editTeacherId").value = teacher.id_utilisateur || teacher.id_enseignant || "";
    form.querySelector("#editTeacherFirstName").value = teacher.prenom || "";
    form.querySelector("#editTeacherLastName").value = teacher.nom || "";
    form.querySelector("#editTeacherEmail").value = teacher.email || "";
    form.querySelector("#editTeacherGrade").value = teacher.grade || "";
    form.querySelector("#editTeacherSpecialite").value = teacher.specialite || "";
    form.querySelector("#editTeacherStatut").value = teacher.statut || "activé";
}

// ✅ AJOUT : Fonction pour afficher les détails dans le modal de visualisation
export async function fillViewModal(teacherId) {
    const teacher = await getTeacherById(teacherId);
    if (!teacher) {
        showNotification("Impossible de récupérer les données de l'enseignant");
        return;
    }

    // Remplir les éléments de visualisation
    document.getElementById("viewTeacherFirstName").textContent = teacher.prenom || "N/A";
    document.getElementById("viewTeacherLastName").textContent = teacher.nom || "N/A";
    document.getElementById("viewTeacherEmail").textContent = teacher.email || "N/A";
    document.getElementById("viewTeacherGrade").textContent = teacher.grade || "N/A";
    document.getElementById("viewTeacherSpecialite").textContent = teacher.specialite || "N/A";
    document.getElementById("viewTeacherStatut").textContent = teacher.statut || "N/A";
    document.getElementById("viewTeacherDate").textContent = teacher.date_creation 
        ? new Date(teacher.date_creation).toLocaleDateString('fr-FR')
        : "N/A";
}