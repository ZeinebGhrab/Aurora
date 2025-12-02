<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/PresenceManager.php';
require_once '../models/Presence.php';
require_once '../../user/api/auth/check_session_logic.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

try {

    requireLogin();
    requireAdmin();

    $db = new Database();
    $pm = new PresenceManager($db);

    // Récupérer les données depuis POST/JSON
    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    $id_presence   = $input['id_presence'] ?? null;
    $id_etudiant   = $input['id_etudiant'] ?? null;
    $id_seance     = $input['id_seance'] ?? null;
    $statut        = $input['statut'] ?? null;
    $heure_arrivee = $input['heure_arrivee'] ?? null;

    // Validation des champs requis
    if (!$id_presence || !$id_etudiant || !$id_seance || !$statut) {
        echo json_encode([
            'success' => false,
            'message' => 'Paramètres requis manquants (id_presence, id_etudiant, id_seance, statut)'
        ]);
        exit;
    }

    $presence = new Presence([
        'id_presence'   => $id_presence,
        'id_etudiant'   => $id_etudiant,
        'id_seance'     => $id_seance,
        'statut'        => $statut,
        'heure_arrivee' => $heure_arrivee,
    ]);

    if ($pm->updatePresence($presence)) {
        echo json_encode(['success' => true, 'message' => 'Présence mise à jour avec succès']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur serveur : ' . $e->getMessage()]);
}
?>
