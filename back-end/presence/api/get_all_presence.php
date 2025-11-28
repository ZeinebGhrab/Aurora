<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/PresenceManager.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

try {
    requireLogin();
    requireAdmin();

    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    $filters = [
        'page' => isset($input['page']) ? (int)$input['page'] : 1,
        'limit' => isset($input['limit']) ? (int)$input['limit'] : 10,
        'filiere' => $input['filiere'] ?? null,
        'niveau' => $input['niveau'] ?? null,
        'id_cours' => $input['id_cours'] ?? null,
        'statut' => $input['statut'] ?? null
    ];

    $db = new Database();
    $pm = new PresenceManager($db);

    $result = $pm->getAllPresences($filters);

    echo json_encode([
        "success" => true,
        "presences" => $result['presences'],
        "pagination" => $result['pagination']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur serveur : " . $e->getMessage()
    ]);
}
?>
