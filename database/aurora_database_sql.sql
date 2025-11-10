-- ============================================
-- Base de données Aurora
-- ============================================

CREATE DATABASE IF NOT EXISTS aurora CHARACTER SET utf8mb4 COLLATE utf8_unicode_ci;
USE aurora;


-- Table utilisateur

CREATE TABLE utilisateur (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    type_compte ENUM('admin', 'enseignant', 'etudiant') DEFAULT 'etudiant',
    photo_profil VARCHAR(255) DEFAULT NULL,
    statut ENUM('activé', 'désactivé') DEFAULT 'activé',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Table etudiant

CREATE TABLE etudiant (
    id_etudiant INT PRIMARY KEY,
    niveau VARCHAR(50) NOT NULL,
    id_filiere INT,
    FOREIGN KEY (id_etudiant) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);


-- Table enseignant

CREATE TABLE enseignant (
    id_enseignant INT PRIMARY KEY,
    grade VARCHAR(50),
    specialite VARCHAR(100),
    FOREIGN KEY (id_enseignant) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

-- Table cours

CREATE TABLE cours (
    id_cours INT AUTO_INCREMENT PRIMARY KEY,
    nom_cours VARCHAR(100) NOT NULL,
    code_cours VARCHAR(20) UNIQUE NOT NULL,
    id_enseignant INT,
    id_filiere INT,
    niveau VARCHAR(50),
    FOREIGN KEY (id_enseignant) REFERENCES enseignant(id_enseignant) ON DELETE SET NULL,
    FOREIGN KEY (id_filiere) REFERENCES filiere(id_filiere) ON DELETE SET NULL
);

-- Table filiere 

CREATE TABLE filiere (
    id_filiere INT AUTO_INCREMENT PRIMARY KEY,
    code_filiere VARCHAR(10) UNIQUE NOT NULL,  -- Ex: IADS, SPBE...
    nom_complet VARCHAR(100) NOT NULL
);


-- ============================================
-- Données de test
-- ============================================

-- Filiéres de test

INSERT INTO filiere (code_filiere, nom_complet) VALUES
('IADS', 'IA & Sciences des Données Spatiales'),
('SPBE', 'Sciences Cosmiques & Planétaires'),
('ESA', 'Ingénierie Spatiale & Aéronautique'),
('EDTV', 'Énergie Durable & Technologies Vertes');


