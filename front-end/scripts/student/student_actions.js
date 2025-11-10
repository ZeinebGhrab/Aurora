import { deleteStudent } from "./student_api.js";
import { renderStudents } from "./student_render.js";
import { fillEditForm, fillViewModal } from "./student_form.js";
import { showNotification } from "../utils.js";

export async function loadAndRenderStudents() {
    const { getAllStudents } = await import("./student_api.js");
    const students = await getAllStudents();
    
    const container = document.querySelector(".students-grid");
    if (!container) {
        console.error("Container .students-grid introuvable !");
        return;
    }
    
    renderStudents(students, container);
}

export function handleStudentActions() {
    const container = document.querySelector(".students-grid");
    if (!container) {
        console.error("Container .students-grid introuvable !");
        return;
    }
    
    container.addEventListener("click", async e => {
        const viewBtn = e.target.closest(".btn-view");
        const editBtn = e.target.closest(".btn-edit");
        const deleteBtn = e.target.closest(".btn-delete");

        if (viewBtn) {
            await fillViewModal(viewBtn.dataset.id);
            document.getElementById("viewStudentModal").classList.add("active");
            document.body.style.overflow = "hidden";
        }

        if (editBtn) {
            await fillEditForm(editBtn.dataset.id);
            document.getElementById("editStudentModal").classList.add("active");
            document.body.style.overflow = "hidden";
        }

        if (deleteBtn && confirm("Voulez-vous vraiment supprimer cet etudiant ?")) {
            const res = await deleteStudent(deleteBtn.dataset.id);
            if (res.success) {
                showNotification("Etudiant supprimé !");
                await loadAndRenderStudents();
            } else {
                showNotification("Erreur : " + res.message);
            }
        }
    });
}