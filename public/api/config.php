<?php
// config.php - Fichier de configuration de la base de données LWS
$host = 'localhost'; // À remplacer par l'hôte MySQL fourni par LWS
$dbname = 'technova_db'; // Nom de la base de données
$username = 'root'; // Nom d'utilisateur
$password = ''; // Mot de passe

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(["error" => "Erreur de connexion à la base de données LWS : " . $e->getMessage()]));
}
?>
