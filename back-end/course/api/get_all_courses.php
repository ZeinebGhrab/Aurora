<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/CourseManager.php';
require_once '../models/Course.php';

header('Content-Type: application/json');

try {
    $db = new Database();
    $cm = new CourseManager($db);

    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    $filters = [
        'page' => $input['page'] ?? 1,
        'limit' => $input['limit'] ?? 2,
        'filiere' => $input['filiere'] ?? null,
        'search' => $input['search'] ?? ''
    ];

    $result = $cm->getAllCourses($filters);

    echo json_encode([
        "success" => true,
        "courses" => $result["courses"],
        "pagination" => $result["pagination"]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur : ' . $e->getMessage()
    ]);
}

?>