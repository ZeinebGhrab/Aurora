<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/teacher/TeacherManager.php';

header('Content-Type: application/json');

$db = new Database();
$tm = new TeacherManager($db);

$input = json_decode(file_get_contents('php://input'), true);
$id_enseignant = $input['id_teacher'] ?? null;

if ($id_enseignant) {
    $teacher = $tm->getTeacherById($id_enseignant);
    if ($teacher) {
        echo json_encode(['success' => true, 'teacher' => $teacher]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Enseignant introuvable']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID manquant']);
}
?>
