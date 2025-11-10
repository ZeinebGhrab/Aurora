<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/CourseManager.php';
require_once '../models/Course.php';

header('Content-Type: application/json');

$db = new Database();
$cm = new CourseManager($db);

$courses = $cm->getAllCourses();
echo json_encode(['success' => true, 'courses' => $courses]);
?>
