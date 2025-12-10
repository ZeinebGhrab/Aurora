<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/teacher/TeacherManager.php';
require_once '../auth/check_session_logic.php';

header('Content-Type: application/json');

try {

    // Vérifier que l'utilisateur est connecté
    requireLogin();

    // Vérifier que l'utilisateur est admin
    requireAdmin(); 

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

    $id = $data['id_teacher'] ?? null;
    $nom = $data['nom'] ?? '';
    $prenom = $data['prenom'] ?? '';
    $email = $data['email'] ?? '';
    $grade = $data['grade'] ?? null;
    $specialite = $data['specialite'] ?? null;
    $statut = $data['statut'] ?? '';

    if ($id && $nom && $prenom && $email) {
        $success = $tm->updateTeacher($id, $nom, $prenom, $email, $grade, $specialite, $statut);
        echo json_encode(['success' => $success]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Paramètres requis manquants']);
    }

}catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
