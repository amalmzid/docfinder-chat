-- Medicines table for pharmacy inventory management
CREATE TABLE IF NOT EXISTS medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pharmacie INT NOT NULL,
    nom VARCHAR(255) NOT NULL,
    categorie VARCHAR(100) NOT NULL,
    prix DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    description TEXT,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    statut ENUM('actif', 'inactif') DEFAULT 'actif',
    FOREIGN KEY (id_pharmacie) REFERENCES pharmacie(id_pharmacie) ON DELETE CASCADE,
    INDEX idx_pharmacie (id_pharmacie),
    INDEX idx_nom (nom),
    INDEX idx_categorie (categorie),
    INDEX idx_stock (stock)
);

-- Add email and password columns to pharmacie table if they don't exist
ALTER TABLE pharmacie 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE AFTER horaireOuverture,
ADD COLUMN IF NOT EXISTS mot_de_passe VARCHAR(255) AFTER email;

-- Insert sample medicines for demonstration
INSERT IGNORE INTO medicines (id_pharmacie, nom, categorie, prix, stock, description) VALUES
(1, 'Amoxicillin 500mg', 'Antibiotics', 12.99, 150, 'Broad-spectrum antibiotic for bacterial infections'),
(1, 'Ibuprofen 400mg', 'Pain Relief', 8.49, 300, 'Anti-inflammatory for pain and fever'),
(1, 'Metformin 850mg', 'Diabetes', 15.99, 80, 'Oral medication for type 2 diabetes'),
(1, 'Lisinopril 10mg', 'Cardiovascular', 11.49, 0, 'ACE inhibitor for blood pressure management'),
(1, 'Omeprazole 20mg', 'Gastrointestinal', 9.99, 200, 'Proton pump inhibitor for acid reflux'),
(1, 'Cetirizine 10mg', 'Allergy', 6.99, 450, 'Antihistamine for allergy symptoms');
