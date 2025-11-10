<?php
require_once 'Sector.php';

class SectorManager {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    // Add a program
    public function addProgram($code, $name) {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("INSERT INTO filiere (code_filiere, nom_complet) VALUES (?, ?)");
        $stmt->bind_param("ss", $code, $name);
        $success = $stmt->execute();
        $stmt->close();
        return $success;
    }

    // Get all programs
    public function getAllPrograms() {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("SELECT * FROM filiere ORDER BY nom_complet ASC");
        $stmt->execute();
        $result = $stmt->get_result();
        $programs = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $programs;
    }

    // Get program by ID
    public function getProgramById($id) {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("SELECT * FROM filiere WHERE id_filiere = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $program = $result->fetch_assoc();
        $stmt->close();
        return $program;
    }

    // Update a program
    public function updateProgram($id, $code, $name) {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("UPDATE filiere SET code_filiere = ?, nom_complet = ? WHERE id_filiere = ?");
        $stmt->bind_param("ssi", $code, $name, $id);
        $success = $stmt->execute();
        $stmt->close();
        return $success;
    }

    // Delete a program
    public function deleteProgram($id) {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("DELETE FROM filiere WHERE id_filiere = ?");
        $stmt->bind_param("i", $id);
        $success = $stmt->execute();
        $stmt->close();
        return $success;
    }
}
?>
