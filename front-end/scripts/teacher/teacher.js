import { initModal } from "./teacher_modal.js";
import { populateTeacherForm } from "./teacher_utils.js";
import { handleFormSubmit } from "./teacher_form.js";
import { handleTeacherActions, loadAndRenderTeachers } from "./teacher_actions.js";

document.addEventListener("DOMContentLoaded", async () => {
    const newModal = initModal("newTeacherModal", "newTeacherForm");
    const editModal = initModal("editTeacherModal", "editTeacherForm");
    initModal("viewTeacherModal");

    await populateTeacherForm("newTeacherForm");
    await populateTeacherForm("editTeacherForm");

    handleFormSubmit("newTeacherForm", newModal);
    handleFormSubmit("editTeacherForm", editModal);

    await loadAndRenderTeachers();
    handleTeacherActions();

    document.querySelector(".btn-new-teacher").addEventListener("click", () => {
        newModal.classList.add("active");
        document.body.style.overflow = "hidden";
    });
});
