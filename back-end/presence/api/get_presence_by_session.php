<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/PresenceManager.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

try {
    // Vérifier que l'utilisateur est connecté et est admin
    requireLogin();
    requireTeacher();

    // Récupérer les données POST
    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    // Vérifier que l'ID de séance est fourni
    if (!isset($input['id_seance']) || empty($input['id_seance'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "L'identifiant de la séance est requis."
        ]);
        exit;
    }

    $id_seance = (int)$input['id_seance'];
    $page      = isset($input['page']) ? (int)$input['page'] : 1;
    $limit     = isset($input['limit']) ? (int)$input['limit'] : 10;

    // Instancier le manager et récupérer les présences
    $db = new Database();
    $pm = new PresenceManager($db);

    $result = $pm->getPresenceBySession($id_seance, $page, $limit);

    echo json_encode([
        "success" => true,
        "presences" => $result['presences'],
        "pagination" => $result['pagination'],
        "stats" => $result['stats']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur serveur : " . $e->getMessage()
    ]);
}
?>
