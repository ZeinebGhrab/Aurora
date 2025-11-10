<?php
require_once __DIR__ . '/../../config/Database.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../phpmailer/src/Exception.php';
require_once __DIR__ . '/../../phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../../phpmailer/src/SMTP.php';


require_once __DIR__ . '/../../../vendor/autoload.php'; // Composer autoload

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../..');
$dotenv->load();

class UserManager {
    private Database $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->connect();
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

    // Bloquer un utilisateur
    public function blockUser(int $id) {
        try {
            // récupérer les infos utilisateur
            $stmt = $this->conn->prepare("SELECT email, prenom, nom FROM utilisateur WHERE id_utilisateur = ?");
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $user = $stmt->get_result()->fetch_assoc();
            $stmt->close();

            if (!$user) {
                return false; // Aucun utilisateur trouvé
            }

            // bloquer le compte
            $stmt = $this->conn->prepare("UPDATE utilisateur SET statut = 'inactif' WHERE id_utilisateur = ?");
            $stmt->bind_param('i', $id);
            $res = $stmt->execute();
            $stmt->close();

            if ($res) {
            // Envoyer email de notification
            $this->sendUserEmail(
                $user['email'],
                $user['prenom'],
                $user['nom'],
                'Compte bloqué 🚫',
                "Bonjour {$user['prenom']} {$user['nom']},<br><br>
                Votre compte sur <b>AlloCovoit</b> a été temporairement <b>bloqué</b> par l’administrateur.<br>
                Si vous pensez qu’il s’agit d’une erreur, veuillez contacter le support.<br><br>
                Merci de votre compréhension.<br><br>
                <i>L’équipe AlloCovoit</i>"
            );
            }
      
            return $res;
        } catch (Exception $e) {
            error_log("Erreur blocage utilisateur : " . $e->getMessage());
            return false;
        }
    }

    // Débloquer un utilisateur
    public function unblockUser(int $id) {
        try {
            // récupérer les infos utilisateur
            $stmt = $this->conn->prepare("SELECT email, prenom, nom FROM utilisateur WHERE id_utilisateur = ?");
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $user = $stmt->get_result()->fetch_assoc();
            $stmt->close();

            if (!$user) {
                return false; // Aucun utilisateur trouvé
            }

            // Débloquer le compte
            $stmt = $this->conn->prepare("UPDATE utilisateur SET statut = 'actif' WHERE id_utilisateur = ?");
            $stmt->bind_param('i', $id);
            $res = $stmt->execute();
            $stmt->close();

            if ($res) {
                // Envoyer un email de notification à l'utilisateur
                $this->sendUserEmail(
                    $user['email'],
                    $user['prenom'],
                    $user['nom'],
                    'Compte débloqué ✅',
                      "Bonjour {$user['prenom']} {$user['nom']},<br><br>
                       Nous avons le plaisir de vous informer que votre compte sur <b>AlloCovoit</b> a été <b>débloqué</b> par l’administrateur.<br>
                       Vous pouvez désormais vous reconnecter et profiter pleinement de nos services.<br><br>
                       Merci de votre confiance et bienvenue à nouveau sur la plateforme !<br><br>
                       <i>L’équipe AlloCovoit</i>"
                );
                }

            return $res;
        } catch (Exception $e) {
            error_log("Erreur de déblocage utilisateur : " . $e->getMessage());
            return false;
        }
    }

    // Supprimer un utilisateur
    public function delete(int $id) {
        try {
            // récupérer les infos utilisateur
            $stmt = $this->conn->prepare("SELECT email, prenom, nom FROM utilisateur WHERE id_utilisateur = ?");
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $user = $stmt->get_result()->fetch_assoc();
            $stmt->close();

            if (!$user) {
                return false; // Aucun utilisateur trouvé
            }

            // bloquer le compte
            $stmt = $this->conn->prepare("DELETE FROM utilisateur WHERE id_utilisateur = ?");
            $stmt->bind_param('i', $id);
            $res = $stmt->execute();
            $stmt->close();

            if ($res) {
            // Envoyer email de notification
            $this->sendUserEmail(
                $user['email'],
                $user['prenom'],
                $user['nom'],
                'Compte supprimé ❌',
                "Bonjour {$user['prenom']} {$user['nom']},<br><br>
                Votre compte a été définitivement <b>supprimé</b> de la plateforme <b>AlloCovoit</b>.<br>
                Nous vous remercions d’avoir utilisé notre service.<br><br>
                <i>L’équipe AlloCovoit</i>"
            );
            }

            return $res;
        } catch (Exception $e) {
            error_log("Erreur suppression utilisateur : " . $e->getMessage());
            return false;
        }
    }

    // Fermer la connexion
    public function close(): void {
        $this->db->close();
    }

     // Fonction d’envoi d’email
    private function sendUserEmail($to, $prenom, $nom, $subject, $body) {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = $_ENV['MAIL_HOST'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $_ENV['MAIL_USERNAME'];
            $mail->Password   = $_ENV['MAIL_PASSWORD'];
            $mail->SMTPSecure = ($_ENV['MAIL_ENCRYPTION'] === 'tls') ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port       = $_ENV['MAIL_PORT'];

            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';

            $mail->setFrom($_ENV['MAIL_FROM'], $_ENV['MAIL_FROM_NAME']);
            $mail->addAddress($to, "$prenom $nom");

            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $body;

            $mail->send();
        } catch (Exception $e) {
            error_log("Erreur d'envoi d'email à $to : {$mail->ErrorInfo}");
            echo json_encode(['error' => "Erreur email : {$mail->ErrorInfo}"]);
        }
    }
}
?>
