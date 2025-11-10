<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/teacher/TeacherManager.php';

header('Content-Type: application/json');

$db = new Database();
$tm = new TeacherManager($db);

$teachers = $tm->getCountTeachers();
echo json_encode(['success' => true, 'teachers' => $teachers]);
?>
