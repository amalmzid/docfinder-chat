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
        getDoctorAvailability($conn, $doctor['id']);
        break;
        
    case 'POST':
    case 'PUT':
        updateDoctorAvailability($conn, $doctor['id']);
        break;
        
    default:
        sendError('Method not allowed', 405);
}

$db->closeConnection();

// Functions
function getDoctorAvailability($conn, $doctorId) {
    $sql = "SELECT availability FROM docteur WHERE id_docteur = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $doctorId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Doctor not found', 404);
    }
    
    $doctor = $result->fetch_assoc();
    $availabilityString = $doctor['availability'] ?: '';
    
    // Parse availability string (format: "Monday: 09:00-17:00, Tuesday: 09:00-17:00, ...")
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
    
    sendResponse($availability);
}

function updateDoctorAvailability($conn, $doctorId) {
    $data = getRequestBody();
    
    // Validate availability data
    if (!isset($data['availability']) || !is_array($data['availability'])) {
        sendError('Availability data is required and must be an array');
    }
    
    $availability = $data['availability'];
    
    // Validate each availability entry and convert to string format
    $availabilityParts = [];
    foreach ($availability as $entry) {
        if (!isset($entry['day_of_week']) || !isset($entry['start_time']) || !isset($entry['end_time'])) {
            sendError('Each availability entry must have day_of_week, start_time, and end_time');
        }
        
        // Validate day of week
        $validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        if (!in_array($entry['day_of_week'], $validDays)) {
            sendError('Invalid day of week: ' . $entry['day_of_week']);
        }
        
        // Validate time format
        if (!strtotime($entry['start_time']) || !strtotime($entry['end_time'])) {
            sendError('Invalid time format for day: ' . $entry['day_of_week']);
        }
        
        // Convert to string format: "Monday: 09:00-17:00"
        $availabilityParts[] = $entry['day_of_week'] . ': ' . $entry['start_time'] . '-' . $entry['end_time'];
    }
    
    // Join all parts with comma separator
    $availabilityString = implode(', ', $availabilityParts);
    
    $sql = "UPDATE docteur SET availability = ? WHERE id_docteur = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $availabilityString, $doctorId);
    
    if ($stmt->execute()) {
        sendResponse($availability);
    } else {
        sendError('Failed to update availability');
    }
}
?>
