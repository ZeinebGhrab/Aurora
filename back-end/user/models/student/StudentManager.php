<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once 'Student.php';
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

class StudentManager {
    private $db;
    private $MailService;

    public function __construct($database) {
        $this->db = $database;
        $this->mailService = new MailService();
    }

    // Récupérer tous les étudiants avec filière et niveau
    public function getAllStudents($filters = []) {
        $conn = $this->db->connect();

        $page = isset($filters['page']) ? (int)$filters['page'] : 1;
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 12;
        $offset = ($page - 1) * $limit;

        $query = "
            SELECT 
                u.id_utilisateur, 
                u.nom, 
                u.prenom, 
                u.email, 
                u.type_compte,
                u.date_creation,
                u.statut,
                e.niveau, 
                f.nom_complet AS filiere
                FROM etudiant e
                JOIN utilisateur u ON e.id_etudiant = u.id_utilisateur
                LEFT JOIN filiere f ON e.id_filiere = f.id_filiere
                WHERE 1=1
            ";

        $params = [];
        $types = '';

        // Filtre par filière
        if (!empty($filters['filiere'])) {
            $query .= " AND f.id_filiere = ?";
            $params[] = $filters['filiere'];
            $types .= 'i';
        }

         // Filtre par niveau
        if (!empty($filters['niveau'])) {
            $query .= " AND e.niveau = ?";
            $params[] = $filters['niveau'];
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

        // Ajout de la pagination
        $query .= " LIMIT ?, ?";
        $params[] = $offset;
        $params[] = $limit;
        $types .= 'ii';

        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        $students = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        // Récupérer le total pour la pagination
        $countQuery = "
            SELECT COUNT(*) AS total
            FROM etudiant e
            JOIN utilisateur u ON e.id_etudiant = u.id_utilisateur
            LEFT JOIN filiere f ON e.id_filiere = f.id_filiere
            WHERE 1=1
        ";

        // Même logique de filtres pour le total
        $countParams = [];
        $countTypes = '';

        if (!empty($filters['filiere'])) {
            $countQuery .= " AND f.id_filiere = ?";
            $countParams[] = $filters['filiere'];
            $countTypes .= 'i';
        }

        if (!empty($filters['niveau'])) {
            $countQuery .= " AND e.niveau = ?";
            $countParams[] = $filters['niveau'];
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
        if (!empty($countParams)) {
            $countStmt->bind_param($countTypes, ...$countParams);
        }

        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $total = $countResult->fetch_assoc()['total'] ?? 0;
        $countStmt->close();

        return [
            "students" => $students,
            "pagination" => [
                "total" => $total,
                "page" => $page,
                "limit" => $limit,
                "totalPages" => ceil($total / $limit)
            ]
        ];
    }

    // Récupérer le nombre des étudiants
    public function getCountStudents() {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("
            SELECT COUNT(*) AS total
            FROM etudiant;
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $students = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $students;
    }

    // Récupérer le nombre d’étudiants par niveau
    public function getCountStudentsByNiveau() {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("
            SELECT 
            niveau,
            COUNT(*) AS total,
            ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM etudiant)), 2) AS pourcentage
        FROM etudiant
        GROUP BY niveau;
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $students = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $students;
    }

    // Récupérer un étudiant par son ID
    public function getStudentById($id_etudiant) {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("
            SELECT u.id_utilisateur, u.statut, u.date_creation, u.nom, u.prenom, u.email, u.type_compte, e.niveau, e.id_filiere, f.nom_complet AS filiere
            FROM etudiant e
            JOIN utilisateur u ON e.id_etudiant = u.id_utilisateur
            LEFT JOIN filiere f ON e.id_filiere = f.id_filiere
            WHERE u.id_utilisateur = ?
        ");
        $stmt->bind_param("i", $id_etudiant);
        $stmt->execute();
        $result = $stmt->get_result();
        $student = $result->fetch_assoc();
        $stmt->close();

        return $student;
    }

    // Ajouter un étudiant
    public function addStudent($nom, $prenom, $email, $mot_de_passe, $id_filiere, $niveau=null) {
        $conn = $this->db->connect();
        $successStudent = false;

        // Créer l'utilisateur
        $stmt = $conn->prepare("
            INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, type_compte)
            VALUES (?, ?, ?, ?, 'etudiant')
        ");
        $hashedPassword = password_hash($mot_de_passe, PASSWORD_DEFAULT);
        $stmt->bind_param("ssss", $nom, $prenom, $email, $hashedPassword);
        $successUser = $stmt->execute();;
        $stmt->close();

        if ($successUser) {
            $id_utilisateur = $conn->insert_id;

            // Si le niveau n'est pas précisé, on le remplace par la valeur par défaut de la table
            if ($niveau === null || trim($niveau) === '') {
                $stmt2 = $conn->prepare("
                    INSERT INTO etudiant (id_etudiant, id_filiere)
                    VALUES (?, ?)
                ");
                $stmt2->bind_param("ii", $id_utilisateur, $id_filiere);
            } else {
                $stmt2 = $conn->prepare("
                    INSERT INTO etudiant (id_etudiant, id_filiere, niveau)
                    VALUES (?, ?, ?)
                ");
                 $stmt2->bind_param("iis", $id_utilisateur, $id_filiere, $niveau);
            }

            $successStudent = $stmt2->execute();
            $stmt2->close();
        }

        if ($successUser && $successStudent) {
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

        return $successUser && $successStudent;
    }

    // Mettre à jour un étudiant
    public function updateStudent($id_etudiant, $nom, $prenom, $email, $id_filiere, $niveau, $statut) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("
            UPDATE utilisateur SET nom = ?, prenom = ?, email = ? , statut = ? WHERE id_utilisateur = ?
        ");
        $stmt->bind_param("ssssi", $nom, $prenom, $email, $statut, $id_etudiant);
        $success = $stmt->execute();
        $stmt->close();

        if ($success) {
            $stmt2 = $conn->prepare("UPDATE etudiant SET id_filiere = ?, niveau = ? WHERE id_etudiant = ?");
            $stmt2->bind_param("isi", $id_filiere, $niveau, $id_etudiant);
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

    // Supprimer un étudiant
    public function deleteStudent($id_etudiant) {
        $conn = $this->db->connect();
        // Récupérer l'étudiant avant suppression
        $student = $this->getStudentById($id_etudiant);
        $stmt = $conn->prepare("DELETE FROM utilisateur WHERE id_utilisateur = ?");
        $stmt->bind_param("i", $id_etudiant);
        $success = $stmt->execute();
        $stmt->close();

        if ($success) {
            // Envoyer email de suppression
            $this->mailService->sendEmail(
                $student['email'], $student['prenom'], $student['nom'],
                'Compte supprimé ❌',
                "Bonjour {$student['prenom']} {$student['nom']},<br><br>
                Votre compte sur <b>Aurora</b> a été définitivement supprimé.<br>
                Nous vous remercions d’avoir utilisé notre plateforme.<br><br>
                <i>L’équipe Aurora</i>"
            );
        }

        return $success;
    }
}
?>
