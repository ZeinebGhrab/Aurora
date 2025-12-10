<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/teacher/TeacherManager.php';
require_once '../auth/check_session_logic.php';

header('Content-Type: application/json');

// Vérifier que l'utilisateur est connecté
requireLogin();

// Vérifier que l'utilisateur est admin
requireAdmin(); 

$db = new Database();
$tm = new TeacherManager($db);

$teachers = $tm->getCountTeachersByFiliereAndNiveau();
echo json_encode($teachers);
?>
