const API_BASE = "/Aurora/back-end";

//  GET ALL SEANCES

export async function getAllSessions(page = 1, limit = 6,filters = {}) {
    try {
        const res = await fetch(`${API_BASE}/session/api/get_all_sessions.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page, limit, ...filters })
        });
        const data = await res.json();
        console.log('datasessions', data.sessions);

        if (data.success) return {
                sessions: data.sessions|| [],
                pagination: data.pagination || {}
            };
        return { sessions: [], pagination: {} };
    } catch (error) {
        console.error("Erreur getAllSeances:", error);
        return { sessions: [], pagination: {} };
    }
}




//  GET SEANCES BY TEACHER

export async function getSessionsByTeacher(page = 1, limit = 6,filters = {}) {
    try {
        const res = await fetch(`${API_BASE}/session/api/get_sessions_by_teacher.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page, limit, ...filters })
        });
        const data = await res.json();
        console.log("getSeancesByTeacher", data);

        if (data.success) return {
                sessions: data.sessions|| [],
                pagination: data.pagination || {}
            };
        return { sessions: [], pagination: {} };

    } catch (error) {
        console.error("Erreur getSeancesByTeacher:", error);
        return { sessions: [], pagination: {} };
    }
}



// ==============================
//  GET SEANCES BY STUDENT
// ==============================
export async function getSessionsByStudent(page = 1, limit = 6,filters = {}) {
    try {
        const res = await fetch(`${API_BASE}/session/api/get_sessions_by_student.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page, limit, ...filters })
        });
        const data = await res.json();
        console.log("getSeancesByStudent:", data);

        if (data.success) return {
                sessions: data.sessions|| [],
                pagination: data.pagination || {}
            };
        return { sessions: [], pagination: {} };

    } catch (error) {
        console.error("Erreur getSeancesByStudent:", error);
        return { sessions: [], pagination: {} };
    }
}



// ==============================
//  GET SEANCE BY ID
// ==============================
export async function getSessionById(id_seance) {
    try {
        const res = await fetch(`${API_BASE}/session/api/get_session.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_seance })
        });

        const data = await res.json();
        console.log("getSeanceById:", data);

        if (data.success && data.session) return data.session;
        return null;

    } catch (error) {
        console.error("Erreur getSeanceById:", error);
        return null;
    }
}



// ==============================
//  ADD SEANCE (avec vérification disponibilité backend)
// ==============================
export async function addSession(seanceData) {
    try {
        const res = await fetch(`${API_BASE}/session/api/add_session.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(seanceData)
        });

        const data = await res.json();
        console.log("addSession:", data);

        return data;

    } catch (error) {
        console.error("Erreur addSession:", error);
        return { success: false, message: error.message };
    }
}



// ==============================
//  UPDATE SEANCE (avec vérification conflits)
// ==============================
export async function updateSession(id_seance, seanceData) {
    try {
        const bodyData = { id_seance, ...seanceData };

        const res = await fetch(`${API_BASE}/session/api/update_session.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData)
        });

        const text = await res.text();
        let json;

        try {
            json = JSON.parse(text);
        } catch {
            console.error("Réponse non-JSON :", text);
            throw new Error("Réponse serveur invalide");
        }

        return json;

    } catch (error) {
        console.error("Erreur updateSeance:", error);
        return { success: false, message: error.message };
    }
}



// ==============================
//  DELETE SEANCE
// ==============================
export async function deleteSession(id_seance) {
    try {
        const res = await fetch(`${API_BASE}/session/api/delete_session.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_seance })
        });

        const data = await res.json();
        return data;

    } catch (error) {
        console.error("Erreur deleteSeance:", error);
        return { success: false, message: error.message };
    }
}
