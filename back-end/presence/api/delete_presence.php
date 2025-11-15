<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/PresenceManager.php';

header('Content-Type: application/json');

$db = new Database();
$pm = new PresenceManager($db);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Lire les données JSON envoyées
    $data = json_decode(file_get_contents('php://input'), true);
    $id_presence = $data['id_presence'] ?? null;

    if ($id_presence) {
        $success = $pm->deletePresence($id_presence);
        echo json_encode(['success' => $success]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ID de la présence manquant']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
}
?>
