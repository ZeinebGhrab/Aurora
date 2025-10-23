<?php
session_start();

// Connexion à la base de données
$link = mysqli_connect("localhost", "root", "", "aurora");

// Vérifier la connexion
if (!$link) {
    die("Erreur de connexion à la base de données : " . mysqli_connect_error());
}

// Vérifier si le formulaire a été soumis
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $mot_de_passe = $_POST['mot_de_passe'] ?? '';

    // Préparer la requête SQL de manière sécurisée
    $stmt = $link->prepare("SELECT * FROM utilisateur WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();

    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    // Vérifier le mot de passe
    if ($user && password_verify($mot_de_passe, $user['mot_de_passe'])) {
        $_SESSION['connecte'] = true;
        $_SESSION['user_id'] = $user['id_utilisateur'];
        $_SESSION['nom'] = $user['nom'];
        $_SESSION['prenom'] = $user['prenom'];

        // Redirection vers le tableau de bord
        header("Location: ../../front-end/interfaces/admin-management/aurora-admin-dashboard.html");
        exit();
    } else {
        echo "Email ou mot de passe incorrect.";
    }

    // Fermer la requête
    $stmt->close();
}

// Fermer la connexion
mysqli_close($link);
?>
