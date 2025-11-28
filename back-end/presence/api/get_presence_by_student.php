<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/PresenceManager.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

try {
    // Vérifier session
    requireLogin();

    $db = new Database();
    $pm = new PresenceManager($db);

    // Récupérer l'ID étudiant depuis GET ou POST
    $input = json_decode(file_get_contents("php://input"), true) ?? [];
    $id_etudiant = $input['id_etudiant'] ?? $_GET['id_etudiant'] ?? null;

    if (!$id_etudiant) {
        echo json_encode(['success' => false, 'message' => 'ID étudiant manquant']);
        exit;
    }

    // Pagination optionnelle
    $page  = $input['page'] ?? $_GET['page'] ?? 1;
    $limit = $input['limit'] ?? $_GET['limit'] ?? 20;

    $presences = $pm->getPresenceByStudent($id_etudiant, $page, $limit);

     // Convertir en format JSON
    $data = array_map(function($p) {
        // Si c'est déjà un objet Presence
        if (is_object($p)) {
            return [
                'id_presence'   => $p->getId(),
                'id_etudiant'   => $p->getIdEtudiant(),
                'id_cours'      => $p->getIdCours(),
                'date_presence' => $p->getDatePresence(),
                'statut'        => $p->getStatut(),
                'heure_arrivee' => $p->getHeureArrivee(),
                'justification' => $p->getJustification()
            ];
        }
        // Sinon si c'est un tableau associatif
        return [
            'id_presence'   => $p['id_presence'] ?? null,
            'id_etudiant'   => $p['id_etudiant'] ?? null,
            'id_cours'      => $p['id_cours'] ?? null,
            'date_presence' => $p['date_presence'] ?? null,
            'statut'        => $p['statut'] ?? null,
            'heure_arrivee' => $p['heure_arrivee'] ?? null,
            'justification' => $p['justification'] ?? null
        ];
    }, $presences);

    echo json_encode([
        'success' => true,
        'presences' => $data,
        'total' => count($data)
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur serveur : ' . $e->getMessage()]);
}
?>
