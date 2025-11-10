<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
require_once __DIR__ . '/../../models/UserManager.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Méthode non autorisée.');
    }

    $id = $_POST['id'] ?? null;
    if (!$id) throw new Exception('ID utilisateur manquant.');

    $manager = new UserManager();
    $res = $manager->blockUser(intval($id));
    $manager->close();

    if ($res) {
        echo json_encode(['success' => true, 'message' => 'Utilisateur bloqué avec succès.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Impossible de bloquer cet utilisateur.']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
