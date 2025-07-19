# PHP API Implementation Guide

This guide outlines the requirements and provides a complete example for the PHP backend API that the Northern Tech Exchange Next.js application will communicate with.

## How to Use

1.  **Create a PHP file** on your server (e.g., `api/event.php`).
2.  **Copy the code** from the "Complete PHP Script" section below into that file.
3.  **Update your database credentials** in the script (`$host`, `$dbname`, `$username`, `$password`).
4.  **Ensure your Next.js application** has the correct `NEXT_PUBLIC_API_URL` in its environment variables, pointing to the location of your PHP file (e.g., `https://www.arewaskills.com.ng/api/event.php`).
5.  **Set up the necessary database tables.** Use the SQL schemas provided below.

## General Requirements

*   **Content-Type**: All API responses must be JSON (`Content-Type: application/json`).
*   **CORS**: Cross-Origin Resource Sharing (CORS) must be enabled. The provided script allows access from all origins (`*`). For better security, you can replace `*` with your frontend domain.
*   **HTTP Status Codes**: The script uses appropriate HTTP status codes (e.g., `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
*   **Response Format**:
    *   **Success**: `{ "success": true, "data": [...] }` or `{ "success": true, "data": {...} }`
    *   **Error**: `{ "success": false, "error": "Error message here" }`

## Database Schema

You will need three tables in your MySQL database: `registrations`, `showcases`, and `posts`.

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

---

## Complete PHP Script (`event.php`)

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
```