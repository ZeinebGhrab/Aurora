import { deleteCourse } from "./course_api.js";
import { showNotification } from '../utils.js';

export function handleCourseActions(container) {
    container.addEventListener("click", async (e) => {
        if(e.target.closest(".btn-delete")){
            const id = e.target.closest(".btn-delete").dataset.id;
            if(confirm("Voulez-vous vraiment supprimer ce cours ?")){
                const res = await deleteCourse(id);
                if(res.success){
                    showNotification("Cours supprimé !");
                    window.location.reload();
                } else {
                    showNotification("Erreur : " + res.message);
                }
            }
        }

    });
}
