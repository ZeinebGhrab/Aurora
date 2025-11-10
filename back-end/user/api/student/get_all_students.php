<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/student/StudentManager.php';

header('Content-Type: application/json');

$db = new Database();
$sm = new StudentManager($db);

$students = $sm->getAllStudents();
echo json_encode(['success' => true, 'students' => $students]);
?>
