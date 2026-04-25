<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = new Database();
$conn = $db->getConnection();

// Get authenticated doctor
$doctor = requireRole('doctor');

switch ($method) {
    case 'GET':
        getDoctorProfile($conn, $doctor['id']);
        break;
        
    case 'PUT':
        updateDoctorProfile($conn, $doctor['id']);
        break;
        
    case 'POST':
        // For changing password
        if (isset($_GET['action']) && $_GET['action'] === 'change-password') {
            changePassword($conn, $doctor['id']);
        } else {
            sendError('Invalid action', 400);
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
}

$db->closeConnection();

// Functions
function getDoctorProfile($conn, $doctorId) {
    $sql = "SELECT d.*, 
                   COUNT(DISTINCT c.id) as total_consultations,
                   COUNT(DISTINCT CASE WHEN c.statut = 'completed' THEN c.id END) as completed_consultations,
                   COUNT(DISTINCT CASE WHEN c.statut = 'scheduled' THEN c.id END) as scheduled_consultations,
                   COUNT(DISTINCT ca.id_cabinet) as total_cabinets
            FROM docteur d
            LEFT JOIN consultations c ON d.id_docteur = c.id_docteur
            LEFT JOIN cabinets ca ON d.id_docteur = ca.id_docteur
            WHERE d.id_docteur = ?
            GROUP BY d.id_docteur";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $doctorId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Doctor not found', 404);
    }
    
    $doctor = $result->fetch_assoc();
    
    // Remove password from response
    unset($doctor['mot_de_passe']);
    
    // Get doctor's cabinets
    $stmt = $conn->prepare("SELECT * FROM cabinets WHERE id_docteur = ?");
    $stmt->bind_param("i", $doctorId);
    $stmt->execute();
    $cabinetsResult = $stmt->get_result();
    
    $cabinets = [];
    while ($row = $cabinetsResult->fetch_assoc()) {
        $cabinets[] = $row;
    }
    
    // Get doctor's availability from string
    $availabilityString = $doctor['availability'] ?: '';
    $availability = [];
    if (!empty($availabilityString)) {
        $days = explode(', ', $availabilityString);
        foreach ($days as $day) {
            if (strpos($day, ':') !== false) {
                $parts = explode(':', $day, 2);
                $dayName = trim($parts[0]);
                $timeRange = trim($parts[1]);
                
                if (strpos($timeRange, '-') !== false) {
                    $times = explode('-', $timeRange);
                    $availability[] = [
                        'day_of_week' => $dayName,
                        'start_time' => trim($times[0]),
                        'end_time' => trim($times[1]),
                        'is_available' => true,
                        'max_patients' => 10,
                        'notes' => ''
                    ];
                }
            }
        }
    }
    
    // Get recent consultations
    $stmt = $conn->prepare("SELECT c.*, u.nom as patient_name, u.email as patient_email
                            FROM consultations c
                            LEFT JOIN users u ON c.id_patient = u.id
                            WHERE c.id_docteur = ?
                            ORDER BY c.date_consultation DESC
                            LIMIT 5");
    $stmt->bind_param("i", $doctorId);
    $stmt->execute();
    $recentResult = $stmt->get_result();
    
    $recentConsultations = [];
    while ($row = $recentResult->fetch_assoc()) {
        $recentConsultations[] = $row;
    }
    
    sendResponse([
        'profile' => $doctor,
        'cabinets' => $cabinets,
        'availability' => $availability,
        'recent_consultations' => $recentConsultations
    ]);
}

function updateDoctorProfile($conn, $doctorId) {
    $data = getRequestBody();
    
    $updates = [];
    $types = '';
    $params = [];
    
    if (isset($data['nom'])) {
        if (empty(trim($data['nom']))) {
            sendError('Name cannot be empty');
        }
        $updates[] = "nom = ?";
        $types .= 's';
        $params[] = $data['nom'];
    }
    
    if (isset($data['email'])) {
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            sendError('Invalid email format');
        }
        
        // Check if email is already taken by another doctor
        $stmt = $conn->prepare("SELECT id_docteur FROM docteur WHERE email = ? AND id_docteur != ?");
        $stmt->bind_param("si", $data['email'], $doctorId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            sendError('Email already exists', 409);
        }
        
        $updates[] = "email = ?";
        $types .= 's';
        $params[] = $data['email'];
    }
    
    if (isset($data['specialite'])) {
        if (empty(trim($data['specialite']))) {
            sendError('Specialty cannot be empty');
        }
        $updates[] = "specialite = ?";
        $types .= 's';
        $params[] = $data['specialite'];
    }
    
    if (isset($data['telephone'])) {
        $updates[] = "telephone = ?";
        $types .= 's';
        $params[] = $data['telephone'];
    }
    
    if (isset($data['adresse'])) {
        $updates[] = "adresse = ?";
        $types .= 's';
        $params[] = $data['adresse'];
    }
    
    if (isset($data['biographie'])) {
        $updates[] = "biographie = ?";
        $types .= 's';
        $params[] = $data['biographie'];
    }
    
    if (empty($updates)) {
        sendError('No fields to update');
    }
    
    $params[] = $doctorId;
    $types .= 'i';
    
    $sql = "UPDATE docteur SET " . implode(', ', $updates) . " WHERE id_docteur = ?";
    $stmt = $conn->prepare($sql);
    
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        // Get updated profile
        $stmt = $conn->prepare("SELECT * FROM docteur WHERE id_docteur = ?");
        $stmt->bind_param("i", $doctorId);
        $stmt->execute();
        $result = $stmt->get_result();
        $doctor = $result->fetch_assoc();
        
        // Remove password from response
        unset($doctor['mot_de_passe']);
        
        sendResponse($doctor);
    } else {
        sendError('Failed to update profile');
    }
}

function changePassword($conn, $doctorId) {
    $data = getRequestBody();
    
    $required = ['current_password', 'new_password', 'confirm_password'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendError("Field '$field' is required");
        }
    }
    
    $currentPassword = $data['current_password'];
    $newPassword = $data['new_password'];
    $confirmPassword = $data['confirm_password'];
    
    // Validate new password
    if ($newPassword !== $confirmPassword) {
        sendError('New password and confirmation do not match');
    }
    
    if (strlen($newPassword) < 8) {
        sendError('New password must be at least 8 characters long');
    }
    
    // Get current password from database
    $stmt = $conn->prepare("SELECT mot_de_passe FROM docteur WHERE id_docteur = ?");
    $stmt->bind_param("i", $doctorId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Doctor not found', 404);
    }
    
    $doctor = $result->fetch_assoc();
    
    // Verify current password (assuming plain text for now, should use password_hash in production)
    if ($doctor['mot_de_passe'] !== $currentPassword) {
        sendError('Current password is incorrect');
    }
    
    // Update password
    $stmt = $conn->prepare("UPDATE docteur SET mot_de_passe = ? WHERE id_docteur = ?");
    $stmt->bind_param("si", $newPassword, $doctorId);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Password changed successfully']);
    } else {
        sendError('Failed to change password');
    }
}
?>
