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
                'id_presence'   => $presence['id_presence'],
                'id_etudiant'   => $presence['id_etudiant'],
                'full_name'     => $presence['prenom'] . ' ' . $presence['nom'],
                'niveau'        => $presence['niveau'],
                'id_seance'     => $presence['id_seance'],
                'course'        => $presence['nom_cours'],
                'statut'        => $presence['statut'],
                'heure_arrivee' => $presence['heure_arrivee'],
                'justification' => $presence['justification'],
                'titre'         => $presence['titre'],
                'date_heure'    => $presence['date_heure'],
                'heure_fin'   => $presence['heure_fin']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Présence introuvable']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID de la présence manquant']);
}
?>
