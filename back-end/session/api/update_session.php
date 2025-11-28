<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/SessionManager.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

try {
    requireLogin();
    requireAdmin();

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id_seance'])) {
        throw new Exception("ID séance manquant");
    }

    $id = $data['id_seance'];
    unset($data['id_seance']);

    $db = new Database();
    $sm = new SessionManager($db);

    if ($sm->updateSeance($id, $data)) {
        echo json_encode(["success" => true, "message" => "Séance mise à jour"]);
    } else {
        echo json_encode(["success" => false, "message" => "Échec mise à jour"]);
    }

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
