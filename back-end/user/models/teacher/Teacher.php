<?php 
require_once __DIR__ . '/../User.php';


class Teacher extends User {
    private $grade;
    private $specialite;

    public function __construct($database) {
        parent::__construct($database);
    }

    // Charger les infos spécifiques à l'enseignant
    public function loadTeacherData() {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("SELECT grade, specialite FROM enseignant WHERE id_enseignant = ?");
        $stmt->bind_param("i", $this->getId());
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            $this->grade = $row['grade'];
            $this->specialite = $row['specialite'];
        }
        $stmt->close();
    }

    // Getters spécifiques
    public function getGrade() {
        return $this->grade;
    }

    public function getSpecialite() {
        return $this->specialite;
    }
}
?>