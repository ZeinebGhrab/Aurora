<?php
require_once __DIR__ . '/../../config/Database.php';
require_once 'Presence.php';

class PresenceManager {

    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    // Ajouter une présence par l'étudiant

    public function addPresenceByStudent(Presence $presence) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("
            UPDATE presence
            SET statut = 'present', heure_arrivee = ?
            WHERE id_etudiant = ? AND id_seance = ?
           ");

        $idEtudiant    = $presence->getIdEtudiant();
        $idSeance      = $presence->getIdSeance();
        $heureArrivee  = $presence->getHeureArrivee() ? $presence->getHeureArrivee() : date("H:i:s");

        $stmt->bind_param(
            "sii",
            $heureArrivee,
            $idEtudiant,
            $idSeance
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

        // Filtrage par séance
        if (isset($filters['id_seance']) && $filters['id_seance'] !== '') {
            $query .= " AND p.id_seance = ?";
            $params[] = $filters['id_seance'];
            $types .= 'i';
        }

        // Filtrage par statut
        if (isset($filters['statut']) && $filters['statut'] !== '') {
            $query .= " AND p.statut = ?";
            $params[] = $filters['statut'];
            $types .= 's';
        }

        // Filtrer par étudiant
        if (isset($filters['id_etudiant']) && $filters['id_etudiant'] !== '') {
            $query .= " AND p.id_etudiant = ?";
            $params[] = $filters['id_etudiant'];
            $types .= 'i';
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

        if (isset($filters['id_seance']) && $filters['id_seance'] !== '') {
            $countQuery .= " AND p.id_seance = ?";
            $countParams[] = $filters['id_seance'];
            $countTypes .= 'i';
        }

        if (isset($filters['id_etudiant']) && $filters['id_etudiant'] !== '') {
           $countQuery .= " AND p.id_etudiant = ?";
           $countParams[] = $filters['id_etudiant'];
           $countTypes .= 'i';
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
    $conn = $this->db->connect();
    $offset = ($page - 1) * $limit;

    // Récupérer les présences détaillées (pagination)
    $sqlPresences = "
        SELECT 
            p.id_presence,
            p.id_seance,
            p.statut,
            p.heure_arrivee,
            p.justification,
            s.id_cours,
            s.titre AS titre_seance,
            s.date_heure,
            s.heure_fin,
            s.salle,
            c.nom_cours,
            c.code_cours
        FROM presence p
        INNER JOIN seance s ON p.id_seance = s.id_seance
        INNER JOIN cours c ON s.id_cours = c.id_cours
        WHERE p.id_etudiant = ? AND s.statut = 'terminée'
        ORDER BY s.date_heure DESC
        LIMIT ?, ?
    ";
    $stmt = $conn->prepare($sqlPresences);
    $stmt->bind_param("iii", $id_etudiant, $offset, $limit);
    $stmt->execute();
    $result = $stmt->get_result();

    $presences = [];
    while ($row = $result->fetch_assoc()) {
        $presences[] = [
            'id_presence'   => $row['id_presence'],
            'id_seance'     => $row['id_seance'],
            'statut'        => $row['statut'],
            'heure_arrivee' => $row['heure_arrivee'],
            'justification' => $row['justification'],
            'titre_seance'  => $row['titre_seance'],
            'date_heure'    => $row['date_heure'],
            'heure_fin'     => $row['heure_fin'],
            'salle'         => $row['salle'],
            'nom_cours'     => $row['nom_cours'],
            'code_cours'    => $row['code_cours']
        ];
    }
    $stmt->close();

    // Stats par séance pour cet étudiant
    $sqlStats = "
        SELECT 
            s.id_seance,
            s.titre,
            s.date_heure,
            s.heure_fin,
            s.salle,
            COUNT(CASE WHEN p.statut = 'présent' THEN 1 END) AS nb_presences,
            COUNT(CASE WHEN p.statut = 'absent' THEN 1 END) AS nb_absences
        FROM seance s
        LEFT JOIN presence p 
            ON s.id_seance = p.id_seance AND p.id_etudiant = ?
        WHERE s.statut = 'terminée'
        GROUP BY s.id_seance, s.titre, s.date_heure, s.heure_fin, s.salle
        ORDER BY s.date_heure DESC
    ";
    $stmt = $conn->prepare($sqlStats);
    $stmt->bind_param("i", $id_etudiant);
    $stmt->execute();
    $result = $stmt->get_result();

    $stats = [];
    while ($row = $result->fetch_assoc()) {
        $stats[] = [
            'id_seance'    => $row['id_seance'],
            'titre'        => $row['titre'],
            'date_heure'   => $row['date_heure'],
            'heure_fin'    => $row['heure_fin'],
            'salle'        => $row['salle'],
            'nb_presences' => (int)$row['nb_presences'],
            'nb_absences'  => (int)$row['nb_absences']
        ];
    }
    $stmt->close();

    // Total pour pagination
    $countQuery = "
        SELECT COUNT(*) AS total
        FROM presence p
        INNER JOIN seance s ON p.id_seance = s.id_seance
        WHERE p.id_etudiant = ? AND s.statut = 'terminée'
    ";
    $stmt = $conn->prepare($countQuery);
    $stmt->bind_param("i", $id_etudiant);
    $stmt->execute();
    $total = $stmt->get_result()->fetch_assoc()['total'] ?? 0;
    $stmt->close();

    return [
        'presences' => $presences,
        'stats' => $stats,
        'pagination' => [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil($total / $limit)
        ]
    ];
}



    // Présences par séance

    public function getPresenceBySession($id_seance, $page = 1, $limit = 10) {
        return $this->getAllPresences(['id_seance' => $id_seance], $page, $limit);
    }


 
    // Présences par cours (toutes ses séances)
 
    public function getPresenceByCourse($id_cours, $page = 1, $limit = 10) {
        return $this->getAllPresences(['id_cours' => $id_cours], $page, $limit);
    }



    // Update presence Admin

    public function updatePresence(Presence $presence) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("
            UPDATE presence
            SET id_etudiant = ?, id_seance = ?, statut = ?, heure_arrivee = ?
            WHERE id_presence = ?
        ");

        $idEtudiant    = $presence->getIdEtudiant();
        $idSeance      = $presence->getIdSeance();
        $statut        = $presence->getStatut();
        $heureArrivee  = $presence->getHeureArrivee() ? $presence->getHeureArrivee() : date("H:i:s");
        $idPresence    = $presence->getId();

        $stmt->bind_param(
            "iissi",
            $idEtudiant,
            $idSeance,
            $statut,
            $heureArrivee,
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

    // Nombre de présences et d'absences pour un étudiant donné (séances terminées)
    public function getAttendanceStatsByStudent($id_etudiant, $page = 1, $limit = 3) {
        $conn = $this->db->connect();
        $offset = ($page - 1) * $limit;

        // Récupérer les stats paginées
        $sql = "
            SELECT 
                c.id_cours,
                c.nom_cours,
                c.code_cours,
                SUM(p.statut = 'présent') AS nb_presences,
                SUM(p.statut = 'absent') AS nb_absences
                FROM cours c
                INNER JOIN seance s ON c.id_cours = s.id_cours AND s.statut = 'terminée'
                LEFT JOIN presence p ON s.id_seance = p.id_seance AND p.id_etudiant = ?
                GROUP BY c.id_cours, c.nom_cours, c.code_cours
                ORDER BY c.nom_cours
                LIMIT ? OFFSET ?
            ";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iii", $id_etudiant, $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();

        $stats = [];
        while ($row = $result->fetch_assoc()) {
            $stats[] = [
                'id_cours'     => $row['id_cours'],
                'nom_cours'    => $row['nom_cours'],
                'code_cours'   => $row['code_cours'],
                'nb_presences' => (int)$row['nb_presences'],
                'nb_absences'  => (int)$row['nb_absences']
            ];
        }
        $stmt->close();

        // Nombre total pour pagination
        $sqlCount = "
            SELECT COUNT(DISTINCT c.id_cours) AS total
            FROM cours c
            INNER JOIN seance s ON c.id_cours = s.id_cours AND s.statut = 'terminée'
            LEFT JOIN presence p ON s.id_seance = p.id_seance AND p.id_etudiant = ?
        ";

        $stmt = $conn->prepare($sqlCount);
        $stmt->bind_param("i", $id_etudiant);
        $stmt->execute();
        $total = $stmt->get_result()->fetch_assoc()['total'] ?? 0;
        $stmt->close();

        return [
            "presences" => $stats,
            'pagination' => [
                'total' => (int)$total,
                'page' => $page,
                'limit' => $limit,
                'totalPages' => ceil($total / $limit)
            ]
        ];
    }
}
?>
