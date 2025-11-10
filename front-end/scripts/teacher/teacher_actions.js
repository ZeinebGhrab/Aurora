import { deleteTeacher } from "./teacher_api.js";
import { renderTeachers } from "./teacher_render.js";
import { fillEditForm, fillViewModal } from "./teacher_form.js";
import { showNotification } from "../utils.js";

export async function loadAndRenderTeachers() {
    const { getAllTeachers } = await import("./teacher_api.js");
    const teachers = await getAllTeachers();
    
    // ✅ FIX : Ajouter le container
    const container = document.querySelector(".teachers-grid");
    if (!container) {
        console.error("Container .teachers-grid introuvable !");
        return;
    }
    
    renderTeachers(teachers, container);
}

export function handleTeacherActions() {
    const container = document.querySelector(".teachers-grid");
    if (!container) {
        console.error("Container .teachers-grid introuvable !");
        return;
    }
    
    container.addEventListener("click", async e => {
        const viewBtn = e.target.closest(".btn-view");
        const editBtn = e.target.closest(".btn-edit");
        const deleteBtn = e.target.closest(".btn-delete");

        if (viewBtn) {
            await fillViewModal(viewBtn.dataset.id);
            document.getElementById("viewTeacherModal").classList.add("active");
            document.body.style.overflow = "hidden";
        }

        if (editBtn) {
            await fillEditForm(editBtn.dataset.id);
            document.getElementById("editTeacherModal").classList.add("active");
            document.body.style.overflow = "hidden";
        }

        if (deleteBtn && confirm("Voulez-vous vraiment supprimer cet enseignant ?")) {
            const res = await deleteTeacher(deleteBtn.dataset.id);
            if (res.success) {
                showNotification("Enseignant supprimé !");
                await loadAndRenderTeachers();
            } else {
                showNotification("Erreur : " + res.message);
            }
        }
    });
}