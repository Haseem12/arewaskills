<?php
// Enable error logging for debugging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');
error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED);

// --- Headers ---
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle pre-flight OPTIONS requests from browsers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- Database Configuration ---
$host = "localhost";
$dbname = "sajfood1_busa-app";
$username = "sajfood1_busa";
$password = "Haseem1234@";

// Establish database connection
try {
    $conn = new mysqli($host, $username, $password, $dbname);
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
} catch (Exception $e) {
    error_log($e->getMessage());
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

function generateSlug($title) {
    $slug = strtolower($title);
    $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug); // Remove special chars
    $slug = preg_replace('/[\s-]+/', '-', $slug);      // Replace spaces and hyphens with a single hyphen
    $slug = trim($slug, '-');                         // Trim hyphens from start/end
    return $slug;
}


// --- API Routing using GET action parameter ---
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// --- Endpoint Handlers ---

// Handle creation of registrations and showcases
if ($method === 'POST' && $action === 'create') {
    $data = jsonBody();
    if (empty($data) || !isset($data['type'])) error('Invalid or empty request body.', 400);

    $table = ($data['type'] === 'registration') ? 'registrations' : 'showcases';
    if ($table === 'showcases' && $data['type'] !== 'showcase') error('Invalid type for showcases table', 400);

    // Add server-generated fields
    $data['id'] = uniqid(rand(), true);
    $data['submittedAt'] = (new DateTime())->format('Y-m-d H:i:sP');

    $fields = array_keys($data);
    $placeholders = implode(',', array_fill(0, count($fields), '?'));
    $types = str_repeat('s', count($fields));
    $values = array_values($data);

    $stmt = $conn->prepare("INSERT INTO `$table` (`" . implode('`,`', $fields) . "`) VALUES ($placeholders)");
    if (!$stmt) error("Server error: Failed to prepare statement. Check table/field names.", 500);

    $stmt->bind_param($types, ...$values);

    if ($stmt->execute()) {
        http_response_code(201); // Created
        respond($data); // Return the full object with the new ID
    } else {
        error("Server error: Could not save submission.", 500);
    }
}

// Handle fetching all records
if ($method === 'GET' && $action === 'get_all') {
    $type = $_GET['type'] ?? '';
    if (!in_array($type, ['registrations', 'showcases'])) error('Invalid type specified.', 400);
    
    $result = $conn->query("SELECT * FROM `$type` ORDER BY submittedAt DESC");
    if (!$result) error("Server error: Could not fetch data from $type.", 500);

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    respond($rows);
}

// Find a single submission by its ID
if ($method === 'GET' && $action === 'find_by_id') {
    $id = $_GET['id'] ?? '';
    if (empty($id)) error('No ID provided.', 400);

    foreach (['registrations', 'showcases', 'posts'] as $table) {
        $stmt = $conn->prepare("SELECT * FROM `$table` WHERE id = ?");
        $stmt->bind_param('s', $id);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($row = $res->fetch_assoc()) {
            respond($row);
        }
    }
    error('Submission not found.', 404);
}

// Find a single submission by email
if ($method === 'GET' && $action === 'find_by_email') {
    $email = strtolower(trim($_GET['email'] ?? ''));
    if (empty($email)) error('No email provided.', 400);

    foreach (['registrations' => 'email', 'showcases' => 'presenterEmail'] as $table => $field) {
        $stmt = $conn->prepare("SELECT * FROM `$table` WHERE LOWER(`$field`) = ? ORDER BY submittedAt DESC LIMIT 1");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($row = $res->fetch_assoc()) {
            respond($row);
        }
    }
    error('Submission not found with that email.', 404);
}

// Update submission status and details
if ($method === 'POST' && $action === 'update_status') {
    $body = jsonBody();
    $id = $body['id'] ?? '';
    $updates = $body['updates'] ?? [];

    if (empty($id) || empty($updates)) error('Invalid ID or update data provided.', 400);

    foreach (['registrations', 'showcases'] as $table) {
        $check_stmt = $conn->prepare("SELECT id FROM `$table` WHERE id = ?");
        $check_stmt->bind_param('s', $id);
        $check_stmt->execute();
        if ($check_stmt->get_result()->num_rows > 0) {
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

// Mark multiple submissions as pending payment
if ($method === 'POST' && $action === 'mark_pending') {
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

// --- Blog Post Handlers ---

// Create a new blog post
if ($method === 'POST' && $action === 'create_post') {
    $data = jsonBody();
    if (empty($data) || !isset($data['title'])) error('Invalid post data.', 400);

    // Add server-generated fields
    $data['id'] = uniqid(rand(), true);
    $data['date'] = (new DateTime())->format('Y-m-d H:i:sP');
    $data['slug'] = generateSlug($data['title']);

    // Ensure all required fields for the 'posts' table are present, even if empty
    $required_fields = ['title', 'author', 'excerpt', 'content', 'image', 'ai_hint', 'tags'];
    foreach($required_fields as $field) {
        if (!isset($data[$field])) {
            $data[$field] = ''; // Set a default empty value
        }
    }

    $fields = array_keys($data);
    $placeholders = implode(',', array_fill(0, count($fields), '?'));
    $types = str_repeat('s', count($fields));
    $values = array_values($data);

    $stmt = $conn->prepare("INSERT INTO `posts` (`" . implode('`,`', $fields) . "`) VALUES ($placeholders)");
    if (!$stmt) error("Server error: Failed to prepare post statement.", 500);

    $stmt->bind_param($types, ...$values);

    if ($stmt->execute()) {
        http_response_code(201);
        respond($data);
    } else {
        error("Server error: Could not save post.", 500);
    }
}

// Get all blog posts
if ($method === 'GET' && $action === 'get_posts') {
    $result = $conn->query("SELECT * FROM `posts` ORDER BY date DESC");
    if (!$result) error("Server error: Could not fetch posts.", 500);

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    respond($rows);
}

// Get a single blog post by its slug
if ($method === 'GET' && $action === 'get_post_by_slug') {
    $slug = $_GET['slug'] ?? '';
    if (empty($slug)) error('No slug provided.', 400);

    $stmt = $conn->prepare("SELECT * FROM `posts` WHERE slug = ? LIMIT 1");
    $stmt->bind_param('s', $slug);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($row = $res->fetch_assoc()) {
        respond($row);
    } else {
        error('Post not found.', 404);
    }
}


// --- Fallback for Not Found ---
error('Endpoint action not found or invalid request method.', 404);
?>
