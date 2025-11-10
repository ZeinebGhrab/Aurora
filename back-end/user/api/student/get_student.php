<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/student/StudentManager.php';

header('Content-Type: application/json');

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
