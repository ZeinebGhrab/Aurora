<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/CourseManager.php';
require_once '../models/Course.php';

require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

// Vérifier que l'utilisateur est connecté
requireLogin();

// Vérifier que l'utilisateur est un admin
requireAdmin();

$db = new Database();
$cm = new CourseManager($db);

$courses = $cm->getCourseCountByFiliere();
echo json_encode(['success' => true, 'courses' => $courses]);
?>
