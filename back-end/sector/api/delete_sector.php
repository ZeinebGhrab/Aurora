<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/SectorManager.php';

header('Content-Type: application/json');

$db = new Database();
$sectorManager = new SectorManager($db);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;

    if ($id) {
        $success = $sectorManager->deleteProgram($id);
        if ($success) {
            echo json_encode(['success' => true, 'message' => 'Program deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error deleting program']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Missing program ID']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
