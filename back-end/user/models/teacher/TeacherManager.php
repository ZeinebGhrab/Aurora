<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once 'Teacher.php';
require_once __DIR__ . '/../User.php';
require_once __DIR__ . '/../../../MailService/MailService.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../../phpmailer/src/Exception.php';
require_once __DIR__ . '/../../../phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../../../phpmailer/src/SMTP.php';


require_once __DIR__ . '/../../../../vendor/autoload.php'; // Composer autoload

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../../..');
$dotenv->load();

class TeacherManager {
    private $db;
    private $MailService;

    public function __construct($database) {
        $this->db = $database;
        $this->mailService = new MailService();
    }

    // Récupérer le nombre des enseignants
    public function getCountTeachers() {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("
            SELECT COUNT(*) AS total
            FROM enseignant;
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $teachers = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $teachers;
    }

    // Récupérer tous les enseignants avec filière et statut
    public function getAllTeachers($filters = []) {
        $conn = $this->db->connect();

        $page = isset($filters['page']) ? (int)$filters['page'] : 1;
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 1;
        $offset = ($page - 1) * $limit;

        $query = "
            SELECT 
            u.id_utilisateur,
            u.nom,
            u.prenom,
            u.email,
            u.date_creation,
            u.type_compte,
            u.statut,
            e.grade,
            e.specialite,

            -- Nombre TOTAL de cours que l’enseignant enseigne
            (
                SELECT COUNT(*) 
                FROM cours c 
                WHERE c.id_enseignant = u.id_utilisateur
            ) AS courses_count,

            -- Nombre TOTAL d’étudiants inscrits dans ses cours
            (
                SELECT COUNT(DISTINCT etu.id_etudiant)
                FROM cours c
                JOIN etudiant etu ON etu.id_filiere = c.id_filiere 
                                 AND etu.niveau = c.niveau
                WHERE c.id_enseignant = u.id_utilisateur
            ) AS students_count,
            
             -- Nombre TOTAL de séances que l’enseignant enseigne

            (
                SELECT COUNT(*)
                FROM seance s
                JOIN cours c ON s.id_cours = c.id_cours
                WHERE c.id_enseignant = u.id_utilisateur
            ) AS seances_count

        FROM enseignant e
        JOIN utilisateur u ON e.id_enseignant = u.id_utilisateur
        WHERE 1=1
        ";

        $params = [];
        $types = '';


        // Filtre par statut
        if (isset($filters['statut']) && $filters['statut'] !== '') {
            $query .= " AND u.statut = ?";
            $params[] = $filters['statut'];
            $types .= 's';
        }

        // Filtre par recherche (nom ou prénom)
        if (!empty($filters['search'])) {
            $query .= " AND (u.nom LIKE ? OR u.prenom LIKE ?)";
            $searchTerm = "%" . $filters['search'] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $types .= 'ss';
        }

        // Pagination
        $query .= " LIMIT ?, ?";
        $params[] = $offset;
        $params[] = $limit;
        $types .= 'ii';

        $stmt = $conn->prepare($query);
        if ($params) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $teachers = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        // Total pour pagination
        $countQuery = "
            SELECT COUNT(*) AS total
            FROM enseignant e
            JOIN utilisateur u ON e.id_enseignant = u.id_utilisateur
            WHERE 1=1
        ";

        $countParams = [];
        $countTypes = '';

        if (isset($filters['statut']) && $filters['statut'] !== '') {
            $countQuery .= " AND u.statut = ?";
            $countParams[] = $filters['statut'];
            $countTypes .= 's';
        }

        if (!empty($filters['search'])) {
            $countQuery .= " AND (u.nom LIKE ? OR u.prenom LIKE ?)";
            $searchTerm = "%" . $filters['search'] . "%";
            $countParams[] = $searchTerm;
            $countParams[] = $searchTerm;
            $countTypes .= 'ss';
        }

        $countStmt = $conn->prepare($countQuery);
        if ($countParams) {
            $countStmt->bind_param($countTypes, ...$countParams);
        }

        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $total = $countResult->fetch_assoc()['total'] ?? 0;
        $countStmt->close();

        return [
            "teachers" => $teachers,
            "pagination" => [
                "total" => $total,
                "page" => $page,
                "limit" => $limit,
                "totalPages" => ceil($total / $limit)
            ]
        ];
    }

    // Récupérer un enseignant par ID
    public function getTeacherById($id_enseignant) {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("
            SELECT u.id_utilisateur, u.nom, u.prenom, u.email, u.statut, u.date_creation, u.type_compte, e.grade, e.specialite
            FROM enseignant e
            JOIN utilisateur u ON e.id_enseignant = u.id_utilisateur
            WHERE u.id_utilisateur = ?
        ");
        $stmt->bind_param("i", $id_enseignant);
        $stmt->execute();
        $result = $stmt->get_result();
        $teacher = $result->fetch_assoc();
        $stmt->close();

        return $teacher;
    }

    // Ajouter un enseignant
    public function addTeacher($nom, $prenom, $email, $mot_de_passe, $grade = null, $specialite = null) {
        $conn = $this->db->connect();

        // Créer l'utilisateur
        $stmt = $conn->prepare("
            INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, type_compte)
            VALUES (?, ?, ?, ?, 'enseignant')
        ");
        $hashedPassword = password_hash($mot_de_passe, PASSWORD_DEFAULT);
        $stmt->bind_param("ssss", $nom, $prenom, $email, $hashedPassword);
        $successUser = $stmt->execute();

        if ($successUser) {
            $id_utilisateur = $conn->insert_id;
            $stmt->close();

            // Créer l'entrée dans enseignant
            $stmt2 = $conn->prepare("
                INSERT INTO enseignant (id_enseignant, grade, specialite)
                VALUES (?, ?, ?)
            ");
            $stmt2->bind_param("iss", $id_utilisateur, $grade, $specialite);
            $successTeacher = $stmt2->execute();
            $stmt2->close();
        }

        if ($successUser && $successTeacher) {
            // Envoyer email de bienvenue
            $this->mailService->sendEmail(
                $email, $prenom, $nom,
                'Bienvenue sur Aurora 🎉',
                "Bonjour $prenom $nom,<br><br>
                Votre compte sur <b>Aurora</b> a été créé avec succès.<br>
                Vous pouvez maintenant vous connecter et profiter de nos services.<br><br>
                Merci de votre confiance.<br><br>
                <i>L’équipe Aurora</i>"
            );
        }

        return $successUser && $successTeacher;

    }

    // Mettre à jour un enseignant
    public function updateTeacher($id_enseignant, $nom, $prenom, $email, $grade = null, $specialite = null, $statut= null) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("
            UPDATE utilisateur SET nom = ?, prenom = ?, email = ? , statut = ? WHERE id_utilisateur = ?
        ");
        $stmt->bind_param("ssssi", $nom, $prenom, $email, $statut, $id_enseignant);
        $success = $stmt->execute();
        $stmt->close();

        if ($success) {
            $stmt2 = $conn->prepare("
                UPDATE enseignant SET grade = ?, specialite = ? WHERE id_enseignant = ?
            ");
            $stmt2->bind_param("ssi", $grade, $specialite, $id_enseignant);
            $success = $stmt2->execute();
            $stmt2->close();
        }

         // Si la mise à jour a réussi, envoyer un email de notification
        if ($success) {
            $this->mailService->sendEmail(
                $email,
                $prenom,
                $nom,
                'Mise à jour de votre profil Aurora ✏️',
                "Bonjour $prenom $nom,<br><br>
                Votre profil sur <b>Aurora</b> a été mis à jour avec succès.<br>
                Vous pouvez vérifier vos informations sur la plateforme.<br><br>
                Merci de votre confiance.<br><br>
                <i>L’équipe Aurora</i>"
            );
        }

        return $success;
    }

    // Supprimer un enseignant
    public function deleteTeacher($id_enseignant) {
        $conn = $this->db->connect();
        // Récupérer l'enseignant avant suppression
        $teacher = $this->getTeacherById($id_enseignant);
        $stmt = $conn->prepare("DELETE FROM utilisateur WHERE id_utilisateur = ?");
        $stmt->bind_param("i", $id_enseignant);
        $success = $stmt->execute();
        $stmt->close();

        if ($success) {
            // Envoyer email de suppression
            $this->mailService->sendEmail(
                $teacher['email'], $teacher['prenom'], $teacher['nom'],
                'Compte supprimé ❌',
                "Bonjour {$teacher['prenom']} {$teacher['nom']},<br><br>
                Votre compte sur <b>Aurora</b> a été définitivement supprimé.<br>
                Nous vous remercions d’avoir utilisé notre plateforme.<br><br>
                <i>L’équipe Aurora</i>"
            );
        }

        return $success;
    }

    // Récupérer le nombre d'enseignants par filière et par niveau
    public function getCountTeachersByFiliereAndNiveau() {
        $conn = $this->db->connect();

        $sql = "
            SELECT 
                f.id_filiere,
                f.nom_complet AS nom_filiere,
                COUNT(DISTINCT t.id_enseignant) AS nb_enseignants
            FROM enseignant t
            JOIN cours c ON t.id_enseignant = c.id_enseignant
            JOIN filiere f ON c.id_filiere = f.id_filiere
            GROUP BY f.id_filiere
            ORDER BY f.nom_complet
        ";

        $result = $conn->query($sql);

        $counts = [];
        while ($row = $result->fetch_assoc()) {
            $counts[] = [
                'id_filiere' => $row['id_filiere'],
                'nom_filiere' => $row['nom_filiere'],
                'nb_enseignants' => (int)$row['nb_enseignants']
            ];
        }
        return $counts;
    }
}
?>
