<?php
require_once __DIR__ . '/../../../config/Database.php';
require_once '../../models/student/StudentManager.php';
require_once '../auth/check_session_logic.php';

header('Content-Type: application/json');

try {

    // Vérifier que l'utilisateur est connecté
    requireLogin();

    // Vérifier que l'utilisateur est admin
    requireAdmin(); 

    $db = new Database();
    $sm = new StudentManager($db);

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $id = $data['id_student'] ?? null;
    $nom = $data['nom'] ?? '';
    $prenom = $data['prenom'] ?? '';
    $email = $data['email'] ?? '';
    $id_filiere = $data['id_filiere'] ?? null;
    $niveau = $data['niveau'] ?? '';
    $statut = $data['statut'] ?? '';


    if ($id && $nom && $prenom && $email) {
        $success = $sm->updateStudent($id, $nom, $prenom, $email, $id_filiere, $niveau, $statut);
        echo json_encode(['success' => $success]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Paramètres requis manquants']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
