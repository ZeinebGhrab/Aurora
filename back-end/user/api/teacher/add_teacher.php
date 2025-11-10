<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/teacher/TeacherManager.php';

header('Content-Type: application/json');

try {

    $db = new Database();
    $tm = new TeacherManager($db);

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

    $nom = $data['nom'] ?? '';
    $prenom = $data['prenom'] ?? '';
    $email = $data['email'] ?? '';
    $mot_de_passe = $data['mot_de_passe'] ?? '';
    $grade = $data['grade'] ?? null;
    $specialite = $data['specialite'] ?? null;

    if ($nom && $prenom && $email && $mot_de_passe) {
        $success = $tm->addTeacher($nom, $prenom, $email, $mot_de_passe, $grade, $specialite);
        echo json_encode([
            'success' => true,
            'message' => 'Enseignant ajouté avec succès',
            'teacher' => $data
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Échec de l\'ajout de l\'enseignant']);
    }
}catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
