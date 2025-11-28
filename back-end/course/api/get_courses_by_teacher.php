<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/CourseManager.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

try {
    // Vérifier que l'utilisateur est connecté
    requireLogin();

    // Vérifier que l'utilisateur est enseignant
    requireTeacher(); 

    // Récupérer l'ID de l'enseignant connecté
    $id_enseignant= $_SESSION['id_utilisateur'];

    $db = new Database();
    $cm = new CourseManager($db);

    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    $filters = [
        'page' => $input['page'] ?? 1,
        'limit' => $input['limit'] ?? 6,
        'filiere' => $input['filiere'] ?? null,
        'search' => $input['search'] ?? ''
    ];

    // Appeler la fonction du manager
    $courses = $cm->getCoursesByTeacher($id_enseignant, $filters);

    echo json_encode([
        "success" => true,
        "id_utilisateur" => $id_enseignant,
        "courses" => $courses["courses"],
        "pagination" => $courses["pagination"]
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Erreur serveur : " . $e->getMessage()
    ]);
}
?>
