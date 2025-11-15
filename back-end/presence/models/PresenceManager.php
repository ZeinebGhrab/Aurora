<?php
require_once __DIR__ . '/../../config/Database.php';
require_once 'Presence.php';

class PresenceManager {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    // Ajouter une présence
    public function addPresence(Presence $presence) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("
            INSERT INTO presence (id_etudiant, id_cours, date_presence, statut, heure_arrivee, justification)
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        $id_etudiant = $presence->getIdEtudiant();
        $id_cours = $presence->getIdCours();
        $date_presence = $presence->getDatePresence();
        $statut = $presence->getStatut();
        $heure_arrivee = $presence->getHeureArrivee();
        $justification = $presence->getJustification();

        $stmt->bind_param("iissss", $id_etudiant, $id_cours, $date_presence, $statut, $heure_arrivee, $justification);
        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }

    // Récupérer une présence par ID
    public function getPresenceById($id_presence) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("SELECT * FROM presence WHERE id_presence = ?");
        $stmt->bind_param("i", $id_presence);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();

        if ($row) {
            return new Presence(
                $row['id_etudiant'],
                $row['id_cours'],
                $row['date_presence'],
                $row['statut'],
                $row['heure_arrivee'],
                $row['justification'],
                $row['id_presence']
            );
        }

        return null;
    }

    // Récupérer toutes les présences d'un cours ou d'un étudiant
    public function getAllPresences($filters = []) {
        $conn = $this->db->connect();
        $query = "SELECT * FROM presence WHERE 1=1";
        $params = [];
        $types = '';

        if (!empty($filters['id_etudiant'])) {
            $query .= " AND id_etudiant = ?";
            $params[] = $filters['id_etudiant'];
            $types .= 'i';
        }

        if (!empty($filters['id_cours'])) {
            $query .= " AND id_cours = ?";
            $params[] = $filters['id_cours'];
            $types .= 'i';
        }

        if (!empty($filters['date'])) {
            $query .= " AND date_presence = ?";
            $params[] = $filters['date'];
            $types .= 's';
        }

        $stmt = $conn->prepare($query);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $presences = [];
        while ($row = $result->fetch_assoc()) {
            $presences[] = new Presence(
                $row['id_etudiant'],
                $row['id_cours'],
                $row['date_presence'],
                $row['statut'],
                $row['heure_arrivee'],
                $row['justification'],
                $row['id_presence']
            );
        }

        $stmt->close();
        return $presences;
    }

    // Mettre à jour une présence
    public function updatePresence(Presence $presence) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("
            UPDATE presence
            SET id_etudiant = ?, id_cours = ?, date_presence = ?, statut = ?, heure_arrivee = ?, justification = ?
            WHERE id_presence = ?
        ");

        $stmt->bind_param(
            "isssssi",
            $presence->getIdEtudiant(),
            $presence->getIdCours(),
            $presence->getDatePresence(),
            $presence->getStatut(),
            $presence->getHeureArrivee(),
            $presence->getJustification(),
            $presence->getId()
        );

        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }

    // Supprimer une présence
    public function deletePresence($id_presence) {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("DELETE FROM presence WHERE id_presence = ?");
        $stmt->bind_param("i", $id_presence);

        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }
}
?>
