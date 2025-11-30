<?php
require_once __DIR__ . '/../../config/Database.php';
require_once 'Course.php';
require_once __DIR__ . '/../../MailService/MailService.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../phpmailer/src/Exception.php';
require_once __DIR__ . '/../../phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../../phpmailer/src/SMTP.php';


require_once __DIR__ . '/../../../vendor/autoload.php'; // Composer autoload

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../..');
$dotenv->load();


class CourseManager {
    private $db;

    public function __construct($database) {
        $this->db = $database;
        $this->mailService = new MailService();
    }

    // Ajouter un nouveau cours et notifier
    public function addCourse($nom_cours, $code_cours, $id_enseignant, $id_filiere, $niveau) {
        $conn = $this->db->connect();

        // Ajouter le cours
        $stmt = $conn->prepare("
        INSERT INTO cours (nom_cours, code_cours, id_enseignant, id_filiere, niveau)
        VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->bind_param("ssiss", $nom_cours, $code_cours, $id_enseignant, $id_filiere, $niveau);

        $success = $stmt->execute();
        
        $stmt->close();

        if ($success) {
            // Récupérer l'email de l'enseignant
            $stmt = $conn->prepare("
                SELECT u.email, u.nom, u.prenom
                FROM enseignant e
                JOIN utilisateur u ON e.id_enseignant = u.id_utilisateur
                WHERE e.id_enseignant = ?
            ");
            $stmt->bind_param("i", $id_enseignant);
            $stmt->execute();
            $result = $stmt->get_result();
            $enseignant = $result->fetch_assoc();
            $stmt->close();

            // Envoyer email à l'enseignant
            if ($enseignant) {
                $this->mailService->sendEmail(
                    $enseignant['email'],
                    $enseignant['prenom'],
                    $enseignant['nom'],
                    "Nouveau cours assigné 🎓",
                    "Bonjour {$enseignant['prenom']} {$enseignant['nom']},<br><br>
                     Vous avez été assigné comme enseignant du cours <b>$nom_cours</b> ($code_cours) pour le niveau $niveau, filière $id_filiere.<br><br>
                     Merci."
                );
            }
            // Récupérer les étudiants du niveau et de la filière
            $stmt = $conn->prepare("
                SELECT u.email, u.nom, u.prenom
                FROM etudiant e
                JOIN utilisateur u ON e.id_etudiant = u.id_utilisateur
                WHERE e.niveau = ? AND e.id_filiere = ?
            ");
            $stmt->bind_param("si", $niveau, $id_filiere);
            $stmt->execute();
            $result = $stmt->get_result();

            while ($etudiant = $result->fetch_assoc()) {
                $this->mailService->sendEmail(
                    $etudiant['email'],
                    $etudiant['prenom'],
                    $etudiant['nom'],
                    "Nouveau cours disponible 📚",
                    "Bonjour {$etudiant['prenom']} {$etudiant['nom']},<br><br>
                     Un nouveau cours <b>$nom_cours</b> ($code_cours) a été ajouté pour votre niveau $niveau et votre filière.<br><br>
                     Connectez-vous pour consulter le cours."
                );
            }
            $stmt->close();
        }

        return $success;
    }

    // Récupérer le nombre des cours
    public function getCountCourses() {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("
            SELECT COUNT(*) AS total
            FROM cours;
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $courses = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $courses;
    }

// Récupérer tous les cours avec filtres et pagination
public function getAllCourses($filters = []) {
    $conn = $this->db->connect();

    $page = isset($filters['page']) ? (int)$filters['page'] : 1;
    $limit = isset($filters['limit']) ? (int)$filters['limit'] : 1000; // grande valeur par défaut
    $offset = ($page - 1) * $limit;

    $query = "
        SELECT 
            c.id_cours, c.nom_cours, c.code_cours, c.id_enseignant, c.id_filiere, c.niveau,
            u.nom AS nom_enseignant,
            u.prenom AS prenom_enseignant,
            u.email AS email_enseignant,
            f.nom_complet AS nom_filiere,
            COUNT(e.id_etudiant) AS nb_etudiants
        FROM cours c
        LEFT JOIN enseignant t ON c.id_enseignant = t.id_enseignant
        LEFT JOIN utilisateur u ON t.id_enseignant = u.id_utilisateur
        LEFT JOIN filiere f ON c.id_filiere = f.id_filiere
        LEFT JOIN etudiant e ON e.id_filiere = c.id_filiere
        WHERE 1=1
    ";

    $params = [];
    $types = '';

    // Filtre par recherche uniquement sur le nom du cours
    if (!empty($filters['search'])) {
        $query .= " AND c.nom_cours LIKE ?";
        $searchTerm = "%" . $filters['search'] . "%";
        $params[] = $searchTerm;
        $types .= 's';
    }

    // Filtre par filière
    if (!empty($filters['filiere'])) {
        $query .= " AND c.id_filiere = ?";
        $params[] = $filters['filiere'];
        $types .= 'i';
    }

    // Pagination
    $query .= " GROUP BY c.id_cours ORDER BY c.nom_cours ASC LIMIT ?, ?";
    $params[] = $offset;
    $params[] = $limit;
    $types .= 'ii';

    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $courses = [];
    while ($row = $result->fetch_assoc()) {
        $courses[] = [
            'id_cours' => $row['id_cours'],
            'nom_cours' => $row['nom_cours'],
            'code_cours' => $row['code_cours'],
            'id_enseignant' => $row['id_enseignant'],
            'email_enseignant' => $row['email_enseignant'],
            'id_filiere' => $row['id_filiere'],
            'niveau' => $row['niveau'],
            'enseignant' => $row['nom_enseignant'] ? $row['nom_enseignant'] . " " . $row['prenom_enseignant'] : 'Non assigné',
            'filiere' => $row['nom_filiere'] ?? 'N/A',
            'nb_etudiants' => (int)$row['nb_etudiants']
        ];
    }

    $stmt->close();

    // Total pour pagination (même filtre search et filière)
    $countQuery = "SELECT COUNT(*) AS total FROM cours c
                   LEFT JOIN enseignant e ON c.id_enseignant = e.id_enseignant
                   LEFT JOIN utilisateur u ON e.id_enseignant = u.id_utilisateur
                   LEFT JOIN filiere f ON c.id_filiere = f.id_filiere
                   WHERE 1=1";

    $countParams = [];
    $countTypes = '';

    if (!empty($filters['search'])) {
        $countQuery .= " AND c.nom_cours LIKE ?";
        $countParams[] = $searchTerm;
        $countTypes .= 's';
    }

    if (!empty($filters['filiere'])) {
        $countQuery .= " AND c.id_filiere = ?";
        $countParams[] = $filters['filiere'];
        $countTypes .= 'i';
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
        'courses' => $courses,
        'pagination' => [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil($total / $limit)
        ]
    ];
}


    // Récupérer un cours par ID
    public function getCourseById($id_cours) {
        $conn = $this->db->connect();

        $sql = "SELECT 
                c.*, 
                u.email AS mail_enseignant, 
                u.id_utilisateur AS id_enseignant ,
                u.nom AS nom_enseignant, 
                u.prenom AS prenom_enseignant,
                u.email AS mail_enseignant
            FROM cours c
            LEFT JOIN utilisateur u ON c.id_enseignant = u.id_utilisateur
            WHERE c.id_cours = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id_cours);
        $stmt->execute();

        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();

        if ($row) {
            return [
                'id_cours' => $row['id_cours'],
                'nom_cours' => $row['nom_cours'],
                'code_cours' => $row['code_cours'],
                'id_enseignant' => $row['id_enseignant'],
                'mail_enseignant' => $row['mail_enseignant'],
                'nom_enseignant' => $row['nom_enseignant'],
                'prenom_enseignant' => $row['prenom_enseignant'],
                'id_filiere' => $row['id_filiere'],
                'niveau' => $row['niveau']
            ];
        }

         return null;
    }

    // Mettre à jour un cours
    public function updateCourse(Course $course) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("
            UPDATE cours 
            SET nom_cours = ?, code_cours = ?, id_enseignant = ?, id_filiere = ?, niveau = ?
            WHERE id_cours = ?
        ");

        $nom = $course->getNom();
        $code = $course->getCode();
        $idEnseignant = $course->getIdEnseignant();
        $idFiliere = $course->getIdFiliere();
        $niveau = $course->getNiveau();
        $idCours = $course->getId();
        
        $stmt->bind_param("ssissi", $nom, $code, $idEnseignant, $idFiliere, $niveau, $idCours);

        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }

    // Supprimer un cours
    public function deleteCourse($id_cours) {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("DELETE FROM cours WHERE id_cours = ?");
        $stmt->bind_param("i", $id_cours);

        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }
    
    // récupérer les cours d’un étudiant
    public function getCoursesByStudent($id_etudiant, $filters = []) {

        $page = isset($filters['page']) ? (int)$filters['page'] : 1;
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 6;
        $offset = ($page - 1) * $limit;

        $conn = $this->db->connect();

        $query = "
        SELECT 
            c.id_cours,
            c.nom_cours,
            c.code_cours,
            c.niveau,
            f.nom_complet AS nom_filiere,
            u.nom AS nom_enseignant,
            u.prenom AS prenom_enseignant,
            u.email AS email_enseignant
        FROM etudiant e
        JOIN cours c ON c.id_filiere = e.id_filiere AND c.niveau = e.niveau
        LEFT JOIN enseignant ens ON c.id_enseignant = ens.id_enseignant
        LEFT JOIN utilisateur u ON ens.id_enseignant = u.id_utilisateur
        LEFT JOIN filiere f ON c.id_filiere = f.id_filiere
        WHERE e.id_etudiant = ?
        ";

        $params = [$id_etudiant];
        $types = 'i';

        // Filtre recherche sur le nom du cours
        if (!empty($filters['search'])) {
            $query .= " AND c.nom_cours LIKE ?";
            $searchTerm = "%" . $filters['search'] . "%";
            $params[] = $searchTerm;
            $types .= 's';
        }


        // Pagination
        $query .= " LIMIT ?, ?";
        $params[] = $offset;
        $params[] = $limit;
        $types .= 'ii';

        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        $courses = [];

        while ($row = $result->fetch_assoc()) {
            $courses[] = [
                'id_cours' => $row['id_cours'],
                'nom_cours' => $row['nom_cours'],
                'code_cours' => $row['code_cours'],
                'niveau' => $row['niveau'],
                'enseignant' => $row['nom_enseignant'] ? $row['nom_enseignant'] . " " . $row['prenom_enseignant'] : 'Non assigné',
                'email_enseignant' => $row['email_enseignant'],
                'filiere' => $row['nom_filiere'] ?? 'N/A'
            ];
        }

        $stmt->close();

        // Total pour pagination (même filtres)
        $countQuery = "
            SELECT COUNT(*) AS total
            FROM etudiant e
            JOIN cours c ON c.id_filiere = e.id_filiere AND c.niveau = e.niveau
            WHERE e.id_etudiant = ?
        ";
        $countParams = [$id_etudiant];
        $countTypes = 'i';

        if (!empty($filters['search'])) {
            $countQuery .= " AND c.nom_cours LIKE ?";
            $countParams[] = $searchTerm;
            $countTypes .= 's';
        }

        $countStmt = $conn->prepare($countQuery);
        $countStmt->bind_param($countTypes, ...$countParams);
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $total = $countResult->fetch_assoc()['total'] ?? 0;
        $countStmt->close();

        

         return [
            'courses' => $courses,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'totalPages' => ceil($total / $limit)
            ]
        ];
    }

    // récupérer les cours d’un enseignant
    public function getCoursesByTeacher($id_enseignant, $filters) {
        $page = isset($filters['page']) ? (int)$filters['page'] : 1;
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 6; 
        $offset = ($page - 1) * $limit;

        $conn = $this->db->connect();

        $query = "
        SELECT 
            c.id_cours,
            c.nom_cours,
            c.code_cours,
            c.niveau,
            c.id_enseignant,
            c.id_filiere,
            f.nom_complet AS nom_filiere,

            u.nom AS nom_enseignant,
            u.prenom AS prenom_enseignant,
            u.email AS email_enseignant,

            -- Nombre d'étudiants dans la même filière que le cours
            (SELECT COUNT(*) 
             FROM etudiant e 
             WHERE e.id_filiere = c.id_filiere) AS nb_etudiants,

            -- Nombre de séances du cours
            (SELECT COUNT(*) 
             FROM seance s 
             WHERE s.id_cours = c.id_cours) AS nb_seances,

            -- Nombre total d'absences sur toutes les séances du cours
            (SELECT COUNT(*) 
             FROM presence p
             INNER JOIN seance s2 ON p.id_seance = s2.id_seance
             WHERE s2.id_cours = c.id_cours
             AND p.statut = 'absent') AS nb_absences

        FROM cours c
        LEFT JOIN enseignant en ON c.id_enseignant = en.id_enseignant
        LEFT JOIN utilisateur u ON en.id_enseignant = u.id_utilisateur
        LEFT JOIN filiere f ON c.id_filiere = f.id_filiere
        WHERE c.id_enseignant = ?
            ";

       $params = [$id_enseignant];
       $types = 'i';

       // Filtre par recherche sur le nom du cours
       if (!empty($filters['search'])) {
            $query .= " AND c.nom_cours LIKE ?";
            $searchTerm = "%" . $filters['search'] . "%";
            $params[] = $searchTerm;
            $types .= 's';
        }

        // Filtre par filière
        if (!empty($filters['filiere'])) {
            $query .= " AND c.id_filiere = ?";
            $params[] = $filters['filiere'];
            $types .= 'i';
        }

        $query .= " GROUP BY c.id_cours";
        // Pagination
        $query .= " LIMIT ?, ?";
        $params[] = $offset;
        $params[] = $limit;
        $types .= 'ii';

        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        $courses = [];
        while ($row = $result->fetch_assoc()) {
                $courses[] = [
                'id_cours' => $row['id_cours'],
                'nom_cours' => $row['nom_cours'],
                'code_cours' => $row['code_cours'],
                'id_enseignant' => $row['id_enseignant'],
                'email_enseignant' => $row['email_enseignant'],
                'id_filiere' => $row['id_filiere'],
                'niveau' => $row['niveau'],
                'enseignant' => $row['nom_enseignant'] ? $row['nom_enseignant'] . " " . $row['prenom_enseignant'] : 'Non assigné',
                'filiere' => $row['nom_filiere'] ?? 'N/A',
                'nb_etudiants'   => (int)$row['nb_etudiants'],
                'nb_seances'     => (int)$row['nb_seances'],
                'nb_absences'    => (int)$row['nb_absences'],
            ];
        }
        $stmt->close();

        // Total pour pagination (même filtres)
        $countQuery = "
            SELECT COUNT(*) AS total
            FROM cours c
            LEFT JOIN enseignant e ON c.id_enseignant = e.id_enseignant
            LEFT JOIN utilisateur u ON e.id_enseignant = u.id_utilisateur
            LEFT JOIN filiere f ON c.id_filiere = f.id_filiere
            WHERE c.id_enseignant = ?
        ";

        $countParams = [$id_enseignant];
        $countTypes = 'i';

        if (!empty($filters['search'])) {
            $countQuery .= " AND c.nom_cours LIKE ?";
            $countParams[] = $searchTerm;
            $countTypes .= 's';
        }

        if (!empty($filters['filiere'])) {
            $countQuery .= " AND c.id_filiere = ?";
            $countParams[] = $filters['filiere'];
            $countTypes .= 'i';
        }

        $countStmt = $conn->prepare($countQuery);
        $countStmt->bind_param($countTypes, ...$countParams);
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $total = $countResult->fetch_assoc()['total'] ?? 0;
        $countStmt->close();

        return [
            'courses' => $courses,
            'pagination' => [
                'total' => $total,
                'page' => $page,
               'limit' => $limit,
               'totalPages' => ceil($total / $limit)
            ]
        ];
      }
   }
?>
