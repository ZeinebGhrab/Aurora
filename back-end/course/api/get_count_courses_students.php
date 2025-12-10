<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/CourseManager.php';
require_once '../models/Course.php';

require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

// Vérifier que l'utilisateur est connecté
requireLogin();

// Vérifier que l'utilisateur est étudiant
requireStudent();   

$db = new Database();
$cm = new CourseManager($db);

$id_etudiant= $_SESSION['id_utilisateur'];

$courses = $cm->getStudentCourseCount($id_etudiant);
echo json_encode(['success' => true, 'courses' => $courses]);
?>
