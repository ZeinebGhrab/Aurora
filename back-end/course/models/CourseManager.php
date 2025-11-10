<?php
require_once __DIR__ . '/../../config/Database.php';
require_once 'Course.php';

class CourseManager {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    // Ajouter un nouveau cours
    public function addCourse($nom_cours, $code_cours, $id_enseignant, $id_filiere, $niveau) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("
        INSERT INTO cours (nom_cours, code_cours, id_enseignant, id_filiere, niveau)
        VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->bind_param("ssiss", $nom_cours, $code_cours, $id_enseignant, $id_filiere, $niveau);

        $success = $stmt->execute();
        $stmt->close();

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

    // Récupérer tous les cours
    public function getAllCourses() {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("
            SELECT 
                c.id_cours, c.nom_cours, c.code_cours, c.id_enseignant, c.id_filiere, c.niveau,
                CONCAT(COALESCE(u.nom,''), ' ', COALESCE(u.prenom,'')) AS nom_enseignant,
                f.nom_complet AS nom_filiere
            FROM cours c
            LEFT JOIN enseignant e ON c.id_enseignant = e.id_enseignant
            LEFT JOIN utilisateur u ON e.id_enseignant = u.id_utilisateur
            LEFT JOIN filiere f ON c.id_filiere = f.id_filiere
        ");
        $stmt->execute();

        $result = $stmt->get_result();
        $courses = [];

        while ($row = $result->fetch_assoc()) {
            $course = new Course(
                $row['nom_cours'],
                $row['code_cours'],
                $row['id_enseignant'] ?? null,
                $row['id_filiere'] ?? null,
                $row['niveau'] ?? '',
                $row['id_cours'] ?? null
            );


            $courses[] = [
                'course' => [
                    'id_cours' => $course->getId(),
                    'nom_cours' => $course->getNom(),
                    'code_cours' => $course->getCode(),
                    'id_enseignant' => $course->getIdEnseignant(),
                    'id_filiere' => $course->getIdFiliere(),
                    'niveau' => $course->getNiveau()
                ],
                'enseignant' => !empty(trim($row['nom_enseignant'])) ? $row['nom_enseignant'] : 'Non assigné',
                'filiere' => !empty($row['nom_filiere']) ? $row['nom_filiere'] : 'N/A'
            ];
        }

        $stmt->close();
        return $courses;
    }

    // Récupérer un cours par ID
    public function getCourseById($id_cours) {
        $conn = $this->db->connect();

        $sql = "SELECT 
                c.*, 
                u.email AS mail_enseignant, 
                u.nom AS nom_enseignant, 
                u.prenom AS prenom_enseignant
            FROM cours c
            LEFT JOIN enseignant e ON c.id_enseignant = e.id_enseignant
            LEFT JOIN utilisateur u ON e.id_enseignant = u.id_utilisateur
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
}
?>
