import { getPresencesBySession } from "./presence_api.js";
import { renderPagination, showNotification } from "../utils.js";
import { openEditPresenceModal } from "./presence_edit_modal.js";
import { deletePresence } from "./presence_api.js";

export async function showAbsences(
    courseCode,
    sessionId,
    sessionTitle = "Séance",
    isAdmin = false,
    page = 1,
    limit = 10
) {
    const courseName = document.getElementById("courseTitle").textContent;
    console.log("sessionId",sessionId);

    // Affichage des vues
    document.getElementById("coursesView").style.display = "none";
    document.getElementById("sessionsView").style.display = "none";
    document.getElementById("absencesView").style.display = "block";

    document.getElementById("breadcrumb").style.display = "flex";
    document.getElementById("breadcrumbText").textContent = `${courseName} > ${sessionTitle}`;

    document.getElementById("btnExportPDF").style.display = "inline-flex";
    document.getElementById("btnExportExcel").style.display = "inline-flex";

    const tableBody = document.getElementById("presenceTableBody");
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center; padding:2rem;">
                <i class="fas fa-spinner fa-spin"></i> Chargement des étudiants...
            </td>
        </tr>`;

    try {
        const { presences, pagination } = await getPresencesBySession(sessionId, page, limit);

        if (!presences || presences.length === 0) {
            tableBody.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-clipboard-question" style="font-size: 3rem; color: #D1D5DB; margin-bottom: 1rem;"></i>
                    <h3 style="font-size: 1.25rem; color: #374151; margin-bottom: 0.5rem;">Aucune présence trouvée</h3>
                    <p style="color: #6B7280;">Ce séance n'a pas encore de présences.</p>
                </div>`
            return;
        }

        const students = presences.map(p => ({
            id_presence: p.id_presence,
            name: p.full_name,
            avatar: p.full_name?.split(" ").map(n => n[0].toUpperCase()).join("") ?? "-",
            time: p.heure_arrivee || "-",
            heure_fin: p.heure_fin || "-",
            status: p.statut?.toLowerCase() ?? "-"
        }));

        const total = students.length;
        const present = students.filter(s => s.status === "présent").length;
        const absent = students.filter(s => s.status === "absent").length;
        const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        displaySessionStats(total, present, absent, rate);
        displayStudentsTable(students, isAdmin);

        // Pagination
        const paginationContainer = document.getElementById("presencePagination");
        if (paginationContainer && pagination) {
            renderPagination(
                pagination,
                paginationContainer,
                (newPage) => showAbsences(courseCode, sessionId, sessionTitle, isAdmin, newPage, limit)
            );
        }
    } catch (error) {
        console.error("Erreur chargement présences:", error);
        tableBody.innerHTML = `
            <tr><td colspan="6" style="text-align:center; color:red;">
                Erreur lors du chargement des étudiants : ${error.message}
            </td></tr>`;
    }
}

// STATISTIQUES 

export function displaySessionStats(total, present, absent = 0, rate = 0) {
    const sessionStats = document.getElementById("sessionStats");
    if (!sessionStats) return;

    sessionStats.innerHTML = `
        <div class="stat-item"><div class="stat-icon blue"><i class="fas fa-users"></i></div><div class="stat-content"><div class="stat-value">${total}</div><div class="stat-label">Total étudiants</div></div></div>
        <div class="stat-item"><div class="stat-icon green"><i class="fas fa-user-check"></i></div><div class="stat-content"><div class="stat-value">${present}</div><div class="stat-label">Présents</div></div></div>
        <div class="stat-item"><div class="stat-icon red"><i class="fas fa-user-xmark"></i></div><div class="stat-content"><div class="stat-value">${absent}</div><div class="stat-label">Absents</div></div></div>
        <div class="stat-item"><div class="stat-icon purple"><i class="fas fa-percentage"></i></div><div class="stat-content"><div class="stat-value">${rate}%</div><div class="stat-label">Taux de présence</div></div></div>
    `;
}

// TABLEAU 

export function displayStudentsTable(students, isAdmin) {
    const tableBody = document.getElementById("presenceTableBody");
    if (!tableBody) return;

    const studentCount = document.getElementById("studentCount");
    if (studentCount) studentCount.textContent = `${students.length} étudiants`;

    tableBody.innerHTML = "";

    students.forEach(student => {
        tableBody.innerHTML += createStudentRow(student, isAdmin);
    });

    // Attacher les actions admin (si admin)
    if (isAdmin) {
        attachAdminEvents();
    }
}

function createStudentRow(student, isAdmin) {
    return `
    <tr>
        <td>
            <div class="student-info">
                <div class="avatar">${student.avatar}</div>
                <span>${student.name}</span>
            </div>
        </td>

        <td>${student.time}</td>
        <td>${student.heure_fin}</td>
        <td>${getStatusBadge(student.status)}</td>

        ${isAdmin ? `
            <td>
                <div class="action-buttons">
                    <button class="btn-update" data-id="${student.id_presence}">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>

                    <button class="btn-delete" data-id="${student.id_presence}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        ` : ""}
    </tr>
    `;
}

// BADGE STATUT 

function getStatusBadge(status) {
    switch (status) {
        case "présent":
            return `<span class="status-badge present"><i class="fas fa-check-circle"></i> Présent</span>`;
        case "absent":
            return `<span class="status-badge absent"><i class="fas fa-times-circle"></i> Absent</span>`;
        default:
            return `<span class="status-badge">-</span>`;
    }
}

// ACTIONS ADMIN 

function attachAdminEvents() {
    // Modifier
    document.querySelectorAll(".btn-update").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            openEditPresenceModal(id);
        });
    });

    // Supprimer
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");

            if (confirm("Voulez-vous vraiment supprimer cette présence ?")) {
                const result = await deletePresence(id);

                if (result.success) {
                    showNotification("Présence supprimée avec succès !", "success");
                    window.location.reload();
                } else {
                    showNotification("Erreur : " + result.message, "error");
                }
            }
        });
    });
}
