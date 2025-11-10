<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/SectorManager.php';

header('Content-Type: application/json');

$db = new Database();
$sectorManager = new SectorManager($db);

$id = $_GET['id'] ?? null;

if ($id) {
    $program = $sectorManager->getProgramById($id);
    if ($program) {
        echo json_encode(['success' => true, 'program' => $program]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Program not found']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Missing program ID']);
}
?>
