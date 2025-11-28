<?php
header('Content-Type: application/json');

$link = mysqli_connect("localhost", "root", "", "aurora");
if (!$link) {
    echo json_encode(['success' => false, 'message' => 'Erreur de connexion à la base de données.']);
    exit;
}

// Champs obligatoires
$required = ['nom', 'prenom', 'email', 'mot_de_passe', 'confirme_mot_passe', 'id_filiere'];
foreach ($required as $field) {
    if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
        echo json_encode(['success' => false, 'message' => 'Tous les champs sont obligatoires.']);
        exit;
    }
}

if (!isset($_FILES['photo_profil']) || $_FILES['photo_profil']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Erreur lors du téléchargement de la photo.']);
    exit;
}

// Récupération des données
$nom = trim($_POST['nom']);
$prenom = trim($_POST['prenom']);
$email = trim($_POST['email']);
$mot_de_passe = $_POST['mot_de_passe'];
$confirme_mot_passe = $_POST['confirme_mot_passe'];
$filiere = intval($_POST['id_filiere']);

// Vérifications
if ($mot_de_passe !== $confirme_mot_passe) {
    echo json_encode(['success' => false, 'message' => 'Les mots de passe doivent être identiques.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Adresse email invalide.']);
    exit;
}

// Vérifier si l'email existe déjà
$stmt = mysqli_prepare($link, "SELECT id_utilisateur FROM utilisateur WHERE email = ?");
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
mysqli_stmt_store_result($stmt);

if (mysqli_stmt_num_rows($stmt) > 0) {
    mysqli_stmt_close($stmt);
    mysqli_close($link);
    echo json_encode(['success' => false, 'message' => 'Cet email est déjà utilisé.']);
    exit;
}
mysqli_stmt_close($stmt);

// Hacher le mot de passe
$mot_de_passe_hash = password_hash($mot_de_passe, PASSWORD_DEFAULT);

// Gestion de la photo
$dossier = "uploads/";
if (!is_dir($dossier)) mkdir($dossier, 0777, true);

$extension = strtolower(pathinfo($_FILES['photo_profil']['name'], PATHINFO_EXTENSION));
$photo_profil = uniqid('photo_', true) . '.' . $extension;
$chemin = $dossier . $photo_profil;

if (!move_uploaded_file($_FILES['photo_profil']['tmp_name'], $chemin)) {
    echo json_encode(['success' => false, 'message' => 'Erreur lors du déplacement de la photo.']);
    exit;
}

// Insérer dans utilisateur
$stmt = mysqli_prepare($link, 
    "INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, photo_profil) 
     VALUES (?, ?, ?, ?, ?)"
);
mysqli_stmt_bind_param($stmt, "sssss", $nom, $prenom, $email, $mot_de_passe_hash, $photo_profil);

if (mysqli_stmt_execute($stmt)) {

    $id_utilisateur = mysqli_insert_id($link);

    // Insérer dans etudiant
    $stmt2 = mysqli_prepare($link, 
        "INSERT INTO etudiant (id_etudiant, id_filiere) VALUES (?, ?)"
    );
    mysqli_stmt_bind_param($stmt2, "ii", $id_utilisateur, $filiere);

    if (mysqli_stmt_execute($stmt2)) {
        mysqli_close($link);
        echo json_encode(['success' => true, 'message' => 'L’étudiant a été inscrit avec succès !']);
    } else {
        mysqli_close($link);
        echo json_encode(['success' => false, 'message' => 'Erreur lors de l’inscription étudiant.']);
    }

} else {
    mysqli_close($link);
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l’inscription utilisateur.']);
}

?>
