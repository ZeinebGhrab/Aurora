<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['connecte']) || $_SESSION['connecte'] !== true) {
    echo json_encode([
        'connected' => false
    ]);
    exit();
}

// Utilisateur connecté
echo json_encode([
    'connecte' => true,
    'user' => [
        'id' => $_SESSION['user_id'],
        'nom' => $_SESSION['nom'],
        'prenom' => $_SESSION['prenom'],
        'role' => $_SESSION['role'],
        'statut' => $_SESSION['statut']
    ]
]);

?>
