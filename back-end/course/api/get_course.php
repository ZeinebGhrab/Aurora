<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/CourseManager.php';
require_once '../models/Course.php';

require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

// Vérifier que l'utilisateur est connecté
requireLogin();

// Vérifier que l'utilisateur est un admin
requireAdmin();

$data = json_decode(file_get_contents("php://input"), true);
$id_cours = $data['id_cours'] ?? null;

$db = new Database();
$cm = new CourseManager($db);

if ($id_cours) {
    $course = $cm->getCourseById($id_cours);
    if ($course) {
        echo json_encode([
            'success' => true,
            'course' => $course  
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Cours introuvable']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID du cours manquant']);
}
?>

