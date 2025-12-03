import { getCourseByStudent } from "../../course/course_api.js";

export async function loadCourseFilter(filterCourse) {
    if (!filterCourse) return;
    try {
        const data = await getCourseByStudent();
        data.courses.forEach(course => {
            const option = document.createElement("option");
            option.value = course.id_cours;
            option.textContent = course.nom_cours;
            filterCourse.appendChild(option);
        });
    } catch (err) {
        console.error("Erreur chargement cours :", err);
    }
}

export function getFilters(filterStatus, filterCourse, searchInput) {
    return {
        statut: filterStatus?.value === "" ? "" : filterStatus?.value,
        cours: filterCourse?.value || null,
        search: searchInput?.value.trim() || ''
    };
}
