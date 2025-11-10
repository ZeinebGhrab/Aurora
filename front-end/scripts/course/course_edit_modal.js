import { getCourseById, updateCourse, getAllTeachers, getAllFilieres } from './course_api.js';
import { showNotification } from '../utils.js';

export async function initEditCourseModal() {
    const editModal = document.getElementById('editCourseModal');
    const editForm = document.getElementById('editCourseForm');
    const closeBtns = editModal ? editModal.querySelectorAll('.modal-close, .btn-cancel') : [];

    if (!editModal || !editForm) {
        console.error("Éléments du modal de modification manquants !");
        return;
    }

    // Fermer modal
    const closeModal = () => {
        editModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeBtns.forEach(btn => btn.addEventListener('click', e => {
        e.preventDefault();
        closeModal();
    }));

    editModal.addEventListener('click', e => {
        if (e.target === editModal) closeModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && editModal.classList.contains('active')) closeModal();
    });

    // Pré-remplir les selects
    await populateEditSelects();

    // Ouvrir modal avec bouton Modifier
    document.addEventListener('click', async e => {
        const btn = e.target.closest('.btn-edit');
        if (!btn) return;

        const courseId = btn.dataset.id;
        const course = await getCourseById(courseId);
        if (!course) return showNotification("Impossible de récupérer le cours");

        editForm.editCourseId.value = course.id_cours;
        editForm.editCourseCode.value = course.code_cours;
        editForm.editCourseName.value = course.nom_cours;

        // Enseignant
        const teacherSelect = document.getElementById("editTeacher");
        if (teacherSelect.querySelector(`option[value="${course.id_enseignant}"]`)) {
            teacherSelect.value = course.id_enseignant;
        } else if (course.id_enseignant) {
            const tempOption = document.createElement('option');
            tempOption.value = course.id_enseignant;
            tempOption.textContent = course.nom_enseignant + " " + course.prenom_enseignant;
            tempOption.selected = true;
            teacherSelect.appendChild(tempOption);
        }

        // Filière
        const filiereSelect = document.getElementById("editFiliere");
        if (filiereSelect.querySelector(`option[value="${course.id_filiere}"]`)) {
            filiereSelect.value = course.id_filiere;
        } else {
            filiereSelect.value = "";
        }

        editForm.editNiveau.value = course.niveau ?? "";

        editModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Soumettre la modification
    editForm.addEventListener('submit', async e => {
        e.preventDefault();

        // Récupérer les valeurs directement depuis le formulaire
        const teacherValue = editForm.editTeacher.value;
        const filiereValue = editForm.editFiliere.value;

        const data = {
            id_cours: editForm.editCourseId.value,
            code_cours: editForm.editCourseCode.value,
            nom_cours: editForm.editCourseName.value,
            id_enseignant: teacherValue ? Number(teacherValue) : null,
            id_filiere: filiereValue ? Number(filiereValue) : null,
            niveau: editForm.editNiveau.value
        };

        const res = await updateCourse(data.id_cours, data);
  
        if (res.success) {
            showNotification("Cours modifié avec succès !");
            window.location.reload();
        } else {
            showNotification("Erreur : " + res.message);
        }
    });

}

// Remplir les selects du modal édition
async function populateEditSelects() {
    const teacherSelect = document.getElementById("editTeacher");
    const filiereSelect = document.getElementById("editFiliere");
    if (!teacherSelect || !filiereSelect) return;

    const teachers = await getAllTeachers();
    const filieres = await getAllFilieres();

    teacherSelect.innerHTML = '<option value="">Sélectionner un enseignant...</option>';
    teachers.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.id_enseignant; 
        opt.textContent = `${t.nom} ${t.prenom}`;
        teacherSelect.appendChild(opt);
    });

    filiereSelect.innerHTML = '<option value="">Sélectionner une filière...</option>';
    filieres.forEach(f => {
        const opt = document.createElement("option");
        opt.value = f.id_filiere;
        opt.textContent = f.nom_complet;
        filiereSelect.appendChild(opt);
    });
}
