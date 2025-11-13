<?php
require_once __DIR__ . '/../../config/Database.php';

class UserManager {
    private Database $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->connect();
    }

    // Créer un nouvel utilisateur

    public function login($email, $mot_de_passe) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("SELECT * FROM utilisateur WHERE email = ?");
        $stmt->bind_param("s", $email);
        $res = $stmt->execute();
        $stmt->execute();

        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
        return ['status' => 'no_account']; // aucun compte avec cet email
        }

        $user = $result->fetch_assoc();
        $stmt->close();

        if (!password_verify($mot_de_passe, $user['mot_de_passe'])) {
            return ['status' => 'wrong_password']; // mauvais mot de passe
        }

        if ($user['statut'] === 'désactivé') {
            return ['status' => 'disabled']; // Compte désactivé
        }

        // Connexion réussie
        $_SESSION['id_utilisateur'] = $user['id_utilisateur'];
        $_SESSION['statut'] = $user['statut'];
        $_SESSION['role'] = $user['type_compte'];

        // Charger les données utilisateur
        $this->id = $user['id_utilisateur'];
        $this->nom = $user['nom'];
        $this->prenom = $user['prenom'];
        $this->email = $user['email'];
        $this->role = $user['type_compte'];
        $this->photo = $user['photo_profil'];

        return [
        'status' => 'success',
        'data' => $user  // <-- Retourner toutes les infos utilisateur
        ];
    } 

    // Compter tous les utilisateurs
    public function countAllUsers(): int {
        $stmt = $this->conn->prepare("SELECT COUNT(*) AS total FROM utilisateur");
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return (int)$result['total'];
    }


    // Tous les utilisateurs avec pagination
    public function getAllUsers(int $page = 1, int $limit = 10) {
        try {
            $offset = ($page - 1) * $limit;

            // Récupérer le nombre total d'utilisateurs
            $countStmt = $this->conn->prepare("SELECT COUNT(*) AS total FROM utilisateur");
            $countStmt->execute();
            $countResult = $countStmt->get_result()->fetch_assoc();
            $totalUsers = $countResult['total'];
            $countStmt->close();

            // Récupérer les utilisateurs pour la page courante
            $sql = "SELECT * FROM utilisateur ORDER BY nom ASC, prenom ASC LIMIT ? OFFSET ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param('ii', $limit, $offset);
            $stmt->execute();
            $result = $stmt->get_result();

            $users = [];
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            $stmt->close();

            return [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalUsers,
                'totalPages' => ceil($totalUsers / $limit),
                'users' => $users
            ];
        } catch (Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Fermer la connexion
    public function close(): void {
        $this->db->close();
    }

}
?>
