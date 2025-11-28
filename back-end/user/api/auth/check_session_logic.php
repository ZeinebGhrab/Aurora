<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function requireLogin() {
    if (empty($_SESSION['connect']) || $_SESSION['connect'] !== true) {
        throw new Exception("Utilisateur non connecté");
    }
}

function requireAdmin() {
    requireLogin();
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        throw new Exception("Utilisateur non autorisé");
    }
}

function requireTeacher() {
    requireLogin();
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'enseignant') {
        throw new Exception("Utilisateur non autorisé");
    }
}

function requireStudent() {
    requireLogin();
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'etudiant') {
        throw new Exception("Utilisateur non autorisé");
    }
}

?>