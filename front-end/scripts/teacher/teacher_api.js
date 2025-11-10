const API_BASE = "/Aurora/back-end";

export async function getAllTeachers() {
    try {
        const res = await fetch(`${API_BASE}/user/api/teacher/get_all_teachers.php`);
        const data = await res.json();
        console.log('Teachers:', data);
        
        if (data.teachers && Array.isArray(data.teachers)) return data.teachers;
        if (Array.isArray(data)) return data;
        return [];
        
    } catch (error) {
        console.error('Erreur getAllTeachers:', error);
        return [];
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