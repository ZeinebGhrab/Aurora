<?php
// --- Initialisation ---
session_start();

// Désactiver l'affichage des erreurs pour le front-end
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Forcer le type de contenu JSON
header('Content-Type: application/json; charset=utf-8');

// Utiliser la capture de sortie pour éviter tout HTML inattendu
ob_start();

try {
    // Vérifier la méthode HTTP
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Méthode non autorisée.');
    }

    // Récupérer et nettoyer les données
    $email = trim($_POST['email'] ?? '');
    $mot_de_passe = trim($_POST['mot_passe'] ?? '');

    if (empty($email) || empty($mot_de_passe)) {
        throw new Exception('Veuillez remplir tous les champs.');
    }

    // --- Inclusion des dépendances ---
    require_once '../../../config/Database.php';
    require_once '../../models/UserManager.php';
    require_once '../../models/student/Student.php';
    require_once '../../models/teacher/Teacher.php';

    // --- Connexion à la base de données ---
    $db = new Database();
    $conn = $db->connect();

    // --- Création de l'objet utilisateur ---
    $user = new UserManager($db);

    // --- Tentative de connexion ---
    $loginResult = $user->login($email, $mot_de_passe);

    $response = []; // réponse finale JSON

    switch ($loginResult['status'] ?? '') {

        case 'no_account':
            $response = [
                'success' => false,
                'message' => "Aucun compte n’est associé à cet email."
            ];
            break;

        case 'wrong_password':
            $response = [
                'success' => false,
                'message' => "Le mot de passe est incorrect."
            ];
            break;

        case 'disabled':
            // Vérifier le statut du compte
            if (($_SESSION['statut'] ?? '') === 'désactivé') {
                $response = [
                    'success' => false,
                    'message' => "Votre compte est désactivé. Veuillez contacter l’administrateur."
                ];
                break;
            }

        case 'success':
            $userData = $loginResult['data'];
            
            // Enregistrer l'utilisateur dans la session
            $_SESSION['connect'] = true;
            $_SESSION['id_utilisateur'] = $userData['id_utilisateur'];
            $_SESSION['role'] = $userData['type_compte'];
            $_SESSION['statut'] = $userData['statut'] ?? 'activé'; 
            $_SESSION['email'] = $userData['email'];
            $_SESSION['nom'] = $userData['nom'];
            $_SESSION['prenom'] = $userData['prenom'];

            $response = [
            'success' => true,
            'user' => [
                'id' => $userData['id_utilisateur'],
                'nom' => $userData['nom'],
                'prenom' => $userData['prenom'],
                'email' => $userData['email'],
                'role' => $userData['type_compte'],
                'photo_profil' => $userData['photo_profil']
            ]
    ];
            break;

        default:
            $response = [
                'success' => false,
                'message' => "Une erreur est survenue. Veuillez réessayer."
            ];
            break;
    }

    // --- Fermer la connexion ---
    if ($conn) $conn->close();

    // Supprimer toute sortie non JSON capturée
    ob_end_clean();

    // Envoyer le JSON
    echo json_encode($response, JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    // Supprimer toute sortie non JSON capturée
    ob_end_clean();

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
