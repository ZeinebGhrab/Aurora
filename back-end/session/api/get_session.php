<?php

require_once __DIR__ . '/../../config/Database.php';
require_once '../models/SessionManager.php';
require_once '../models/Session.php';

require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

// Vérifier que l'utilisateur est connecté
requireLogin();

// Vérifier que l'utilisateur est un admin
requireAdmin();

$data = json_decode(file_get_contents("php://input"), true);
$id_seance = $data['id_seance'] ?? null;

$db = new Database();
$sm = new SessionManager($db);

if ($id_seance) {
    $session = $sm->getSeanceById($id_seance);
    if ($session) {
        echo json_encode([
            'success' => true,
            'session' => $session->toArray()
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Séance introuvable']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID du séance manquant']);
}
?>

