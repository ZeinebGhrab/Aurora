const API_BASE = "/Aurora/back-end";

export async function getCountTeachers() {
    try {
        const res = await fetch(`${API_BASE}/user/api/teacher/get_count_teachers.php`);
        const data = await res.json();
        console.log('Teachers:', data.teachers[0].total);
        
        if (data.teachers && Array.isArray(data.teachers)) return data.teachers[0].total;
        if (Array.isArray(data)) return data;
        return [];
        
    } catch (error) {
        console.error('Erreur getCountTeachers:', error);
        return [];
    }
}


export async function getCountStudents() {
    try {
        const res = await fetch(`${API_BASE}/user/api/student/get_count_students.php`);
        const data = await res.json();
        console.log('Students:', data);
        
        if (data.students && Array.isArray(data.students)) return data.students[0].total;
        if (Array.isArray(data)) return data;
        return [];
        
    } catch (error) {
        console.error('Erreur getCountStudents:', error);
        return [];
    }
}



export async function getCountCourses() {
    try {
        const res = await fetch(`${API_BASE}/course/api/get_count_courses.php`);
        const data = await res.json();
        console.log('courses:', data);
        
        if (data.courses && Array.isArray(data.courses)) return data.courses[0].total;
        if (Array.isArray(data)) return data;
        return [];
        
    } catch (error) {
        console.error('Erreur getCountCourses:', error);
        return [];
    }
}