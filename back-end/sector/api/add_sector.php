<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/SectorManager.php';

header('Content-Type: application/json');

$db = new Database();
$sectorManager = new SectorManager($db);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $code = $_POST['code'] ?? '';
    $name = $_POST['name'] ?? '';

    if ($code && $name) {
        $success = $sectorManager->addProgram($code, $name);
        if ($success) {
            echo json_encode(['success' => true, 'message' => 'Program added successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error adding program']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
