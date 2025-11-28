<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/SessionManager.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

try {
    // Vérifier session + rôle admin
    requireLogin();
    requireAdmin();

    // Récupérer les filtres depuis le body JSON
    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    $filters = [
        'page' => isset($input['page']) ? (int)$input['page'] : 1,
        'limit' => isset($input['limit']) ? (int)$input['limit'] : 6,
        'cours' => $input['cours'] ?? null,
        'enseignant' => $input['enseignant'] ?? null,
        'search' => $input['search'] ?? '',
    ];

    $db = new Database();
    $sm = new SessionManager($db);

    // Récupérer les séances avec filtres et pagination
    $result = $sm->getAllSeances($filters);

    echo json_encode([
        "success" => true,
        "sessions" => $result['seances'],
        "pagination" => $result['pagination']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur serveur : " . $e->getMessage()
    ]);
}
