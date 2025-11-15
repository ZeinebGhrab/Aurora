<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/PresenceManager.php';
require_once '../models/Presence.php';

header('Content-Type: application/json');

try {
    $db = new Database();
    $pm = new PresenceManager($db);

    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    $filters = [
        'id_etudiant' => $input['id_etudiant'] ?? null,
        'id_cours' => $input['id_cours'] ?? null,
        'date' => $input['date'] ?? null
    ];

    $presences = $pm->getAllPresences($filters);

    // Convertir les objets Presence en tableaux associatifs pour JSON
    $data = array_map(function($presence) {
        return [
            'id_presence' => $presence->getId(),
            'id_etudiant' => $presence->getIdEtudiant(),
            'id_cours' => $presence->getIdCours(),
            'date_presence' => $presence->getDatePresence(),
            'statut' => $presence->getStatut(),
            'heure_arrivee' => $presence->getHeureArrivee(),
            'justification' => $presence->getJustification()
        ];
    }, $presences);

    echo json_encode([
        'success' => true,
        'presences' => $data,
        'total' => count($data)
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur : ' . $e->getMessage()
    ]);
}
?>
