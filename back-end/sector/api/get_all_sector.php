<?php
require_once __DIR__ . '/../../config/Database.php';
require_once '../models/SectorManager.php';

header('Content-Type: application/json');

$db = new Database();
$sectorManager = new SectorManager($db);

$programs = $sectorManager->getAllPrograms();

echo json_encode(['success' => true, 'programs' => $programs]);
?>
