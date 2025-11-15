<?php
class Presence {
    private $id;
    private $id_etudiant;
    private $id_cours;
    private $date_presence;
    private $statut;
    private $heure_arrivee;
    private $justification;

    public function __construct($id_etudiant, $id_cours, $date_presence, $statut = 'absent', $heure_arrivee = null, $justification = null, $id = null) {
        $this->id = $id;
        $this->id_etudiant = $id_etudiant;
        $this->id_cours = $id_cours;
        $this->date_presence = $date_presence;
        $this->statut = $statut;
        $this->heure_arrivee = $heure_arrivee;
        $this->justification = $justification;
    }

    // =======================
    // Getters
    // =======================

    public function getId() { return $this->id; }
    public function getIdEtudiant() { return $this->id_etudiant; }
    public function getIdCours() { return $this->id_cours; }
    public function getDatePresence() { return $this->date_presence; }
    public function getStatut() { return $this->statut; }
    public function getHeureArrivee() { return $this->heure_arrivee; }
    public function getJustification() { return $this->justification; }

    // =======================
    // Setters
    // =======================

    public function setIdEtudiant($id_etudiant) { $this->id_etudiant = $id_etudiant; }
    public function setIdCours($id_cours) { $this->id_cours = $id_cours; }
    public function setDatePresence($date_presence) { $this->date_presence = $date_presence; }
    public function setStatut($statut) { $this->statut = $statut; }
    public function setHeureArrivee($heure_arrivee) { $this->heure_arrivee = $heure_arrivee; }
    public function setJustification($justification) { $this->justification = $justification; }
}
?>
