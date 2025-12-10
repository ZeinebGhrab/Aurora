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
    $tm = new StudentManager($db);

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

    $nom = $data ['nom'] ?? '';
    $prenom = $data ['prenom'] ?? '';
    $email = $data ['email'] ?? '';
    $mot_de_passe = $data ['mot_de_passe'] ?? '';
    $id_filiere = isset($data['id_filiere']) ? (int)$data['id_filiere'] : null;
    $niveau = $data['niveau'] ?? null;
    $photo_profil = $data ['photo_profil'] ?? '';

    if ($nom && $prenom && $email && $mot_de_passe) { 
        $success = $tm->addStudent($nom, $prenom, $email, $mot_de_passe, $id_filiere, $niveau, $photo_profil);
        echo json_encode([
            'success' => true,
            'message' => 'Etudiant ajouté avec succès',
            'etudiant' => $data
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Échec de l\'ajout de l\'etudiant']);
    }

}catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
