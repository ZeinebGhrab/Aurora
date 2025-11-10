<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once 'Student.php';
require_once __DIR__ . '/../User.php';

class StudentManager {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    // Récupérer tous les étudiants avec filière et niveau
    public function getAllStudents() {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("
            SELECT u.id_utilisateur, u.nom, u.prenom, u.email, u.type_compte, e.niveau, f.nom_complet AS filiere
            FROM etudiant e
            JOIN utilisateur u ON e.id_etudiant = u.id_utilisateur
            LEFT JOIN filiere f ON e.id_filiere = f.id_filiere
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $students = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $students;
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

    // Récupérer un étudiant par son ID
    public function getStudentById($id_etudiant) {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("
            SELECT u.id_utilisateur,u.mot_de_passe ,u.nom, u.prenom, u.email, u.type_compte, e.niveau, e.id_filiere, f.nom_complet AS filiere
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
    public function addStudent($nom, $prenom, $email, $mot_de_passe, $id_filiere, $niveau) {
        $conn = $this->db->connect();

        // Créer l'utilisateur
        $stmt = $conn->prepare("
            INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, type_compte)
            VALUES (?, ?, ?, ?, 'etudiant')
        ");
        $hashedPassword = password_hash($mot_de_passe, PASSWORD_DEFAULT);
        $stmt->bind_param("ssss", $nom, $prenom, $email, $hashedPassword);
        $success = $stmt->execute();

        if ($success) {
            $id_utilisateur = $conn->insert_id;
            $stmt->close();

            // Créer l'entrée dans etudiant
            $stmt2 = $conn->prepare("INSERT INTO etudiant (id_etudiant, id_filiere, niveau) VALUES (?, ?, ?)");
            $stmt2->bind_param("iis", $id_utilisateur, $id_filiere, $niveau);
            $success = $stmt2->execute();
            $stmt2->close();
        }

        return $success;
    }

    // Mettre à jour un étudiant
    public function updateStudent($id_etudiant, $nom, $prenom, $email, $id_filiere, $niveau) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("
            UPDATE utilisateur SET nom = ?, prenom = ?, email = ? WHERE id_utilisateur = ?
        ");
        $stmt->bind_param("sssi", $nom, $prenom, $email, $id_etudiant);
        $success = $stmt->execute();
        $stmt->close();

        if ($success) {
            $stmt2 = $conn->prepare("UPDATE etudiant SET id_filiere = ?, niveau = ? WHERE id_etudiant = ?");
            $stmt2->bind_param("isi", $id_filiere, $niveau, $id_etudiant);
            $success = $stmt2->execute();
            $stmt2->close();
        }

        return $success;
    }

    // Supprimer un étudiant
    public function deleteStudent($id_etudiant) {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("DELETE FROM utilisateur WHERE id_utilisateur = ?");
        $stmt->bind_param("i", $id_etudiant);
        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }
}
?>
