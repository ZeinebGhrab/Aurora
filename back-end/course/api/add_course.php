<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/CourseManager.php';
require_once '../models/Course.php';

header('Content-Type: application/json');

try {
    $db = new Database();
    $cm = new CourseManager($db);

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    // Récupérer les données JSON envoyées depuis JS
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Aucune donnée reçue']);
        exit;
    }

    $nom_cours = $data['nom_cours'] ?? '';
    $code_cours = $data['code_cours'] ?? '';
    $id_enseignant = $data['id_enseignant'] ?? null;
    $id_filiere = $data['id_filiere'] ?? null;
    $niveau = $data['niveau'] ?? '';

    if (empty($nom_cours) || empty($code_cours)) {
        echo json_encode(['success' => false, 'message' => 'Nom et code du cours sont requis']);
        exit;
    }

    $success = $cm->addCourse($nom_cours, $code_cours, $id_enseignant, $id_filiere, $niveau);

    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Cours ajouté avec succès',
            'course' => $data
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Échec de l\'ajout du cours']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
