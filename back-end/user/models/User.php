<?php
require_once __DIR__ . '/../../config/Database.php';

class User {
    private $db; // instance de Database

    // Attributs utilisateur
    private $id;
    private $nom;
    private $prenom;
    private $email;
    private $role;
    private $photo_profil;
    private $statut;
    private $type_compte;

    public function __construct($database) {
        $this->db = $database;
    }

    public function login($email, $mot_de_passe) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("SELECT * FROM utilisateur WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();

        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if ($user && password_verify($mot_de_passe, $user['mot_de_passe'])) {
            session_start();
            $_SESSION['connecte'] = true;
            $_SESSION['user_id'] = $user['id_utilisateur'];
            $_SESSION['nom'] = $user['nom'];
            $_SESSION['prenom'] = $user['prenom'];
            $_SESSION['role'] = $user['type_compte'];
            $_SESSION['photo_profil'] = $user['photo_profil'];
            $_SESSION['statut'] = $user['statut'];
            

            // Remplir les attributs de l'objet
            $this->id = $user['id_utilisateur'];
            $this->nom = $user['nom'];
            $this->prenom = $user['prenom'];
            $this->email = $user['email'];
            $this->role = $_SESSION['role'];
            $this->photo_profil = $_SESSION['photo_profil'];
            $this->statut = $_SESSION['statut'];

           return true;
        } 
         return false;
    }

    // Getters
    public function getId() {
        return $this->id;
    }

    public function getNom() {
        return $this->nom;
    }

    public function getPrenom() {
        return $this->prenom;
    }

    public function getEmail() {
        return $this->email;
    }

    public function getRole() {
        return $this->role;
    }

     public function getPhoto() {
        return $this->photo_profil;
    }
}
?>

