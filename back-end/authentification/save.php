<?php
// 1. Connexion à la base de données
$link = mysqli_connect("localhost", "root", "", "aurora");
// Vérifier la connexion
if (!$link) {
    die("Erreur de connexion : " . mysqli_connect_error());
}
// 2. Récupération des données du formulaire
$nom = $_POST['nom'];
$prenom = $_POST['prenom'];
$email = $_POST['email'];
$filiere = $_POST['filiere'];
$mot_de_passe = password_hash($_POST['mot_de_passe'], PASSWORD_DEFAULT); // Sécurité
// 3. Gestion du téléchargement de la photo
$photo_nom = null;
$dossier = "uploads/";
if (!is_dir($dossier)) mkdir($dossier); // créer le dossier s'inexistant
$photo_nom = basename($_FILES['photo_profil']['name']);
$chemin = $dossier . $photo_nom;
move_uploaded_file($_FILES['photo_profil']['tmp_name'], $chemin);
// 4. Insertion dans la base de données
$sql = "INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, photo_profil)
VALUES ('$nom', '$prenom', '$email', '$mot_de_passe', '$photo_nom')";
if (mysqli_query($link, $sql)) {
    header("Location: ../../front-end/interfaces/admin-management/aurora-admin-dashboard.html");
} else {
    echo "Erreur : " . mysqli_error($link);
}
// 5. Fermer la connexion
mysqli_close($link);
?>