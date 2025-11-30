<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/SessionManager.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

try {
    requireLogin();  

    // Récupérer l'ID du cours depuis le body JSON
    $input = json_decode(file_get_contents("php://input"), true) ?? [];
    if (empty($input['cours'])) {
        throw new Exception("L'ID du cours est requis");
    }
    $id_cours = (int)$input['cours'];

    // Récupérer les filtres optionnels
    $filters = [
        'page' => isset($input['page']) ? (int)$input['page'] : 1,
        'limit' => isset($input['limit']) ? (int)$input['limit'] : 10,
        'statut' => $input['statut'] ?? null,
        'search' => $input['search'] ?? ''
    ];

    $db = new Database();
    $sm = new SessionManager($db);

    $result = $sm->getSessionsByCourse($id_cours, $filters);

    echo json_encode([
        "success" => true,
        "id_cours" => $id_cours,
        "sessions" => $result['seances'],
        "pagination" => $result['pagination']
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Erreur serveur : " . $e->getMessage()
    ]);
}
