<?php
require_once 'backend/config/database.php';

$database = new Database();
$conn = $database->getConnection();

// Check if patient table exists
$table_check = $conn->query("SHOW TABLES LIKE 'patient'");
if ($table_check->num_rows == 0) {
    echo "Patient table does not exist. Creating it...\n";
    
    // Create patient table
    $create_table = "CREATE TABLE IF NOT EXISTS patient (
        id_patient INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        mot_de_passe VARCHAR(255) NOT NULL,
        telephone VARCHAR(20),
        adresse TEXT,
        date_naissance DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if ($conn->query($create_table)) {
        echo "Patient table created successfully.\n";
    } else {
        echo "Error creating patient table: " . $conn->error . "\n";
    }
}

// Check for existing patients
$result = $conn->query("SELECT COUNT(*) as count FROM patient");
$row = $result->fetch_assoc();
$patient_count = $row['count'];

echo "Number of patients in database: " . $patient_count . "\n";

if ($patient_count == 0) {
    echo "No patients found. Creating a test patient account...\n";
    
    // Create test patient
    $hashed_password = password_hash('patient123', PASSWORD_DEFAULT);
    $insert = "INSERT INTO patient (nom, email, mot_de_passe, telephone) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($insert);
    $test_name = "Test Patient";
    $test_email = "patient@test.com";
    $test_phone = "1234567890";
    
    $stmt->bind_param("ssss", $test_name, $test_email, $hashed_password, $test_phone);
    
    if ($stmt->execute()) {
        echo "Test patient created successfully.\n";
        echo "Email: patient@test.com\n";
        echo "Password: patient123\n";
    } else {
        echo "Error creating test patient: " . $stmt->error . "\n";
    }
} else {
    // Show existing patients
    $result = $conn->query("SELECT id_patient, nom, email FROM patient LIMIT 5");
    echo "Existing patients:\n";
    while ($row = $result->fetch_assoc()) {
        echo "ID: " . $row['id_patient'] . ", Name: " . $row['nom'] . ", Email: " . $row['email'] . "\n";
    }
}

$conn->close();
?>
