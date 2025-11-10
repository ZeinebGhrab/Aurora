<?php
require_once '../../../config/Database.php';
require_once '../../models/UserManager.php';

header('Content-Type: application/json');

$userManager = new UserManager();
$totalUsers = $userManager->countAllUsers();

echo json_encode([
    'totalUsers' => $totalUsers
]);
?>
