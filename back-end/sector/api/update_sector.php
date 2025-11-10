<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/SectorManager.php';

header('Content-Type: application/json');

$db = new Database();
$sectorManager = new SectorManager($db);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;
    $code = $_POST['code'] ?? '';
    $name = $_POST['name'] ?? '';

    if ($id && $code && $name) {
        $success = $sectorManager->updateProgram($id, $code, $name);
        if ($success) {
            echo json_encode(['success' => true, 'message' => 'Program updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error updating program']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
