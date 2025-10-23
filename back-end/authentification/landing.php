<?php
session_start();
// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['connecte']) || $_SESSION['connecte'] != true) {
    header("Location:../../front-end/interfaces/authentification/aurora-login-page.html"); // redirige vers le formulaire de connexion
    exit();
}
// Afficher les informations de l'utilisateur
echo "Bienvenue " . $_SESSION['nom'] . " " . $_SESSION['prenom'];
?>