import { initModal } from "./student_modal.js";
import { populateStudentForm } from "./student_utils.js";
import { handleFormSubmit } from "./student_form.js";
import { handleStudentActions, loadAndRenderStudents } from "./student_actions.js";

document.addEventListener("DOMContentLoaded", async () => {
    const newModal = initModal("newStudentModal", "newStudentForm");
    const editModal = initModal("editStudentModal", "editStudentForm");
    initModal("viewStudentModal");

    await populateStudentForm("newStudentForm");
    await populateStudentForm("editStudentForm");

    handleFormSubmit("newStudentForm", newModal);
    handleFormSubmit("editStudentForm", editModal);

    await loadAndRenderStudents();
    handleStudentActions();

    document.querySelector(".btn-new-student").addEventListener("click", () => {
        newModal.classList.add("active");
        document.body.style.overflow = "hidden";
    });
});
