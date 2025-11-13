import { getAllFilieres } from "./teacher_api.js";

export async function populateTeacherForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Grades
    const grades = ["Maître Assistant", "Maître de Conférences", "Professeur"];
    const gradeSelect = form.querySelector("select[name='grade']");
    if (gradeSelect) {
        gradeSelect.innerHTML = `<option value="">Sélectionner un grade...</option>`;
        grades.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g;
            opt.textContent = g;
            gradeSelect.appendChild(opt);
        });
    }
}
