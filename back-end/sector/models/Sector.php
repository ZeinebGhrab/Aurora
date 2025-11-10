<?php
class Sector {
    private $id;
    private $code;
    private $name;

    public function __construct($data = []) {
        $this->id = $data['id_filiere'] ?? null;
        $this->code = $data['code_filiere'] ?? '';
        $this->name = $data['nom_complet'] ?? '';
    }

    // Getters
    public function getId() { return $this->id; }
    public function getCode() { return $this->code; }
    public function getName() { return $this->name; }

    // Fill from array
    public function fromArray($data) {
        $this->id = $data['id_filiere'] ?? null;
        $this->code = $data['code_filiere'] ?? '';
        $this->name = $data['nom_complet'] ?? '';
    }
}
?>
