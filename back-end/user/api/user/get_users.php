<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once __DIR__ . '/../../models/UserManager.php';

try {
    // Vérifier que l'utilisateur est connecté
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'error' => 'Utilisateur non connecté']);
        exit();
    }

    // Vérifier que l'utilisateur est un admin
    if ($_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'error' => "Utilisateur non autorisé"]);
        exit();
    }

    // Pagination depuis POST
    $page = isset($_POST['page']) ? max(1, intval($_POST['page'])) : 1;
    $limit = isset($_POST['limit']) ? max(1, intval($_POST['limit'])) : 10;

    $userManager = new UserManager();
    $usersData = $userManager->getAllUsers($page, $limit);

    echo json_encode([
        'success' => true,
        'users' => $usersData['users'],
        'page' => $usersData['page'],
        'limit' => $usersData['limit'],
        'total' => $usersData['total'],
        'totalPages' => $usersData['totalPages']
    ]);

    $userManager->close();

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
