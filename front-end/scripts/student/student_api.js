const API_BASE = "/Aurora/back-end";

export async function getAllStudents(page = 1, limit = 4, filters = {}) {
    try {
        console.log(filters);
        const res = await fetch(`${API_BASE}/user/api/student/get_all_students.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page, limit, ...filters })
        });

        const data = await res.json();
        console.log('Students with pagination:', data);

        if (data.success) {
            return {
                students: data.students|| [],
                pagination: data.pagination || {}
            };
        }

        return { students: [], pagination: {} };
    } catch (error) {
        console.error('Erreur getAllStudents:', error);
        return { students: [], pagination: {} };
    }
}



export async function addStudent(studentData) {
    try {
        console.log(studentData);
        const res = await fetch(`${API_BASE}/user/api/student/add_student.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(studentData)
        });
        
        const data = await res.json();

        return data;

    } catch (error) {
        console.error('Erreur addStudent:', error);
        return { success: false, message: error.message };
    }
}

export async function getStudentById(id_student) {
    try {
        const res = await fetch(`${API_BASE}/user/api/student/get_student.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_student })
        });
        const data = await res.json();
        console.log('getStudentById response:', data);
        
        if (data.success && data.student) return data.student;
        if (data.success) return data;
        
        return null;
    } catch (error) {
        console.error('Erreur getStudentById:', error);
        return null;
    }
}

export async function updateStudent(id_student, studentData) {
    try {
        const bodyData = { id_student, ...studentData };
        console.log('updateStudent payload:', bodyData);

        const res = await fetch(`${API_BASE}/user/api/student/update_student.php`, {
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
        console.error('Erreur updateStudent:', error);
        return { success: false, message: error.message };
    }
}

export async function deleteStudent(id_student) {
    try {
        const res = await fetch(`${API_BASE}/user/api/student/delete_student.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id_student })
        });
        return await res.json();
    } catch (error) {
        console.error('Erreur deleteStudent:', error);
        return { success: false, message: error.message };
    }
}

export async function getCountStudentsByFiliere() {
    try {
        const res = await fetch(`${API_BASE}/user/api/student/get_student_count_by_filiere.php`);
        const data = await res.json();
        console.log('Students:', data);
        
        if (data.students && Array.isArray(data.students)) return data.students;
        if (Array.isArray(data)) return data;
        return [];
        
    } catch (error) {
        console.error('Erreur getCountStudents:', error);
        return [];
    }
}

export async function getCountStudents() {
    try {
        const res = await fetch(`${API_BASE}/user/api/student/get_count_students.php`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Données brutes de l\'API:', data);
        
        if (data.success) {
            return  data.students[0].total || 0;
        }

        return 0;
        
    } catch (error) {
        console.error('Erreur getCountStudents:', error);
        return 0;
    }
}