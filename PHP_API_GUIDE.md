# PHP API Implementation Guide

This guide outlines the requirements and provides complete examples for the two PHP backend API files that the Northern Tech Exchange Next.js application will communicate with.

## How to Use

1.  **Create PHP Files**: Create two files on your server:
    *   `api/event/event.php` for handling registrations and showcases.
    *   `api/event/blog.php` for handling blog posts.
2.  **Copy the Code**: Copy the corresponding scripts from the sections below into each file.
3.  **Update Database Credentials**: In both PHP files, update your database credentials (`$host`, `$dbname`, `$username`, `$password`).
4.  **Set Up Database Tables**: Use the SQL schemas provided below to create the necessary tables in your database.
5.  **Verify Endpoints**: Ensure your Next.js application is configured to point to the correct URLs:
    *   Events/Registrations: `https://www.sajfoods.net/api/event/event.php`
    *   Blog: `https://www.sajfoods.net/api/event/blog.php`

## General Requirements

*   **Content-Type**: All API responses must be JSON (`Content-Type: application/json`).
*   **CORS**: Cross-Origin Resource Sharing (CORS) must be enabled. The provided scripts allow access from all origins (`*`).
*   **HTTP Status Codes**: The scripts use appropriate HTTP status codes (e.g., `200 OK`, `201 Created`, `404 Not Found`).
*   **Response Format**:
    *   **Success**: `{ "success": true, "data": [...] }` or `{ "success": true, "data": {...} }`
    *   **Error**: `{ "success": false, "error": "Error message here" }`

---

## Database Schema

You will need five tables in your MySQL database: `registrations`, `showcases`, `posts`, `comments`, and `post_views`.

### `registrations` table

```sql
CREATE TABLE `registrations` (
  `id` varchar(255) NOT NULL,
  `submittedAt` datetime NOT NULL,
  `type` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `company_organization` varchar(255) NOT NULL,
  `job_title` varchar(255) NOT NULL,
  `years_of_experience` int(11) NOT NULL,
  `what_do_you_hope_to_learn_` text NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `paymentMethod` varchar(50) DEFAULT NULL,
  `receiptNumber` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### `showcases` table

```sql
CREATE TABLE `showcases` (
  `id` varchar(255) NOT NULL,
  `submittedAt` datetime NOT NULL,
  `type` varchar(50) NOT NULL,
  `projectName` varchar(255) NOT NULL,
  `tagline` varchar(255) NOT NULL,
  `projectUrl` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `technologies` varchar(255) NOT NULL,
  `presenterName` varchar(255) NOT NULL,
  `presenterEmail` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `paymentMethod` varchar(50) DEFAULT NULL,
  `receiptNumber` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### `posts` table

This table is managed by `blog.php`.

```sql
CREATE TABLE `posts` (
  `id` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `excerpt` text NOT NULL,
  `content` longtext NOT NULL,
  `author` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `ai_hint` varchar(255) DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### `comments` table

This table stores comments for blog posts.

```sql
CREATE TABLE `comments` (
    `id` VARCHAR(255) NOT NULL,
    `post_id` VARCHAR(255) NOT NULL,
    `author_name` VARCHAR(255) NOT NULL,
    `comment` TEXT NOT NULL,
    `submittedAt` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### `post_views` table

This table tracks the view count for each blog post.

```sql
CREATE TABLE `post_views` (
    `post_id` VARCHAR(255) NOT NULL,
    `view_count` INT(11) NOT NULL DEFAULT 0,
    PRIMARY KEY (`post_id`),
    FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## Complete Scripts

### `event.php` (For Registrations & Showcases)

This script handles creating, fetching, and updating event-related submissions.

```php
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

    foreach (['registrations', 'showcases'] as $table) {
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

// --- Fallback for Not Found ---
error('Endpoint action not found or invalid request method.', 404);
?>
```

### `blog.php` (For Blog Posts)

This script handles all blog-related actions.

```php
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
```
---

## Complete Scripts

### `event.php` (For Registrations & Showcases)

This script handles creating, fetching, and updating event-related submissions.

```php
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

    foreach (['registrations', 'showcases'] as $table) {
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

// --- Fallback for Not Found ---
error('Endpoint action not found or invalid request method.', 404);
?>
```

### `blog.php` (For Blog Posts)

This script handles all blog-related actions: creating, fetching all posts, and fetching a single post by its URL slug.

```php
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
```
