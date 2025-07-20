<?php
// /api/blog.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// --- Error Handling & Logging ---
ini_set('display_errors', 0); // Do not display errors to the client
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log'); // Log errors to a file
error_reporting(E_ALL);

// --- Database Configuration ---
// IMPORTANT: Replace with your actual database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'your_db_name');

// --- Helper Functions ---

/**
 * Sends a JSON success response.
 * @param mixed $data The data to send.
 * @param int $statusCode The HTTP status code.
 */
function send_success($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

/**
 * Sends a JSON error response.
 * @param string $message The error message.
 * @param int $statusCode The HTTP status code.
 */
function send_error($message, $statusCode = 400) {
    http_response_code($statusCode);
    // Log the error for debugging
    error_log("API Error: " . $message);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

/**
 * Creates a new PDO database connection.
 * @return PDO The PDO connection object.
 */
function db_connect() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        send_error("Database connection failed: " . $e->getMessage(), 500);
    }
}

/**
 * Reads and decodes the JSON request body.
 * @return array The decoded JSON data.
 */
function jsonBody() {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        send_error('Invalid JSON payload');
    }
    return $data;
}


// --- API Actions ---

/**
 * Creates a new blog post.
 * @param PDO $pdo The database connection.
 */
function create_post($pdo) {
    $body = jsonBody();
    $required_fields = ['title', 'author', 'excerpt', 'content', 'tags'];
    foreach ($required_fields as $field) {
        if (empty($body[$field])) {
            send_error("Missing required field: $field");
        }
    }

    $id = time() . rand(100, 999);
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $body['title']))) . '-' . $id;

    $sql = "INSERT INTO posts (id, slug, title, excerpt, content, author, date, image, ai_hint, tags) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $id,
            $slug,
            $body['title'],
            $body['excerpt'],
            $body['content'],
            $body['author'],
            $body['image'] ?? null,
            $body['ai_hint'] ?? null,
            $body['tags']
        ]);
        
        $body['id'] = $id;
        $body['slug'] = $slug;
        send_success($body, 201);
    } catch (PDOException $e) {
        send_error("Failed to create post: " . $e->getMessage(), 500);
    }
}

/**
 * Fetches all blog posts.
 * @param PDO $pdo The database connection.
 */
function get_posts($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM posts ORDER BY date DESC");
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convert tags string to array
        foreach ($posts as &$post) {
            $post['tags'] = array_map('trim', explode(',', $post['tags']));
        }

        send_success($posts);
    } catch (PDOException $e) {
        send_error("Failed to fetch posts: " . $e->getMessage(), 500);
    }
}

/**
 * Fetches a single post by its slug.
 * @param PDO $pdo The database connection.
 */
function get_post_by_slug($pdo) {
    $slug = $_GET['slug'] ?? '';
    if (empty($slug)) {
        send_error("Slug is required");
    }

    $sql = "SELECT * FROM posts WHERE slug = ?";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$slug]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($post) {
            // Convert tags string to array
            $post['tags'] = array_map('trim', explode(',', $post['tags']));
            send_success($post);
        } else {
            send_error("Post not found", 404);
        }
    } catch (PDOException $e) {
        send_error("Failed to fetch post: " . $e->getMessage(), 500);
    }
}

/**
 * Deletes a post.
 * @param PDO $pdo The database connection.
 */
function delete_post($pdo) {
    $body = jsonBody();
    $post_id = $body['post_id'] ?? '';
    if (empty($post_id)) {
        send_error("Post ID is required");
    }

    $sql = "DELETE FROM posts WHERE id = ?";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$post_id]);
        
        if ($stmt->rowCount() > 0) {
            send_success(['message' => 'Post deleted successfully']);
        } else {
            send_error("Post not found or already deleted", 404);
        }
    } catch (PDOException $e) {
        send_error("Failed to delete post: " . $e->getMessage(), 500);
    }
}

// --- Main Router ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit;
}

$action = $_GET['action'] ?? '';
$pdo = db_connect();

switch ($action) {
    case 'create_post':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            create_post($pdo);
        }
        break;
    case 'get_posts':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            get_posts($pdo);
        }
        break;
    case 'get_post_by_slug':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            get_post_by_slug($pdo);
        }
        break;
    case 'delete_post':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            delete_post($pdo);
        }
        break;
    default:
        send_error('Invalid action specified', 404);
        break;
}
?>
