const API_BASE = "/Aurora/back-end";

export async function getAllCourses(page = 1, limit = 12, filters = {}) {
    try {
        const res = await fetch(`${API_BASE}/course/api/get_all_courses.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page, limit, ...filters })
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Données brutes de l\'API:', data);
        
        if (data.success) {
            return {
                courses: data.courses|| [],
                pagination: data.pagination || {}
            };
        }

        return { courses: [], pagination: {} };
        
    } catch (error) {
        console.error('Erreur getAllCourses:', error);
        return { courses: [], pagination: {} };
    }
}


export async function getAllTeachers() {
    try {
        const res = await fetch(`${API_BASE}/user/api/teacher/get_all_teachers.php`);
        const data = await res.json();
        
        if (data.teachers && Array.isArray(data.teachers)) return data.teachers;
        if (Array.isArray(data)) return data;
        return [];
        
    } catch (error) {
        console.error('Erreur getAllTeachers:', error);
        return [];
    }
}

export async function getAllFilieres() {
    try {
        const res = await fetch(`${API_BASE}/sector/api/get_all_sector.php`);
        const data = await res.json();
        console.log('Filières:', data);
        
        if (data.programs && Array.isArray(data.programs)) return data.programs;
        if (Array.isArray(data)) return data;
        return [];
        
    } catch (error) {
        console.error('Erreur getAllFilieres:', error);
        return [];
    }
}

export async function addCourse(courseData) {
    try {
        console.log(courseData);
        const res = await fetch(`${API_BASE}/course/api/add_course.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(courseData)
        });

        const data = await res.json();
        return data;

    } catch (error) {
        console.error('Erreur addCourse:', error);
        return { success: false, message: error.message };
    }
}


export async function getCourseById(id_cours) {
    try {
        const res = await fetch(`${API_BASE}/course/api/get_course.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_cours })
        });
        const data = await res.json();
        console.log("getCourseById",data);
        if (data.success && data.course) return data.course;
        return null;
    } catch (error) {
        console.error('Erreur getCourseById:', error);
        return null;
    }
}

export async function getCourseByStudent(page = 1, limit = 6, filters = {}) {
    try {
        const res = await fetch(`${API_BASE}/course/api/get_courses_by_student.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page, limit, ...filters })
        });
        const data = await res.json();
        console.log("getCourseByStudent",data);
        if (data.success && data.courses) return {
                courses: data.courses|| [],
                pagination: data.pagination || {}
            };
        return { courses: [], pagination: {} };
    } catch (error) {
        console.error('Erreur getCourseByStudent:', error);
        return { courses: [], pagination: {} };
    }
}


export async function getCourseByTeacher(page = 1, limit = 6, filters = {}) {
    try {
        const res = await fetch(`${API_BASE}/course/api/get_courses_by_teacher.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page, limit, ...filters })
        });
        const data = await res.json();
        console.log("getCourseByTeacher",data);
        if (data.success && data.courses)  return {
                courses: data.courses|| [],
                pagination: data.pagination || {}
            };
        return { courses: [], pagination: {} };
    } catch (error) {
        console.error('Erreur getCourseByTeacher:', error);
        return { courses: [], pagination: {} };
    }
}

export async function updateCourse(id_cours, courseData) {
    try {
        // inclure id_cours dans le corps
        const bodyData = { id_cours, ...courseData };
        console.log(bodyData);

        const res = await fetch(`${API_BASE}/course/api/update_course.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData)
        });

        // lire la réponse textuelle pour debugger
        const text = await res.text();
        let json;
        try {
            json = JSON.parse(text);
        } catch (e) {
            console.error("Réponse non JSON :", text);
            throw e;
        }

        return json;
    } catch (error) {
        console.error('Erreur updateCourse:', error);
        return { success: false, message: error.message };
    }
}



export async function deleteCourse(id_cours) {
    try {
        const res = await fetch(`${API_BASE}/course/api/delete_course.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id_cours })
        });
        return await res.json();
    } catch (error) {
        console.error('Erreur deleteCourse:', error);
        return { success: false, message: error.message };
    }
}
