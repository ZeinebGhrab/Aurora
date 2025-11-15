<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/PresenceManager.php';
require_once '../models/Presence.php';

header('Content-Type: application/json');

try {
    $db = new Database();
    $pm = new PresenceManager($db);

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

    $id_etudiant = isset($data['id_etudiant']) ? (int)$data['id_etudiant'] : null;
    $id_cours = isset($data['id_cours']) ? (int)$data['id_cours'] : null;
    $date_presence = $data['date_presence'] ?? null;
    $statut = $data['statut'] ?? 'absent';
    $heure_arrivee = $data['heure_arrivee'] ?? null;
    $justification = $data['justification'] ?? null;

    if (!$id_etudiant || !$id_cours || !$date_presence) {
        echo json_encode(['success' => false, 'message' => 'Paramètres requis manquants']);
        exit;
    }

    $presence = new Presence($id_etudiant, $id_cours, $date_presence, $statut, $heure_arrivee, $justification);
    $success = $pm->addPresence($presence);

    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Présence ajoutée avec succès',
            'presence' => $data
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Échec de l\'ajout de la présence']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
