<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/student/StudentManager.php';

header('Content-Type: application/json');

$db = new Database();
$tm = new StudentManager($db);

$students = $tm->getCountStudentsByNiveau();
echo json_encode(['success' => true, 'students' => $students]);
?>
