<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['connect']) || $_SESSION['connect'] !== true) {
    echo json_encode([
        'connect' => false
    ]);
    exit();
}

// Utilisateur connecté
echo json_encode([
    'connect' => true,
    'user' => [
        'id' => $_SESSION['id_utilisateur'],
        'nom' => $_SESSION['nom'],
        'prenom' => $_SESSION['prenom'],
        'role' => $_SESSION['role'],
        'statut' => $_SESSION['statut']
    ]
]);

?>
