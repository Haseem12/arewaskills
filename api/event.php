<?php
// Enable error logging for debugging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');
error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED);

// --- Headers ---
// Allows requests from any origin. For production, you might want to restrict this to your frontend's domain.
header("Access-Control-Allow-Origin: *"); 
// Specifies the allowed HTTP methods for CORS.
header("Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS");
// Specifies the allowed headers for CORS.
header("Access-Control-Allow-Headers: Content-Type");
// Sets the response content type to JSON.
header("Content-Type: application/json");

// Handle pre-flight OPTIONS requests from browsers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- Database Configuration ---
// !!! IMPORTANT: Replace with your actual database credentials.
$host = "localhost";
$dbname = "sajfood1_busa-app";
$username = "sajfood1_busa";
$password = "Haseem1234@";

// Establish database connection
$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    http_response_code(503); // Service Unavailable
    echo json_encode(["success" => false, "error" => "Database service is currently unavailable. Please try again later."]);
    exit;
}

// --- Helper Functions ---
function respond($data) {
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

function error($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

function jsonBody() {
    $input = file_get_contents('php://input');
    if (empty($input)) {
        return [];
    }
    return json_decode($input, true);
}


// --- API Routing ---
// Get the path from the request URI, e.g., "/submissions/123"
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '/';
$uri_parts = explode('/', trim($path_info, '/'));
$endpoint = $uri_parts[0] ?? null;
$method = $_SERVER['REQUEST_METHOD'];


// --- Endpoint Handlers ---

// POST /registrations or POST /showcases
if ($method === 'POST' && in_array($endpoint, ['registrations', 'showcases'])) {
    $table = $endpoint;
    $data = jsonBody();
    if (empty($data)) error('Invalid or empty request body.', 400);

    // Add server-generated fields
    $data['id'] = uniqid(rand(), true);
    $data['submittedAt'] = (new DateTime())->format('Y-m-d H:i:sP');
    $data['type'] = ($table === 'registrations') ? 'registration' : 'showcase';

    $fields = array_keys($data);
    $placeholders = implode(',', array_fill(0, count($fields), '?'));
    $types = str_repeat('s', count($fields));
    $values = array_values($data);

    $stmt = $conn->prepare("INSERT INTO `$table` (`" . implode('`,`', $fields) . "`) VALUES ($placeholders)");
    if (!$stmt) error("Server error: Failed to prepare statement.", 500);

    $stmt->bind_param($types, ...$values);

    if ($stmt->execute()) {
        http_response_code(201); // Created
        respond($data); // Return the full object with the new ID
    } else {
        error("Server error: Could not save submission.", 500);
    }
}

// GET /registrations or GET /showcases
if ($method === 'GET' && in_array($endpoint, ['registrations', 'showcases'])) {
    $table = $endpoint;
    $result = $conn->query("SELECT * FROM `$table` ORDER BY submittedAt DESC");
    if (!$result) error("Server error: Could not fetch data.", 500);

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    respond($rows);
}

// Handles GET /submissions/{id} and PATCH /submissions/{id}
if ($endpoint === 'submissions' && isset($uri_parts[1])) {
    $id = $uri_parts[1];

    if ($method === 'GET') {
        foreach (['registrations', 'showcases'] as $table) {
            $stmt = $conn->prepare("SELECT * FROM `$table` WHERE id = ?");
            if (!$stmt) continue;
            $stmt->bind_param('s', $id);
            $stmt->execute();
            $res = $stmt->get_result();
            if ($row = $res->fetch_assoc()) {
                respond($row);
            }
        }
        error('Submission not found.', 404);
    }

    if ($method === 'PATCH') {
        $updates = jsonBody();
        if (empty($updates)) error('Invalid or empty request body.', 400);

        foreach (['registrations', 'showcases'] as $table) {
            // First, check if the ID exists in this table
            $check_stmt = $conn->prepare("SELECT id FROM `$table` WHERE id = ?");
            $check_stmt->bind_param('s', $id);
            $check_stmt->execute();
            if ($check_stmt->get_result()->num_rows > 0) {
                // ID exists, proceed with update
                $set_clause = implode(', ', array_map(fn($k) => "`$k` = ?", array_keys($updates)));
                $types = str_repeat('s', count($updates)) . 's'; // Types for values + id
                $values = array_values($updates);
                $values[] = $id;

                $update_stmt = $conn->prepare("UPDATE `$table` SET $set_clause WHERE id = ?");
                if (!$update_stmt) error("Server error: Failed to prepare update.", 500);
                
                $update_stmt->bind_param($types, ...$values);

                if ($update_stmt->execute()) {
                    respond(['id' => $id, 'updatedFields' => array_keys($updates)]);
                } else {
                    error("Server error: Could not update submission.", 500);
                }
            }
        }
        error('Submission not found to update.', 404);
    }
}

// GET /submissions/find?email={email}
if ($method === 'GET' && $endpoint === 'submissions' && isset($uri_parts[1]) && $uri_parts[1] === 'find' && isset($_GET['email'])) {
    $email = strtolower(trim($_GET['email']));
    foreach (['registrations' => 'email', 'showcases' => 'presenterEmail'] as $table => $field) {
        $stmt = $conn->prepare("SELECT * FROM `$table` WHERE LOWER(`$field`) = ? LIMIT 1");
        if (!$stmt) continue;
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($row = $res->fetch_assoc()) {
            respond($row);
        }
    }
    error('Submission not found with that email.', 404);
}

// POST /submissions/mark-pending
if ($method === 'POST' && $endpoint === 'submissions' && isset($uri_parts[1]) && $uri_parts[1] === 'mark-pending') {
    $body = jsonBody();
    if (!isset($body['ids']) || !is_array($body['ids']) || empty($body['ids'])) {
        error('Invalid or empty "ids" array provided.', 400);
    }

    $ids = $body['ids'];
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $types = str_repeat('s', count($ids));
    $updated_count = 0;

    foreach (['registrations', 'showcases'] as $table) {
        $stmt = $conn->prepare("UPDATE `$table` SET `status` = 'payment_pending' WHERE id IN ($placeholders)");
        if (!$stmt) error("Server error: Failed to prepare statement for $table.", 500);
        
        $stmt->bind_param($types, ...$ids);
        if ($stmt->execute()) {
            $updated_count += $stmt->affected_rows;
        } else {
             error("Server error: Failed to update $table.", 500);
        }
    }
    respond(['updatedCount' => $updated_count, 'requestedIds' => $ids]);
}


// --- Fallback for Not Found ---
error('Endpoint not found.', 404);
?>
