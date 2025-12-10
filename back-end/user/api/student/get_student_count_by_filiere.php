<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/student/StudentManager.php';
require_once '../auth/check_session_logic.php';

header('Content-Type: application/json');

// Vérifier que l'utilisateur est connecté
requireLogin();

// Vérifier que l'utilisateur est admin
requireAdmin(); 

$db = new Database();
$tm = new StudentManager($db);

$students = $tm->getCountStudentsByFiliere();
echo json_encode(['success' => true, 'students' => $students]);
?>
