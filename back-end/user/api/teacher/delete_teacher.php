<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/teacher/TeacherManager.php';

header('Content-Type: application/json');

$db = new Database();
$tm = new TeacherManager($db);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id_teacher'] ?? null;

    if ($id) {
        $success = $tm->deleteTeacher($id);
        echo json_encode(['success' => $success]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ID manquant']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
}
?>
