<?php
require_once 'Session.php';
require_once __DIR__ . '/../../config/Database.php';

class SessionManager {

    private $db;

    public function __construct($database) {
        $this->db = $database;
    }


    // Obtenir toutes les séances
    public function getAllSeances($filters = []) {

        $this->updateSeancesStatusAndPresence();

        $conn = $this->db->connect();

        $page = isset($filters['page']) ? (int)$filters['page'] : 1;
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 6;
        $offset = ($page - 1) * $limit;

        $query = "
        SELECT 
            s.*,
            c.nom_cours,
            c.code_cours,
            c.id_enseignant,
            u.nom AS nom_enseignant, 
            u.prenom AS prenom_enseignant,
            (SELECT COUNT(*) 
             FROM etudiant et 
             WHERE et.id_filiere = c.id_filiere 
             AND et.niveau = c.niveau) AS nb_etudiants
        FROM seance s
        LEFT JOIN cours c ON s.id_cours = c.id_cours
        LEFT JOIN enseignant e ON c.id_enseignant = e.id_enseignant
        LEFT JOIN utilisateur u ON e.id_enseignant = u.id_utilisateur
        WHERE 1=1
         ";

        $params = [];
        $types = '';

        // Filtre par cours
        if (!empty($filters['cours'])) {
            $query .= " AND s.id_cours = ?";
            $params[] = $filters['cours'];
            $types .= 'i';
        }

        // Filtre par enseignant
        if (!empty($filters['enseignant'])) {
            $query .= " AND c.id_enseignant = ?";
            $params[] = $filters['enseignant'];
            $types .= 'i';
        } 

        // Filtre recherche texte (titre ou description)
        if (!empty($filters['search'])) {
            $query .= " AND (s.titre LIKE ? OR s.description LIKE ?)";
            $searchTerm = "%" . $filters['search'] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $types .= 'ss';
        }

        // Pagination
        $query .= " ORDER BY s.date_heure DESC LIMIT ?, ?";
        $params[] = $offset;
        $params[] = $limit;
        $types .= 'ii';

        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        $seances = [];
        while ($row = $result->fetch_assoc()) {
            $seances[] = (new Session($row))->toArray();
        }
        $stmt->close();

        // Total pour pagination
        $countQuery = "
            SELECT COUNT(*) AS total
            FROM seance s
            LEFT JOIN cours c ON s.id_cours = c.id_cours
            LEFT JOIN enseignant e ON c.id_enseignant = e.id_enseignant
            LEFT JOIN utilisateur u ON e.id_enseignant = u.id_utilisateur
            WHERE 1=1
        ";

        $countParams = [];
        $countTypes = '';

        if (!empty($filters['cours'])) {
            $countQuery .= " AND s.id_cours = ?";
            $countParams[] = $filters['cours'];
            $countTypes .= 'i';
        }

        if (!empty($filters['enseignant'])) {
            $countQuery .= " AND c.id_enseignant = ?";
            $countParams[] = $filters['enseignant'];
            $countTypes .= 'i';
        }

        if (!empty($filters['search'])) {
            $countQuery .= " AND (s.titre LIKE ? OR s.description LIKE ?)";
            $countParams[] = $searchTerm;
            $countParams[] = $searchTerm;
            $countTypes .= 'ss';
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
            "seances" => $seances,
            "pagination" => [
            "total" => $total,
            "page" => $page,
            "limit" => $limit,
            "totalPages" => ceil($total / $limit)
           ]
       ];
    }

    // Ajouter une séance

    public function addSeance($data) {
        $conn = $this->db->connect();

        // Récupérer les infos du cours : enseignant, filière et niveau
        $stmt = $conn->prepare("SELECT id_enseignant, id_filiere, niveau FROM cours WHERE id_cours = ?");
        $stmt->bind_param("i", $data['id_cours']);
        $stmt->execute();
        $course = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$course) {
            throw new Exception("Cours introuvable");
        }

        $id_enseignant = $course['id_enseignant'];
        $id_filiere = $course['id_filiere'];
        $niveau = $course['niveau'];

        // Vérifications
        if ($this->hasConflict($data['id_cours'], $data['date_heure'], $data['duree'])) {
            throw new Exception("Conflit : une séance du même cours existe déjà à cette heure.");
        }

        if ($this->teacherBusy($id_enseignant, $data['date_heure'], $data['duree'])) {
            throw new Exception("L'enseignant n’est pas disponible à cet horaire.");
        }

        if ($this->studentsBusy($data['id_cours'], $data['date_heure'], $data['duree'])) {
            throw new Exception("Les étudiants ont déjà une autre séance à cet horaire.");
        }

        // Insertion de la séance
        $stmt = $conn->prepare("
            INSERT INTO seance 
                (id_cours, titre, date_heure, duree, heure_fin, salle, description, statut)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
        $stmt->bind_param(
            "ississss",
            $data['id_cours'],
            $data['titre'],
            $data['date_heure'],
            $data['duree'],
            $data['heure_fin'],
            $data['salle'],
            $data['description'],
            $data['statut']
        );

        $stmt->execute();
        $id_seance = $stmt->insert_id; // Récupérer l'ID de la séance créée
        $stmt->close();

        // Remplir la table presence pour tous les étudiants de la filière/niveau
        $sql = "
            INSERT INTO presence (id_etudiant, id_seance, statut)
            SELECT id_etudiant, ?, 'absent'
            FROM etudiant
            WHERE id_filiere = ? AND niveau = ?
        ";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iis", $id_seance, $id_filiere, $niveau);
        $stmt->execute();
        $stmt->close();

         return true;
    }

    // Obtenir une séance par ID
    public function getSeanceById($id) {
        
        $conn = $this->db->connect();
        $sql = "SELECT 
                s.*,
                c.nom_cours,
                c.code_cours,
                e.id_etudiant,
                u.nom AS nom_etudiant,
                u.prenom AS prenom_etudiant,
                e.niveau,
                t.id_enseignant,
                tu.nom AS nom_enseignant,
                tu.prenom AS prenom_enseignant
            FROM seance s
            JOIN cours c ON s.id_cours = c.id_cours
            LEFT JOIN enseignant t ON c.id_enseignant = t.id_enseignant
            LEFT JOIN utilisateur tu ON t.id_enseignant = tu.id_utilisateur
            LEFT JOIN presence p ON p.id_seance = s.id_seance
            LEFT JOIN etudiant e ON p.id_etudiant = e.id_etudiant
            LEFT JOIN utilisateur u ON e.id_etudiant = u.id_utilisateur
            WHERE s.id_seance = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);

        $stmt->execute();
        $result = $stmt->get_result();
        $seance = $result->fetch_assoc();

        $stmt->close();
        return $seance ? new Session($seance) : null;
    }


    // Obtenir toutes les séances d’un enseignant 
    public function getSeancesByTeacher($id_enseignant, $filters = []) {
        $conn = $this->db->connect();

        $page = isset($filters['page']) ? (int)$filters['page'] : 1;
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 6;
        $offset = ($page - 1) * $limit;

        $query = "
            SELECT 
            s.*,
            c.nom_cours,
            c.code_cours,
            u.nom AS nom_enseignant,
            u.prenom AS prenom_enseignant,
            COUNT(p.id_etudiant) AS nb_etudiants
            FROM seance s
            JOIN cours c ON c.id_cours = s.id_cours
            LEFT JOIN enseignant en ON en.id_enseignant = c.id_enseignant
            LEFT JOIN utilisateur u ON u.id_utilisateur = en.id_enseignant
            LEFT JOIN presence p ON s.id_seance = p.id_seance
            WHERE c.id_enseignant = ?
            ";

        $params = [$id_enseignant];
        $types = "i";

         // Filtre par cours
        if (!empty($filters['cours'])) {
            $query .= " AND s.id_cours = ?";
            $params[] = $filters['cours'];
            $types .= "i";
        }

        // Filtre par statut
        if (!empty($filters['statut'])) {
            $query .= " AND s.statut = ?";
            $params[] = $filters['statut'];
            $types .= "s";
        }

        // Filtre par recherche texte
        if (!empty($filters['search']) && $filters['search'] != '') {
            $query .= " AND (s.titre LIKE ? OR s.description LIKE ?)";
            $search = "%" . $filters['search'] . "%";
            $params[] = $search;
            $params[] = $search;
            $types .= "ss";
        }

        // Pagination
        $query .= " ORDER BY s.date_heure DESC LIMIT ?, ?";
        $params[] = $offset;
        $params[] = $limit;
        $types .= "ii";

        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        $seances = [];
        while ($row = $result->fetch_assoc()) {
            $row['nb_etudiants'] = (int)$row['nb_etudiants']; 
            $seances[] = (new Session($row))->toArray();
        }
        $stmt->close();

         // Comptage total pour pagination
        $countQuery = "
            SELECT COUNT(*) AS total
            FROM seance s
            JOIN cours c ON c.id_cours = s.id_cours
            WHERE c.id_enseignant = ?
        ";
        $countParams = [$id_enseignant];
        $countTypes = "i";

        if (!empty($filters['cours'])) {
            $countQuery .= " AND s.id_cours = ?";
            $countParams[] = $filters['cours'];
            $countTypes .= "i";
        }
        if (!empty($filters['statut'])) {
            $countQuery .= " AND s.statut = ?";
            $countParams[] = $filters['statut'];
            $countTypes .= "s";
        }
        if (!empty($filters['search']) && $filters['search'] != '') {
            $countQuery .= " AND (s.titre LIKE ? OR s.description LIKE ?)";
            $countParams[] = $search;
            $countParams[] = $search;
            $countTypes .= "ss";
        }

        $countStmt = $conn->prepare($countQuery);
        $countStmt->bind_param($countTypes, ...$countParams);
        $countStmt->execute();
        $total = $countStmt->get_result()->fetch_assoc()['total'];
        $countStmt->close();

        return [
            "seances" => $seances,
            "pagination" => [
                "total" => $total,
                "page" => $page,
                "limit" => $limit,
                "totalPages" => ceil($total / $limit)
            ]
        ];   
    }

    // Obtenir toutes les séances d’un étudiant
    public function getSeancesByStudent($id_etudiant, $filters = []) {
        $conn = $this->db->connect();

        $this->updateSeancesStatusAndPresence();

        $page = isset($filters['page']) ? (int)$filters['page'] : 1;
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 6;
        $offset = ($page - 1) * $limit;

        $query= "
            SELECT 
            s.*,
            c.nom_cours,
            c.code_cours,
            u.nom AS nom_enseignant,
            u.prenom AS prenom_enseignant
            FROM seance s
            JOIN cours c 
            ON c.id_cours = s.id_cours
            JOIN etudiant e 
            ON e.id_filiere = c.id_filiere 
            AND e.niveau = c.niveau
            LEFT JOIN enseignant en 
            ON en.id_enseignant = c.id_enseignant
            LEFT JOIN utilisateur u 
            ON u.id_utilisateur = en.id_enseignant
            WHERE e.id_etudiant = ?
            ";

        $params = [$id_etudiant];
        $types   = "i";

        // FILTRE PAR COURS
        if (!empty($filters['cours'])) {
            $query .= " AND s.id_cours = ? ";
            $params[] = $filters['cours'];
            $types .= "i";
        }

        // Filtre par statut de séance (planifiée, terminée, annulée…)
        if (!empty($filters['statut'])) {
            $query .= " AND s.statut = ?";
            $params[] = $filters['statut'];
            $types .= "s";
        }

        // Recherche texte (titre ou description)
        if (!empty($filters['search']) && $filters['search']!= '' ) {
            $query .= " AND (s.titre LIKE ? OR s.description LIKE ?)";
            $search = "%" . $filters['search'] . "%";
            $params[] = $search;
            $params[] = $search;
            $types .= "ss";
        }

         // Pagination
        $query .= " ORDER BY s.date_heure DESC LIMIT ?, ?";
        $params[] = $offset;
        $params[] = $limit;
        $types .= "ii";

        // Exécution

        $stmt = $conn->prepare($query);

        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        $seances = [];
        while ($row = $result->fetch_assoc()) {
            $seances[] = (new Session($row))->toArray();
        }

        $stmt->close();
        
        // Comptage total pour pagination
        $countQuery = "
            SELECT COUNT(*) AS total
            FROM seance s
            JOIN cours c ON c.id_cours = s.id_cours
            JOIN etudiant e ON e.id_filiere = c.id_filiere AND e.niveau = c.niveau
            WHERE e.id_etudiant = ?
        ";

        $countParams = [$id_etudiant];
        $countTypes = "i";

        if (!empty($filters['cours'])) {
            $countQuery .= " AND s.id_cours = ?";
            $countParams[] = $filters['cours'];
            $countTypes .= "i";
        }

        if (!empty($filters['statut'])) {
            $countQuery .= " AND s.statut = ?";
            $countParams[] = $filters['statut'];
            $countTypes .= "s";
        }

        if (!empty($filters['search'])) {
            $countQuery .= " AND (s.titre LIKE ? OR s.description LIKE ?)";
            $countParams[] = $search;
            $countParams[] = $search;
            $countTypes .= "ss";
        }

        $countStmt = $conn->prepare($countQuery);
        $countStmt->bind_param($countTypes, ...$countParams);
        $countStmt->execute();
        $total = $countStmt->get_result()->fetch_assoc()['total'];
        $countStmt->close();

        return [
            "seances" => $seances,
            "pagination" => [
                "total" => $total,
                "page" => $page,
                "limit" => $limit,
                "totalPages" => ceil($total / $limit)
            ]
        ];
    }

    // Obtenir toutes les séances d’un cours
    public function getSessionsByCourse($id_cours, $filters = []) {
        $this->updateSeancesStatusAndPresence();
        $conn = $this->db->connect();

        $page = isset($filters['page']) ? (int)$filters['page'] : 1;
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 6;
        $offset = ($page - 1) * $limit;

        $query = "
            SELECT 
                s.*,
                c.nom_cours,
                c.code_cours,
                u.nom AS nom_enseignant,
                u.prenom AS prenom_enseignant,
                (SELECT COUNT(*) 
                    FROM etudiant et 
                    WHERE et.id_filiere = c.id_filiere 
                    AND et.niveau = c.niveau) AS nb_etudiants
            FROM seance s
            LEFT JOIN cours c ON s.id_cours = c.id_cours
            LEFT JOIN enseignant e ON c.id_enseignant = e.id_enseignant
            LEFT JOIN utilisateur u ON e.id_enseignant = u.id_utilisateur
            WHERE s.statut = 'terminée' 
            AND s.id_cours = ?
        ";

        $params = [$id_cours];
        $types = "i";

        // Filtre par statut
        if (!empty($filters['statut'])) {
            $query .= " AND s.statut = ?";
            $params[] = $filters['statut'];
            $types .= "s";
        }

        // Filtre par recherche texte
        if (!empty($filters['search'])) {
            $query .= " AND (s.titre LIKE ? OR s.description LIKE ?)";
            $search = "%" . $filters['search'] . "%";
            $params[] = $search;
            $params[] = $search;
            $types .= "ss";
        }

        // Pagination
        $query .= " ORDER BY s.date_heure DESC LIMIT ?, ?";
        $params[] = $offset;
        $params[] = $limit;
        $types .= "ii";

        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        $seances = [];
        while ($row = $result->fetch_assoc()) {
            $row['nb_etudiants'] = (int)$row['nb_etudiants'];
            $seances[] = (new Session($row))->toArray();
        }
        $stmt->close();

        // Total pour pagination
        $countQuery = "SELECT COUNT(*) AS total FROM seance WHERE id_cours = ?";
        $countParams = [$id_cours];
        $countTypes = "i";

        if (!empty($filters['statut'])) {
            $countQuery .= " AND statut = ?";
            $countParams[] = $filters['statut'];
            $countTypes .= "s";
        }
        if (!empty($filters['search'])) {
            $countQuery .= " AND (titre LIKE ? OR description LIKE ?)";
            $countParams[] = $search;
            $countParams[] = $search;
            $countTypes .= "ss";
        }

        $countStmt = $conn->prepare($countQuery);
        $countStmt->bind_param($countTypes, ...$countParams);
        $countStmt->execute();
        $total = $countStmt->get_result()->fetch_assoc()['total'];
        $countStmt->close();

        return [
            "seances" => $seances,
            "pagination" => [
                "total" => $total,
                "page" => $page,
                "limit" => $limit,
                "totalPages" => ceil($total / $limit)
            ]
        ];
    }

    // Modifier une séance
    public function updateSeance($id, $data) {
        $conn = $this->db->connect();

        // Récupérer l'enseignant du cours
        $stmt = $conn->prepare("SELECT id_enseignant FROM cours WHERE id_cours = ?");
        $stmt->bind_param("i", $data['id_cours']);
        $stmt->execute();
        $id_enseignant = $stmt->get_result()->fetch_assoc()['id_enseignant'];
        $stmt->close();

        // Vérifications
        if ($this->hasConflict($data['id_cours'], $data['date_heure'], $data['duree'])) {
            throw new Exception("Conflit : une séance du même cours existe déjà à cette heure.");
        }
 
        if ($this->teacherBusy($id_enseignant, $data['date_heure'], $data['duree'])) {
            throw new Exception("L'enseignant n’est pas disponible à cet horaire.");
        }

        if ($this->studentsBusy($data['id_cours'], $data['date_heure'], $data['duree'])) {
            throw new Exception("Les étudiants ont déjà une autre séance à cet horaire.");
        }

        // Mise à jour
        $stmt = $conn->prepare("
            UPDATE seance SET 
                id_cours    = ?, 
                titre       = ?, 
                date_heure  = ?, 
                duree       = ?, 
                heure_fin   = ?, 
                salle       = ?, 
                description = ?, 
                statut      = ?
            WHERE id_seance = ?
        ");

        $stmt->bind_param(
            "ississssi",
            $data['id_cours'],
            $data['titre'],
            $data['date_heure'],
            $data['duree'],
            $data['heure_fin'],
            $data['salle'],
            $data['description'],
            $data['statut'],
            $id
        );

        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }

    // Supprimer une séance
    public function deleteSeance($id) {
        $conn = $this->db->connect();
        $stmt = $conn->prepare("DELETE FROM seance WHERE id_seance = ?");
        $stmt->bind_param("i", $id);

        $success = $stmt->execute();
        $stmt->close();
        return $success;
    }


    // vérifier conflit d’horaire
    private function hasConflict($id_cours, $date_heure, $duree, $exclude_id = null) {
        $conn = $this->db->connect();

        $end_time = date('Y-m-d H:i:s', strtotime("$date_heure +$duree minutes"));

        $sql = "
            SELECT COUNT(*) AS total 
            FROM seance 
            WHERE id_cours = ?
            AND (
                (date_heure <= ? AND DATE_ADD(date_heure, INTERVAL duree MINUTE) > ?)
                OR
                (date_heure < ? AND DATE_ADD(date_heure, INTERVAL duree MINUTE) >= ?)
            )
        ";

        if ($exclude_id) {
            $sql .= " AND id_seance != ?";
        }

        $stmt = $conn->prepare($sql);

        if ($exclude_id) {
            $stmt->bind_param("issssi", $id_cours, $end_time, $date_heure, $date_heure, $end_time, $exclude_id);
        } else {
            $stmt->bind_param("issss", $id_cours, $end_time, $date_heure, $date_heure, $end_time);
        }

        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();

        return $result['total'] > 0;
    }

    // Vérifier disponibilité enseignant
    private function teacherBusy($id_enseignant, $date_heure, $duree, $exclude_id = null) {
        $conn = $this->db->connect();
        $end_time = date('Y-m-d H:i:s', strtotime("$date_heure +$duree minutes"));

        $sql = "
            SELECT COUNT(*) AS total
            FROM seance s
            JOIN cours c ON c.id_cours = s.id_cours
            WHERE c.id_enseignant = ?
            AND (
                (s.date_heure <= ? AND DATE_ADD(s.date_heure, INTERVAL s.duree MINUTE) > ?)
                OR
                (s.date_heure < ? AND DATE_ADD(s.date_heure, INTERVAL s.duree MINUTE) >= ?)
            )
        ";

        if ($exclude_id) {
            $sql .= " AND s.id_seance != ?";
        }

        $stmt = $conn->prepare($sql);

        if ($exclude_id) {
            $stmt->bind_param("issssi", $id_enseignant, $end_time, $date_heure, $date_heure, $end_time, $exclude_id);
        } else {
            $stmt->bind_param("issss", $id_enseignant, $end_time, $date_heure, $date_heure, $end_time);
        }

        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();

        return $result['total'] > 0;
    }
    
    // Vérifier disponibilité des étudiants
    private function studentsBusy($id_cours, $date_heure, $duree, $exclude_id = null) {
        $conn = $this->db->connect();
        $end_time = date('Y-m-d H:i:s', strtotime("$date_heure +$duree minutes"));

        $sql = "
            SELECT COUNT(*) AS total
            FROM seance s
            JOIN cours c ON c.id_cours = s.id_cours
            JOIN cours c2 ON c2.id_filiere = c.id_filiere AND c2.niveau = c.niveau
            WHERE c2.id_cours = ?
            AND (
                (s.date_heure <= ? AND DATE_ADD(s.date_heure, INTERVAL s.duree MINUTE) > ?)
                OR
                (s.date_heure < ? AND DATE_ADD(s.date_heure, INTERVAL s.duree MINUTE) >= ?)
            )
        ";

        if ($exclude_id) {
            $sql .= " AND s.id_seance != ?";
        }

        $stmt = $conn->prepare($sql);

        if ($exclude_id) {
            $stmt->bind_param("issssi", $id_cours, $end_time, $date_heure, $date_heure, $end_time, $exclude_id);
        } else {
            $stmt->bind_param("issss", $id_cours, $end_time, $date_heure, $date_heure, $end_time);
        }

        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();

        return $result['total'] > 0;
    }

    private function updateSeancesStatusAndPresence() {
        $conn = $this->db->connect();
        $now = date('Y-m-d H:i:s');
        // Récupérer toutes les séances qui ne sont pas terminées
        $result = $conn->query("SELECT * FROM seance WHERE statut != 'terminée'");
        while ($row = $result->fetch_assoc()) {
            $start = $row['date_heure'];
            $end = date('Y-m-d H:i:s', strtotime("{$row['date_heure']} +{$row['duree']} minutes"));

            if ($now >= $start && $now <= $end) {
                if ($row['statut'] != 'en_cours') {
                    $conn->query("UPDATE seance SET statut='en_cours' WHERE id_seance={$row['id_seance']}");
                }
            } elseif ($now > $end) {
                if ($row['statut'] != 'terminée') {
                    $conn->query("UPDATE seance SET statut='terminée' WHERE id_seance={$row['id_seance']}");

                     // Marquer absents automatiquement si pas présent
                    $conn->query("
                        UPDATE presence 
                        SET statut='absent'
                        WHERE id_seance={$row['id_seance']} AND statut='absent'
                    ");
                }
            } else {
                // si séance dans le futur, s'assurer qu'elle est planifiée
                if ($row['statut'] != 'planifiée') {
                    $conn->query("UPDATE seance SET statut='planifiée' WHERE id_seance={$row['id_seance']}");
                }
            }
        }
    }
}

?>
