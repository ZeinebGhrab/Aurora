<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/SessionManager.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

try {
    requireLogin();
    requireStudent();

    $id_etudiant = $_SESSION['id_utilisateur'];

    // Récupérer les filtres depuis le body JSON
    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    $filters = [
        'page' => isset($input['page']) ? (int)$input['page'] : 1,
        'limit' => isset($input['limit']) ? (int)$input['limit'] : 1000,
        'cours' => $input['cours'] ?? null,
        'search' => $input['search'] ?? ''
    ];

    $db = new Database();
    $sm = new SessionManager($db);

    $result = $sm->getSeancesByStudent($id_etudiant, $filters);

    echo json_encode([
        "success" => true,
        "id_etudiant" => $id_etudiant,
        "sessions" => $result['seances'],
        "pagination" => $result['pagination']
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Erreur serveur : " . $e->getMessage()
    ]);
}
