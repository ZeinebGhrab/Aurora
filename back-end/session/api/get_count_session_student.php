<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/SessionManager.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

header('Content-Type: application/json');

// Vérifier que l'utilisateur est connecté
requireLogin();

// Vérifier que l'utilisateur est un étudiant
requireStudent();

$db = new Database();
$sm = new SessionManager($db);

$result = $sm->getSessionStatsByStudent($_SESSION['id_utilisateur']);
echo json_encode(['success' => true, 'results' => $result]);
?>
