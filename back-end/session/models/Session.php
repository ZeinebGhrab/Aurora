<?php

class Session {
    private $id;
    private $id_cours;
    private $titre;
    private $date_heure;
    private $duree;
    private $heure_fin;
    private $salle;
    private $description;
    private $statut;

    // Nouvelles propriétés pour le cours et enseignant
    private $nom_cours;
    private $code_cours;
    private $nom_enseignant;
    private $prenom_enseignant;

    public function __construct($data = []) {
        $this->fromArray($data);
    }

    public function fromArray($data) {
        $this->id          = $data['id_seance'] ?? null;
        $this->id_cours    = $data['id_cours'] ?? null;
        $this->titre       = $data['titre'] ?? '';
        $this->date_heure  = $data['date_heure'] ?? null;
        $this->duree       = $data['duree'] ?? 60;
        $this->heure_fin   = $data['heure_fin'] ?? null;
        $this->salle       = $data['salle'] ?? '';
        $this->description = $data['description'] ?? '';
        $this->statut      = $data['statut'] ?? 'planifiée';

        $this->nom_cours       = $data['nom_cours'] ?? null;
        $this->code_cours      = $data['code_cours'] ?? null;
        $this->nom_enseignant  = $data['nom_enseignant'] ?? null;
        $this->id_enseignant  = $data['id_enseignant'] ?? null;
        $this->prenom_enseignant = $data['prenom_enseignant'] ?? null;
        $this->nb_etudiants = $data['nb_etudiants'] ?? 0;
    }

    // GETTERS
    public function getId() { return $this->id; }
    public function getCoursId() { return $this->id_cours; }
    public function getTitre() { return $this->titre; }
    public function getDateHeure() { return $this->date_heure; }
    public function getDuree() { return $this->duree; }
    public function getHeureFin() { return $this->heure_fin; }
    public function getSalle() { return $this->salle; }
    public function getDescription() { return $this->description; }
    public function getStatut() { return $this->statut; }

    // Convertir en tableau pour JSON
    public function toArray() {
        return [
            'id_seance' => $this->id,
            'id_cours' => $this->id_cours,
            'titre' => $this->titre,
            'date_heure' => $this->date_heure,
            'duree' => $this->duree,
            'heure_fin' => $this->heure_fin,
            'salle' => $this->salle,
            'description' => $this->description,
            'statut' => $this->statut,
            'nom_cours' => $this->nom_cours,
            'code_cours' => $this->code_cours,
            'nom_enseignant' => $this->nom_enseignant,
            'prenom_enseignant' => $this->prenom_enseignant,
            'id_enseignant' => $this->id_enseignant,
            'nb_etudiants'=> $this->nb_etudiants,
        ];
    }
}


?>
