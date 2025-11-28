<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/SessionManager.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

try {
    requireLogin();
    
    requireAdmin();

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        throw new Exception("Données invalides");
    }

    $db = new Database();
    $sm = new SessionManager($db);

    if ($sm->addSeance($data)) {
        echo json_encode(["success" => true, "message" => "Séance ajoutée avec succès"]);
    } else {
        echo json_encode(["success" => false, "message" => "Erreur lors de l'ajout"]);
    }

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
