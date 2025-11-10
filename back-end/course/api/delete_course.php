<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/CourseManager.php';

header('Content-Type: application/json');

$db = new Database();
$cm = new CourseManager($db);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Lire les données JSON envoyées
    $data = json_decode(file_get_contents('php://input'), true);
    $id_cours = $data['id_cours'] ?? null;

    if ($id_cours) {
        $success = $cm->deleteCourse($id_cours);
        echo json_encode(['success' => $success]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ID du cours manquant']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
}
?>
