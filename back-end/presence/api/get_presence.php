<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/PresenceManager.php';
require_once '../models/Presence.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$id_presence = $data['id_presence'] ?? null;

$db = new Database();
$pm = new PresenceManager($db);

if ($id_presence) {
    $presence = $pm->getPresenceById($id_presence);
    if ($presence) {
        echo json_encode([
            'success' => true,
            'presence' => [
                'id_presence' => $presence->getId(),
                'id_etudiant' => $presence->getIdEtudiant(),
                'id_cours' => $presence->getIdCours(),
                'date_presence' => $presence->getDatePresence(),
                'statut' => $presence->getStatut(),
                'heure_arrivee' => $presence->getHeureArrivee(),
                'justification' => $presence->getJustification()
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Présence introuvable']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID de la présence manquant']);
}
?>
