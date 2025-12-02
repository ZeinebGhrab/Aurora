<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/PresenceManager.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

try {
    requireLogin();
    requireStudent();

    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    $filters = [
        'page' => isset($input['page']) ? (int)$input['page'] : 1,
        'limit' => isset($input['limit']) ? (int)$input['limit'] : 10,
        'id_cours' => $input['id_cours'] ?? null,
        'id_etudiant' => $_SESSION['id_utilisateur']
    ];

    $db = new Database();
    $pm = new PresenceManager($db);

    $result = $pm->getPresenceByStudent($_SESSION['id_utilisateur']);

    echo json_encode([
        "success" => true,
        "presences" => $result['presences'],
        "pagination" => $result['pagination'],
        'stats' => $result['stats']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur serveur : " . $e->getMessage()
    ]);
}
?>
