import { getAllFilieres } from "./student_api.js";

export async function populateStudentForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Niveaux
    const niveaux = ["Niveau 1", "Niveau 2", "Niveau 3"];
    const niveauSelect = form.querySelector("select[name='niveau']");
    if (niveauSelect) {
        niveauSelect.innerHTML = `<option value="">Sélectionner un niveau...</option>`;
        niveaux.forEach(n => {
            const opt = document.createElement("option");
            opt.value = n;
            opt.textContent = n;
            niveauSelect.appendChild(opt);
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
