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

    // Filières
    const filiereSelect = form.querySelector("select[name='id_filiere']");
    if (filiereSelect) {
        const filieres = await getAllFilieres();
        filiereSelect.innerHTML = '<option value="">Sélectionner une filière...</option>';
        filieres.forEach(f => {
            const opt = document.createElement("option");
            opt.value = f.id_filiere;
            opt.textContent = f.nom_complet;
            filiereSelect.appendChild(opt);
        });
    }
}
