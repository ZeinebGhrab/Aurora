<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/PresenceManager.php';
require_once '../models/Presence.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

try {
    
    requireLogin();
    requireStudent();

    $db = new Database();
    $pm = new PresenceManager($db);

    // Vérifie si une image est uploadée
    if (!isset($_FILES['probe'])) {
        echo json_encode(['success' => false, 'message' => 'Aucune image reçue']);
        exit;
    }

    // Créer dossier probe si inexistant
    $uploadDir = __DIR__ . '/uploads/probe/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $ext = pathinfo($_FILES['probe']['name'], PATHINFO_EXTENSION);
    $filename = uniqid('probe_') . '.' . $ext;
    $path = $uploadDir . $filename;

    if (!move_uploaded_file($_FILES['probe']['tmp_name'], $path)) {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'upload']);
        exit;
    }

    // Récupérer infos étudiant et séance depuis POST
    $id_etudiant = $_SESSION['id_utilisateur'];
    $id_seance   = (int)($_POST['id_seance'] ?? 0);

    if ($id_etudiant <= 0 || $id_seance <= 0) {
        echo json_encode(['success' => false, 'message' => 'Paramètres requis manquants']);
        exit;
    }

    // APPEL AU SCRIPT PYTHON 
    $pythonPath   = "C:\\Users\\Lenovo\\AppData\\Local\\Programs\\Python\\Python311\\python.exe";
    $pythonScript = __DIR__ . "\\../models/check_face.py";

    $image_arg = escapeshellarg($path);
    $id_arg    = escapeshellarg($id_etudiant);

    $cmd = "\"$pythonPath\" \"$pythonScript\" $image_arg $id_arg";
    $output = shell_exec($cmd);

    if (!$output || trim($output) === "") {
        echo json_encode([
            'success' => false,
            'message' => 'Aucune sortie Python',
            'cmd' => $cmd
        ]);
        exit;
    }

    // Extraire uniquement le JSON de la sortie Python

    $lines = explode("\n", trim($output));
    $json_line = null;
    foreach ($lines as $line) {
        $line = trim($line);
        if (str_starts_with($line, '{') && str_ends_with($line, '}')) {
            $json_line = $line;
            break;
        }
    }

    if (!$json_line) {
        echo json_encode([
            'success' => false,
            'message' => 'Aucun JSON valide trouvé dans la sortie Python',
            'output_raw' => $output
        ]);
        exit;
    }

    $result = json_decode($json_line, true);

    if (!$result) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors du décodage du JSON',
            'json_line' => $json_line
        ]);
        exit;
    }

    // GESTION DES RÉSULTATS 
    // Valider uniquement si status = 'found' et identity_verified = true (si présent)
    if (isset($result['status']) && $result['status'] === 'found' && (!isset($result['identity_verified']) || $result['identity_verified'] === true)) {
        $statut = "present";
        $heure_arrivee = date("H:i:s");

        $presence = new Presence([
            'id_etudiant'   => $id_etudiant,
            'id_seance'     => $id_seance,
            'statut'        => 'present',
            'heure_arrivee' => date("H:i:s"),
            'justification' => null
        ]);

        if ($pm->addPresenceByStudent($presence)) {
            echo json_encode(['success' => true, 'message' => 'Présence validée par DeepFace']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erreur ajout présence']);
        }

    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Reconnaissance faciale échouée',
            'details' => $result
        ]);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
