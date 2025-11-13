<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/teacher/TeacherManager.php';

header('Content-Type: application/json');

try {

    $db = new Database();
    $tm = new TeacherManager($db);

    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    $filters = [
        'page' => $input['page'] ?? 1,
        'limit' => $input['limit'] ?? 1000,
        'statut' => $input['statut'] ?? null,
        'search' => $input['search'] ?? ''
    ];

    $result = $tm->getAllTeachers($filters);
    echo json_encode([
        "success" => true,
        "teachers" => $result["teachers"],
        "pagination" => $result["pagination"]
    ]);


} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur : ' . $e->getMessage()
    ]);
}

?>
