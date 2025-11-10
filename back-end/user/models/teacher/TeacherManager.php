<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once 'Teacher.php';
require_once __DIR__ . '/../User.php';

class TeacherManager {
    private $db;

    public function __construct($database) {
        $this->db = $database;
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

    // Récupérer tous les enseignants
    public function getAllTeachers() {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("
            SELECT u.id_utilisateur, u.nom, u.prenom, u.email, u.type_compte, e.grade, e.specialite
            FROM enseignant e
            JOIN utilisateur u ON e.id_enseignant = u.id_utilisateur
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $teachers = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $teachers;
    }

    // Récupérer un enseignant par ID
    public function getTeacherById($id_enseignant) {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("
            SELECT u.id_utilisateur, u.nom, u.prenom, u.email, u.type_compte, e.grade, e.specialite
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
        $success = $stmt->execute();

        if ($success) {
            $id_utilisateur = $conn->insert_id;
            $stmt->close();

            // Créer l'entrée dans enseignant
            $stmt2 = $conn->prepare("
                INSERT INTO enseignant (id_enseignant, grade, specialite)
                VALUES (?, ?, ?)
            ");
            $stmt2->bind_param("iss", $id_utilisateur, $grade, $specialite);
            $success = $stmt2->execute();
            $stmt2->close();
        }

        return $success;
    }

    // Mettre à jour un enseignant
    public function updateTeacher($id_enseignant, $nom, $prenom, $email, $grade = null, $specialite = null) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("
            UPDATE utilisateur SET nom = ?, prenom = ?, email = ? WHERE id_utilisateur = ?
        ");
        $stmt->bind_param("sssi", $nom, $prenom, $email, $id_enseignant);
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

        return $success;
    }

    // Supprimer un enseignant
    public function deleteTeacher($id_enseignant) {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("DELETE FROM utilisateur WHERE id_utilisateur = ?");
        $stmt->bind_param("i", $id_enseignant);
        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }
}
?>
