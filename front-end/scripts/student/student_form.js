import { addStudent, updateStudent, getStudentById } from "./student_api.js";
import { showNotification } from "../utils.js";

// 🔹 Gérer la soumission du formulaire (ajout ou modification)
export function handleFormSubmit(formId, modal) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = {
            prenom: form.querySelector("[name='prenom']").value,
            nom: form.querySelector("[name='nom']").value,
            email: form.querySelector("[name='email']").value,
            mot_de_passe: form.querySelector("[name='mot_de_passe']")
                ? form.querySelector("[name='mot_de_passe']").value
                : "",
            id_filiere: form.querySelector("[name='id_filiere']").value
                ? parseInt(form.querySelector("[name='id_filiere']").value)
                : null,
            niveau: form.querySelector("[name='niveau']").value || "",
            statut: form.querySelector("[name='statut']").value || "actif",
        };

        const editingId = form.dataset.editingId;
        let res;
        if (editingId) {
            res = await updateStudent(editingId, formData);
        } else {
            res = await addStudent(formData);
        }

        if (res.success) {
            showNotification(editingId ? "Étudiant mis à jour !" : "Étudiant ajouté !");
            modal.classList.remove("active");
            document.body.style.overflow = "";
            window.location.reload();
        } else {
            showNotification("Erreur : " + res.message);
        }
    });
}

// 🔹 Préremplir le formulaire d’édition
export async function fillEditForm(id) {
    const student = await getStudentById(id);
    if (!student) return;

    const form = document.getElementById("editStudentForm");
    form.dataset.editingId = id;

    form.querySelector("[name='prenom']").value = student.prenom || "";
    form.querySelector("[name='nom']").value = student.nom || "";
    form.querySelector("[name='email']").value = student.email || "";
    form.querySelector("[name='mot_de_passe']").value = student.mot_de_passe || "";
    form.querySelector("[name='niveau']").value = student.niveau || "";
    form.querySelector("[name='statut']").value = student.statut || "actif";

    // Remplir filière si disponible
    const filiereSelect = form.querySelector("[name='id_filiere']");
    if (filiereSelect && student.id_filiere) {
        filiereSelect.value = student.id_filiere;
    }
}

// 🔹 Afficher les infos dans le modal de visualisation
export async function fillViewModal(id) {
    const student = await getStudentById(id);
    if (!student) return;

    document.getElementById("viewStudentFirstName").textContent = student.prenom || "N/A";
    document.getElementById("viewStudentLastName").textContent = student.nom || "N/A";
    document.getElementById("viewStudentEmail").textContent = student.email || "N/A";
    document.getElementById("viewStudentNiveau").textContent = student.niveau || "N/A";
    document.getElementById("viewStudentStatut").textContent = student.statut || "N/A";
    document.getElementById("viewStudentDate").textContent = student.date_creation || "N/A";
}
