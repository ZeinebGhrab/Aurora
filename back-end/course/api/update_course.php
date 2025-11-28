<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/CourseManager.php';
require_once '../models/Course.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');


try {
    // Vérifier que l'utilisateur est connecté
    requireLogin();

    // Vérifier que l'utilisateur est un admin
    requireAdmin();

    $db = new Database();
    $cm = new CourseManager($db);

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $id_cours = $data['id_cours'] ?? null;
    $nom_cours = $data['nom_cours'] ?? '';
    $code_cours = $data['code_cours'] ?? '';
    $id_enseignant = $data['id_enseignant'] ?? null;
    $id_filiere = $data['id_filiere'] ?? null;
    $niveau = $data['niveau'] ?? '';

    if (!$id_cours || !$nom_cours || !$code_cours) {
        echo json_encode(['success' => false, 'message' => 'Paramètres requis manquants']);
        exit;
    }

    $course = new Course($nom_cours, $code_cours, $id_enseignant, $id_filiere, $niveau, $id_cours);
    $success = $cm->updateCourse($course);

    if ($success) {
        echo json_encode(['success' => true, 'course' => $data]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Échec de la mise à jour du cours']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
