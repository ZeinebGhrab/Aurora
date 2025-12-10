<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/student/StudentManager.php';
require_once '../auth/check_session_logic.php';

header('Content-Type: application/json');

try {

    // Vérifier que l'utilisateur est connecté
    requireLogin();

    // Vérifier que l'utilisateur est admin
    requireAdmin(); 

    $db = new Database();
    $studentManager = new StudentManager($db);

    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    $filters = [
        'page' => $input['page'] ?? 1,
        'limit' => $input['limit'] ?? 12,
        'filiere' => $input['filiere'] ?? '',
        'niveau' => $input['niveau'] ?? '',
        'search' => $input['search'] ?? ''
    ];

    $result = $studentManager->getAllStudents($filters);

    echo json_encode([
        "success" => true,
        "students" => $result["students"],
        "pagination" => $result["pagination"]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur : ' . $e->getMessage()
    ]);
}