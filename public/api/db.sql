-- Instructions:
-- Va dans ton LWS cPanel -> phpMyAdmin
-- Clique sur ta base de données, va dans l'onglet "Importer" et importe ce fichier, ou copie-colle ce code dans l'onglet "SQL".

CREATE TABLE IF NOT EXISTS `store_settings` (
  `id` varchar(255) NOT NULL,
  `pixels` json DEFAULT NULL,
  `seo` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertion de la ligne par défaut
INSERT INTO `store_settings` (`id`, `pixels`, `seo`) VALUES
('default_store', '{}', '{}')
ON DUPLICATE KEY UPDATE `id`=`id`;
