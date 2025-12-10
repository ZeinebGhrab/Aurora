<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/student/StudentManager.php';
require_once '../auth/check_session_logic.php';

header('Content-Type: application/json');

// Vérifier que l'utilisateur est connecté
requireLogin();

$db = new Database();
$sm = new StudentManager($db);

$input = json_decode(file_get_contents('php://input'), true);
$id_etudiant= $input['id_student'] ?? null;

if ($id_etudiant) {
    $student = $sm->getStudentById($id_etudiant);
    if ($student) {
        echo json_encode(['success' => true, 'student' => $student]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Étudiant introuvable']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID manquant']);
}
?>
