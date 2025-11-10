<?php
require_once __DIR__ . '/../User.php';

class Student {
    private $db;
    private $id;
    private $filiere;
    private $niveau;

    public function __construct($database) {
        $this->db = $database;
    }

    public function loadStudentDataByEmail($email) {
        $conn = $this->db->connect(); 

        $stmt = $conn->prepare("SELECT e.niveau, f.nom_complet FROM etudiant e
                                JOIN filiere f ON e.id_filiere = f.id_filiere
                                JOIN utilisateur u ON e.id_etudiant = u.id_utilisateur
                                WHERE u.email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_assoc();
        $stmt->close();

        if ($data) {
            $this->filiere = $data['nom_filiere'];
            $this->niveau = $data['niveau'];
        }
    }

    public function getFiliere() {
        return $this->filiere;
    }

    public function getNiveau() {
        return $this->niveau;
    }
}


?>
