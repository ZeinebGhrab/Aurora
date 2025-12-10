const API_BASE = "/Aurora/back-end";

export async function getAllTeachers(page = 1, limit = 4, filters = {}) {
    try {
        console.log(filters);
        const res = await fetch(`${API_BASE}/user/api/teacher/get_all_teachers.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page, limit, ...filters })
        });
        const data = await res.json();
        console.log('Teachers with pagination:', data);

        
        
        if (data.success) {
            return {
                teachers: data.teachers|| [],
                pagination: data.pagination || {}
            };
        }
        return { teachers: [], pagination: {} };
        
    } catch (error) {
        console.error('Erreur getAllTeachers:', error);
        return { teachers: [], pagination: {} };
    }
}

export async function addTeacher(teacherData) {
    try {
        const res = await fetch(`${API_BASE}/user/api/teacher/add_teacher.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(teacherData)
        });

        const data = await res.json();
        return data;

    } catch (error) {
        console.error('Erreur addTeacher:', error);
        return { success: false, message: error.message };
    }
}

export async function getTeacherById(id_teacher) {
    try {
        const res = await fetch(`${API_BASE}/user/api/teacher/get_teacher.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_teacher })
        });
        const data = await res.json();
        console.log('getTeacherById response:', data);
        
        if (data.success && data.teacher) return data.teacher;
        
        if (data.success) return data;
        
        return null;
    } catch (error) {
        console.error('Erreur getTeacherById:', error);
        return null;
    }
}

export async function updateTeacher(id_teacher, teacherData) {
    try {
        const bodyData = { id_teacher, ...teacherData };
        console.log('updateTeacher payload:', bodyData);

        const res = await fetch(`${API_BASE}/user/api/teacher/update_teacher.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData)
        });

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
        console.error('Erreur updateTeacher:', error);
        return { success: false, message: error.message };
    }
}

export async function deleteTeacher(id_teacher) {
    try {
        const res = await fetch(`${API_BASE}/user/api/teacher/delete_teacher.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id_teacher })
        });
        return await res.json();
    } catch (error) {
        console.error('Erreur deleteTeacher:', error);
        return { success: false, message: error.message };
    }
}

export async function getCountTeachersByFiliere(){
    try {
        const res = await fetch(`${API_BASE}/user/api/teacher/get_teacher_count_by_filiere.php`);
        const data = await res.json();
        console.log('Statistique des étudiants:', data);
        
        if (data) return data;
        return {};
        
    } catch (error) {
        console.error('Erreur getCountTeachersByNiveau:', error);
        return {};
    }
}

export async function getCountTeachers() {
    try {
        const res = await fetch(`${API_BASE}/user/api/teacher/get_count_teachers.php`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Données brutes de l\'API:', data);
        
        if (data.success) {
            return data.teachers[0].total || 0;
        }

        return 0;
        
    } catch (error) {
        console.error('Erreur getCountTeachers:', error);
        return 0;
    }
}