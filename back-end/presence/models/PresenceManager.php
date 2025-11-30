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
            INSERT INTO presence (id_etudiant, id_seance, statut, heure_arrivee, justification)
            VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->bind_param(
            "iisss",
            $presence->getIdEtudiant(),
            $presence->getIdSeance(),
            $presence->getStatut(),
            $presence->getHeureArrivee(),
            $presence->getJustification()
        );

        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }



    // Récupérer une présence

    public function getPresenceById($id_presence) {
        $conn = $this->db->connect();

        $sql = "
        SELECT 
            p.*, 
            s.titre,
            s.date_heure,
            s.heure_fin,
            e.niveau, 
            u.nom, u.prenom, 
            c.nom_cours
        FROM presence p
        JOIN etudiant e ON p.id_etudiant = e.id_etudiant
        JOIN utilisateur u ON e.id_etudiant = u.id_utilisateur
        JOIN seance s ON p.id_seance = s.id_seance
        JOIN cours c ON s.id_cours = c.id_cours
        WHERE p.id_presence = ?
        ";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id_presence);
        $stmt->execute();
        $result = $stmt->get_result();

        $row = $result->fetch_assoc();
        $stmt->close();

        return $row;
    }


    // Récupérer toutes les présences (filters + pagination)
   
    public function getAllPresences($filters = []) {
        $conn = $this->db->connect();

        $page = isset($filters['page']) ? (int)$filters['page'] : 1;
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 10;
        $offset = ($page - 1) * $limit;

        $query = "
        SELECT 
            p.id_presence,
            p.id_etudiant,
            p.id_seance,
            p.statut,
            p.heure_arrivee,
            p.justification,
            s.id_cours,
            s.salle,
            s.date_heure,
            s.heure_fin,
            c.nom_cours,
            c.code_cours,
            c.id_filiere,
            c.niveau,
            u.nom AS nom_etudiant,
            u.prenom AS prenom_etudiant,
            ue.nom AS nom_enseignant,
            ue.prenom AS prenom_enseignant
        FROM presence p
        INNER JOIN seance s ON p.id_seance = s.id_seance
        INNER JOIN cours c ON s.id_cours = c.id_cours
        LEFT JOIN etudiant e ON p.id_etudiant = e.id_etudiant
        LEFT JOIN utilisateur u ON e.id_etudiant = u.id_utilisateur
        LEFT JOIN enseignant ens ON c.id_enseignant = ens.id_enseignant
        LEFT JOIN utilisateur ue ON ens.id_enseignant = ue.id_utilisateur
        WHERE 1=1
        ";

        $query .= " AND s.statut = 'terminée'";

        $params = [];
        $types = '';

        // Filtrage par filière
        if (isset($filters['filiere']) && $filters['filiere'] !== '') {
            $query .= " AND c.id_filiere = ?";
            $params[] = $filters['filiere'];
            $types .= 'i';
        }

        // Filtrage par niveau
        if (isset($filters['niveau']) && $filters['niveau'] !== '') {
            $query .= " AND c.niveau = ?";
            $params[] = $filters['niveau'];
            $types .= 's';
        }

        // Filtrage par cours
        if (isset($filters['id_cours']) && $filters['id_cours'] !== '') {
            $query .= " AND s.id_cours = ?";
            $params[] = $filters['id_cours'];
            $types .= 'i';
        }

        // Filtrage par statut
        if (isset($filters['statut']) && $filters['statut'] !== '') {
            $query .= " AND p.statut = ?";
            $params[] = $filters['statut'];
            $types .= 's';
        }

        // Pagination
        $query .= " ORDER BY p.id_presence DESC LIMIT ?, ?";
        $params[] = $offset;
        $params[] = $limit;
        $types .= 'ii';

        $stmt = $conn->prepare($query);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $presences = [];
        while ($row = $result->fetch_assoc()) {
            $full_name = trim($row['prenom_etudiant'] . ' ' . $row['nom_etudiant']);
            $teacher_name = trim($row['prenom_enseignant'] . ' ' . $row['nom_enseignant']);

            $presence_data = [
                'id_presence'   => $row['id_presence'],
                'id_etudiant'   => $row['id_etudiant'],
                'id_seance'     => $row['id_seance'],
                'statut'        => $row['statut'],
                'heure_arrivee' => $row['heure_arrivee'],
                'justification' => $row['justification'],
            ];

            $presences[] = (new Presence($presence_data))->toArray() + [
                'full_name'    => $full_name,
                'course'       => $row['nom_cours'],
                'course_code'  => $row['code_cours'],
                'teacher_name' => $teacher_name,
                'date_heure'   => $row['date_heure'],
                'heure_fin'    => $row['heure_fin'],
                'salle'        => $row['salle'],
                'niveau'       => $row['niveau']
            ];
        }
        $stmt->close();

        // Requête COUNT pour la pagination
        $countQuery = "
            SELECT COUNT(*) AS total
            FROM presence p
            INNER JOIN seance s ON p.id_seance = s.id_seance
            INNER JOIN cours c ON s.id_cours = c.id_cours
            LEFT JOIN etudiant e ON p.id_etudiant = e.id_etudiant
            LEFT JOIN utilisateur u ON e.id_etudiant = u.id_utilisateur
            LEFT JOIN enseignant ens ON c.id_enseignant = ens.id_enseignant
            LEFT JOIN utilisateur ue ON ens.id_enseignant = ue.id_utilisateur
            WHERE 1=1
        ";

        $countQuery .= " AND s.statut = 'terminée'";

        $countParams = [];
        $countTypes = '';

        if (isset($filters['filiere']) && $filters['filiere'] !== '') {
            $countQuery .= " AND c.id_filiere = ?";
            $countParams[] = $filters['filiere'];
            $countTypes .= 'i';
        }

        if (isset($filters['niveau']) && $filters['niveau'] !== '') {
            $countQuery .= " AND c.niveau = ?";
            $countParams[] = $filters['niveau'];
            $countTypes .= 's';
        }

        if (isset($filters['id_cours']) && $filters['id_cours'] !== '') {
            $countQuery .= " AND s.id_cours = ?";
            $countParams[] = $filters['id_cours'];
            $countTypes .= 'i';
        }

        if (isset($filters['statut']) && $filters['statut'] !== '') {
            $countQuery .= " AND p.statut = ?";
            $countParams[] = $filters['statut'];
            $countTypes .= 's';
        }

        $countStmt = $conn->prepare($countQuery);
        if (!empty($countParams)) {
            $countStmt->bind_param($countTypes, ...$countParams);
        }
        $countStmt->execute();
        $total = $countStmt->get_result()->fetch_assoc()['total'] ?? 0;
        $countStmt->close();


        $totalPresencesQuery = "
            SELECT COUNT(*) AS total_presences
            FROM presence p
            INNER JOIN seance s ON p.id_seance = s.id_seance
            WHERE p.statut = 'Présent'
            AND s.statut = 'terminée'
        ";

        $resultPres = $conn->query($totalPresencesQuery);
        $total_presences = $resultPres->fetch_assoc()['total_presences'] ?? 0;

        // Total des séances (uniquement 'terminée')
        $totalSeancesQuery = "
            SELECT COUNT(*) AS total_seances
            FROM seance
            WHERE statut = 'terminée'
        ";

        $resultSeances = $conn->query($totalSeancesQuery);
        $total_seances = $resultSeances->fetch_assoc()['total_seances'] ?? 0;


        return [
            'presences' => $presences,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'totalPages' => ceil($total / $limit)
            ],
            'stats' => [
                'total_presences' => $total_presences,
                'total_seances' => $total_seances
            ]
        ];
    }

    // Présences par étudiant

    public function getPresenceByStudent($id_etudiant, $page = 1, $limit = 10) {
        return $this->getAllPresences(['id_etudiant' => $id_etudiant], $page, $limit);
    }


    // Présences par enseignant (tous ses cours → toutes ses séances)
  
    public function getPresenceByTeacher($id_enseignant, $page = 1, $limit = 10) {
        return $this->getAllPresences(['id_enseignant' => $id_enseignant], $page, $limit);
    }



    // Présences par séance

    public function getPresenceBySession($id_seance, $page = 1, $limit = 10) {
        return $this->getAllPresences(['id_seance' => $id_seance], $page, $limit);
    }


 
    // Présences par cours (toutes ses séances)
 
    public function getPresenceByCourse($id_cours, $page = 1, $limit = 10) {
        return $this->getAllPresences(['id_cours' => $id_cours], $page, $limit);
    }



    // Update

    public function updatePresence(Presence $presence) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("
            UPDATE presence
            SET id_etudiant = ?, id_seance = ?, statut = ?, heure_arrivee = ?, justification = ?
            WHERE id_presence = ?
        ");

        $idEtudiant    = $presence->getIdEtudiant();
        $idSeance      = $presence->getIdSeance();
        $statut        = $presence->getStatut();
        $heureArrivee  = $presence->getHeureArrivee();
        $justification = $presence->getJustification();
        $idPresence    = $presence->getId();

        if ($heureArrivee === null || $heureArrivee === "") {
            $heureArrivee = NULL;
        }

        $stmt->bind_param(
            "iisssi",
            $idEtudiant,
            $idSeance,
            $statut,
            $heureArrivee,
            $justification,
            $idPresence
        );

        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }

    // Delete
 
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
