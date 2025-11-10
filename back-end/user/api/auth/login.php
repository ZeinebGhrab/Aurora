<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Méthode non autorisée.');
    }

    $email = $_POST['email'] ?? '';
    $mot_de_passe = $_POST['mot_passe'] ?? '';

    if (empty($email) || empty($mot_de_passe)) {
        throw new Exception('Veuillez remplir tous les champs.');
    }

    require_once '../../../config/Database.php';
    require_once '../../models/User.php';
    require_once '../../models/student/Student.php';   
    require_once '../../models/teacher/Teacher.php';

    $db = new Database();
    $user = new User($db);

    $loginResult = $user->login($email, $mot_de_passe);

    if ($loginResult) {
        // Vérifier le statut du compte
        if ($_SESSION['statut'] === 'désactivé') {  
            echo json_encode([
                'success' => false,
                'message' => 'Votre compte est désactivé. Veuillez contacter l\'administrateur.'
            ]);
            exit;
        }

        $response = [
            'success' => true,
            'user' => [
                'id' => $user->getId(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'email' => $user->getEmail(),
                'role' => $user->getRole(),
                'photo_profil'=> $user->getPhoto()
            ]
        ];

        // Charger filière si étudiant
        if ($user->getRole() === 'etudiant') {
            $etudiant = new Student($db);
            $etudiant->loadStudentDataByEmail($email);
            $response['user']['filiere'] = $etudiant->getFiliere();
            $response['user']['niveau'] = $etudiant->getNiveau();
        }

        echo json_encode($response);

    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Email ou mot de passe incorrect.'
        ]);
    }

    // Fermer la connexion si ta classe Database gère mysqli
    $db->connect()->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
