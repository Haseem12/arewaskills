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

// --- Blog Post Handlers ---

// Create a new blog post
if ($method === 'POST' && $action === 'create_post') {
    $data = jsonBody();
    if (empty($data) || !isset($data['title'])) error('Invalid post data.', 400);

    $conn->begin_transaction();
    try {
        $data['id'] = uniqid(rand(), true);
        $data['date'] = (new DateTime())->format('Y-m-d H:i:sP');
        $data['slug'] = generateSlug($data['title']);

        $required_fields = ['title', 'author', 'excerpt', 'content', 'image', 'ai_hint', 'tags'];
        foreach($required_fields as $field) {
            if (!isset($data[$field])) $data[$field] = '';
        }
        $post_data = [
            'id' => $data['id'], 'slug' => $data['slug'], 'title' => $data['title'],
            'excerpt' => $data['excerpt'], 'content' => $data['content'], 'author' => $data['author'],
            'date' => $data['date'], 'image' => $data['image'], 'ai_hint' => $data['ai_hint'],
            'tags' => $data['tags']
        ];
        
        $fields = array_keys($post_data);
        $placeholders = implode(',', array_fill(0, count($fields), '?'));
        $types = str_repeat('s', count($fields));
        $values = array_values($post_data);

        $stmt = $conn->prepare("INSERT INTO `posts` (`" . implode('`,`', $fields) . "`) VALUES ($placeholders)");
        if (!$stmt) throw new Exception("Server error: Failed to prepare post statement.");

        $stmt->bind_param($types, ...$values);
        if (!$stmt->execute()) throw new Exception("Could not save post.");

        // Initialize view count
        $view_stmt = $conn->prepare("INSERT INTO `post_views` (post_id, view_count) VALUES (?, 0)");
        if (!$view_stmt) throw new Exception("Failed to prepare view count statement.");
        $view_stmt->bind_param('s', $data['id']);
        if (!$view_stmt->execute()) throw new Exception("Failed to initialize view count.");
        
        $conn->commit();
        http_response_code(201);
        respond($data);
    } catch (Exception $e) {
        $conn->rollback();
        error($e->getMessage(), 500);
    }
}

// Get all blog posts with view counts
if ($method === 'GET' && $action === 'get_posts') {
    $sql = "SELECT p.*, COALESCE(pv.view_count, 0) as view_count 
            FROM `posts` p 
            LEFT JOIN `post_views` pv ON p.id = pv.post_id 
            ORDER BY p.date DESC";
    $result = $conn->query($sql);
    if (!$result) error("Server error: Could not fetch posts.", 500);
    $rows = [];
    while ($row = $result->fetch_assoc()) $rows[] = $row;
    respond($rows);
}

// Get a single blog post by its slug
if ($method === 'GET' && $action === 'get_post_by_slug') {
    $slug = $_GET['slug'] ?? '';
    if (empty($slug)) error('No slug provided.', 400);

    $sql = "SELECT p.*, COALESCE(pv.view_count, 0) as view_count 
            FROM `posts` p 
            LEFT JOIN `post_views` pv ON p.id = pv.post_id 
            WHERE p.slug = ? LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $slug);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($row = $res->fetch_assoc()) {
        respond($row);
    } else {
        error('Post not found.', 404);
    }
}

// Delete a post
if ($method === 'POST' && $action === 'delete_post') {
    $body = jsonBody();
    $id = $body['id'] ?? '';
    if (empty($id)) error('No post ID provided.', 400);

    $stmt = $conn->prepare("DELETE FROM `posts` WHERE id = ?");
    $stmt->bind_param('s', $id);
    if ($stmt->execute()) {
        respond(['id' => $id, 'deleted' => true]);
    } else {
        error("Server error: Could not delete post.", 500);
    }
}

// --- Comment Handlers ---

// Create a comment
if ($method === 'POST' && $action === 'create_comment') {
    $data = jsonBody();
    if (empty($data['post_id']) || empty($data['author_name']) || empty($data['comment'])) {
        error('Invalid comment data.', 400);
    }
    $data['id'] = uniqid(rand(), true);
    $data['submittedAt'] = (new DateTime())->format('Y-m-d H:i:s');
    
    $stmt = $conn->prepare("INSERT INTO `comments` (id, post_id, author_name, comment, submittedAt) VALUES (?, ?, ?, ?, ?)");
    if (!$stmt) error("Server error: Failed to prepare comment statement.", 500);
    $stmt->bind_param('sssss', $data['id'], $data['post_id'], $data['author_name'], $data['comment'], $data['submittedAt']);
    if ($stmt->execute()) {
        http_response_code(201);
        respond($data);
    } else {
        error("Server error: Could not save comment.", 500);
    }
}

// Get comments for a post
if ($method === 'GET' && $action === 'get_comments_for_post') {
    $post_id = $_GET['post_id'] ?? '';
    if (empty($post_id)) error('No post_id provided.', 400);

    $stmt = $conn->prepare("SELECT * FROM `comments` WHERE post_id = ? ORDER BY submittedAt DESC");
    $stmt->bind_param('s', $post_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $rows = [];
    while ($row = $result->fetch_assoc()) $rows[] = $row;
    respond($rows);
}

// --- View Count Handler ---

if ($method === 'POST' && $action === 'increment_view_count') {
    $body = jsonBody();
    $post_id = $body['post_id'] ?? '';
    if (empty($post_id)) error('No post_id provided.', 400);

    $sql = "INSERT INTO post_views (post_id, view_count) VALUES (?, 1) ON DUPLICATE KEY UPDATE view_count = view_count + 1";
    $stmt = $conn->prepare($sql);
    if (!$stmt) error("Server error: Failed to prepare view count statement.", 500);
    $stmt->bind_param('s', $post_id);
    if ($stmt->execute()) {
        respond(['post_id' => $post_id, 'incremented' => true]);
    } else {
        error("Server error: Could not increment view count.", 500);
    }
}

// --- Fallback for Not Found ---
error('Endpoint action not found or invalid request method.', 404);
?>
