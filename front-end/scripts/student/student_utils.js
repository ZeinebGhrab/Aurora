import { getAllFilieres } from '../sector/sector_api.js';

export async function populateStudentForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Niveaux
    const niveauFilter = [
    { value: "", label: "Tous les niveaux" },
    { value: "Niveau 1", label: "Niveau 1" },
    { value: "Niveau 2", label: "Niveau 2" },
    { value: "Niveau 3", label: "Niveau 3" }
    ];
    const niveauSelect = form.querySelector("select[name='niveau']");
    if (niveauSelect) {
        niveauFilter.forEach(n => {
            const opt = document.createElement("option");
            opt.value = n.value;
            opt.textContent = n.label;
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

// Peupler les filtres de la page
export async function populateFilters() {
    const filiereFilter = document.querySelector(".filters-section .filter-group select:first-of-type");
    
    if (filiereFilter) {
        const filieres = await getAllFilieres();
        
        // Garder l'option "Toutes les filières"
        const defaultOption = filiereFilter.querySelector("option:first-child");
        filiereFilter.innerHTML = '';
        
        if (defaultOption) {
            filiereFilter.appendChild(defaultOption);
        } else {
            const opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "Toutes les filières";
            filiereFilter.appendChild(opt);
        }
        
        // Ajouter les filières dynamiquement
        filieres.forEach(f => {
            const opt = document.createElement("option");
            opt.value = f.id_filiere;
            opt.textContent = f.nom_complet;
            filiereFilter.appendChild(opt);
        });
    }
}