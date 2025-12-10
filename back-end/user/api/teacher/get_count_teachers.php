<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/teacher/TeacherManager.php';
require_once '../auth/check_session_logic.php';

header('Content-Type: application/json');

// Vérifier que l'utilisateur est connecté
requireLogin();

$db = new Database();
$tm = new TeacherManager($db);

$teachers = $tm->getCountTeachers();
echo json_encode(['success' => true, 'teachers' => $teachers]);
?>
