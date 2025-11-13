<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../vendor/autoload.php'; // Composer autoload

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

class MailService {
    private $mail;

    public function __construct() {
        $this->mail = new PHPMailer(true);

        // Configuration SMTP globale
        $this->mail->isSMTP();
        $this->mail->Host       = $_ENV['MAIL_HOST'];
        $this->mail->SMTPAuth   = true;
        $this->mail->Username   = $_ENV['MAIL_USERNAME'];
        $this->mail->Password   = $_ENV['MAIL_PASSWORD'];
        $this->mail->SMTPSecure = ($_ENV['MAIL_ENCRYPTION'] === 'tls') 
                                    ? PHPMailer::ENCRYPTION_STARTTLS 
                                    : PHPMailer::ENCRYPTION_SMTPS;
        $this->mail->Port       = $_ENV['MAIL_PORT'];

        $this->mail->CharSet = 'UTF-8';
        $this->mail->Encoding = 'base64';
        $this->mail->setFrom($_ENV['MAIL_FROM'], $_ENV['MAIL_FROM_NAME']);
    }

    public function sendEmail($to, $prenom, $nom, $subject, $body) {
        try {
            $this->mail->clearAddresses(); // Toujours nettoyer les destinataires précédents
            $this->mail->addAddress($to, "$prenom $nom");

            $this->mail->isHTML(true);
            $this->mail->Subject = $subject;
            $this->mail->Body    = $body;

            $this->mail->send();
        } catch (Exception $e) {
            error_log("Erreur d'envoi d'email à $to : {$this->mail->ErrorInfo}");
        }
    }
}
?>
