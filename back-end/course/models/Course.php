<?php
class Course {
    private $id;
    private $nom;
    private $code;
    private $id_enseignant;
    private $id_filiere;
    private $niveau;

    public function __construct($nom, $code, $id_enseignant, $id_filiere, $niveau, $id = null) {
        $this->id = $id;
        $this->nom = $nom;
        $this->code = $code;
        $this->id_enseignant = $id_enseignant;
        $this->id_filiere = $id_filiere;
        $this->niveau = $niveau;
    }
    
    // Getters
    public function getId() { return $this->id; }
    public function getNom() { return $this->nom; }
    public function getCode() { return $this->code; }
    public function getIdEnseignant() { return $this->id_enseignant; }
    public function getIdFiliere() { return $this->id_filiere; }
    public function getNiveau() { return $this->niveau; }

    // Setters
    public function setNom($nom) { $this->nom = $nom; }
    public function setCode($code) { $this->code = $code; }
    public function setIdEnseignant($id_enseignant) { $this->id_enseignant = $id_enseignant; }
    public function setIdFiliere($id_filiere) { $this->id_filiere = $id_filiere; }
    public function setNiveau($niveau) { $this->niveau = $niveau; }
}
?>
