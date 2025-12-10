import { addCourse, getAllTeachers } from "./course_api.js";
import { getAllFilieres } from '../sector/sector_api.js';
import { showNotification } from '../utils.js';

export async function populateSelects() {
    const teacherSelect = document.getElementById("teacher");
    const filiereSelect = document.getElementById("filiere");

    const teachers = await getAllTeachers();
    teachers.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.id_utilisateur;
        opt.textContent = `${t.nom} ${t.prenom}`;
        teacherSelect.appendChild(opt);
    });

    const filieres = await getAllFilieres();
    filieres.forEach(f => {
        const opt = document.createElement("option");
        opt.value = f.id_filiere;
        opt.textContent = f.nom_complet;
        filiereSelect.appendChild(opt);
    });
}

export function handleFormSubmit() {
    const form = document.getElementById("newCourseForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = {
            nom_cours: form.courseName.value,
            code_cours: form.courseCode.value,
            id_enseignant: form.teacher.value,
            id_filiere: parseInt(form.filiere.value),
            niveau: form.niveau.value
        };
        const res = await addCourse(data);
        if(res.success){
            showNotification("Cours ajouté avec succès !");
            window.location.reload();
        } else {
            showNotification("Erreur : " + res.message);
        }
    });
}
