<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/PresenceManager.php';
require_once '../models/Presence.php';

header('Content-Type: application/json');

try {
    $db = new Database();
    $pm = new PresenceManager($db);

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $id_presence = $data['id_presence'] ?? null;
    $id_etudiant = $data['id_etudiant'] ?? null;
    $id_cours = $data['id_cours'] ?? null;
    $date_presence = $data['date_presence'] ?? null;
    $statut = $data['statut'] ?? 'absent';
    $heure_arrivee = $data['heure_arrivee'] ?? null;
    $justification = $data['justification'] ?? null;

    if (!$id_presence || !$id_etudiant || !$id_cours || !$date_presence) {
        echo json_encode(['success' => false, 'message' => 'Paramètres requis manquants']);
        exit;
    }

    $presence = new Presence(
        $id_etudiant,
        $id_cours,
        $date_presence,
        $statut,
        $heure_arrivee,
        $justification,
        $id_presence
    );

    $success = $pm->updatePresence($presence);

    if ($success) {
        echo json_encode(['success' => true, 'presence' => $data]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Échec de la mise à jour de la présence']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
