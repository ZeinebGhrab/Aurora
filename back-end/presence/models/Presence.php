<?php
class Presence {
    private $id_presence;
    private $id_etudiant;
    private $id_seance;
    private $statut;
    private $heure_arrivee;
    private $justification;

    // Le constructeur accepte soit un tableau de données, soit des arguments séparés
    public function __construct($data) {
        $this->id_presence  = $data['id_presence']  ?? null;
        $this->id_etudiant  = $data['id_etudiant']  ?? null;
        $this->id_seance    = $data['id_seance']    ?? null;
        $this->statut       = $data['statut']       ?? null;
        $this->heure_arrivee= $data['heure_arrivee']?? null;
        $this->justification= $data['justification']?? null;
    }

    // Getters
    public function getId() { return $this->id_presence; }
    public function getIdEtudiant() { return $this->id_etudiant; }
    public function getIdSeance() { return $this->id_seance; }
    public function getStatut() { return $this->statut; }
    public function getHeureArrivee() { return $this->heure_arrivee; }
    public function getJustification() { return $this->justification; }

    // Setters
    public function setIdEtudiant($id_etudiant) { $this->id_etudiant = $id_etudiant; }
    public function setIdSeance($id_seance) { $this->id_seance = $id_seance; }
    public function setStatut($statut) { $this->statut = $statut; }
    public function setHeureArrivee($heure_arrivee) { $this->heure_arrivee = $heure_arrivee; }
    public function setJustification($justification) { $this->justification = $justification; }

    // Pour retourner un tableau facilement utilisable en JSON
    public function toArray() {
        return [
            'id_presence'   => $this->id_presence,
            'id_etudiant'   => $this->id_etudiant,
            'id_seance'     => $this->id_seance,
            'statut'        => $this->statut,
            'heure_arrivee' => $this->heure_arrivee,
            'justification' => $this->justification,
        ];
    }
}
?>
