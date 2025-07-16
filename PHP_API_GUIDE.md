# PHP API Implementation Guide

This guide outlines the requirements for the PHP backend API that the Arewa Tech Connect Next.js application will communicate with. The base URL for this API is assumed to be `/events/api`.

## General Requirements

-   **Content-Type**: All API responses should be JSON (`Content-Type: application/json`).
-   **CORS**: Ensure Cross-Origin Resource Sharing (CORS) is enabled to allow requests from your frontend domain (`arewaskills.com.ng` and development environments).
-   **HTTP Status Codes**: Use appropriate HTTP status codes (e.g., `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
-   **Response Format**:
    -   **Success**: `{ "success": true, "data": [...] }` or `{ "success": true, "data": {...} }`
    -   **Error**: `{ "success": false, "error": "Error message here" }`

## Endpoints

### 1. Create a Submission (Registration or Showcase)

-   **Endpoint**: `POST /registrations` and `POST /showcases`
-   **Description**: Saves a new registration or showcase submission to the database.
-   **Request Body**: A JSON object with the form data.
-   **Logic**:
    1.  Read the JSON body from the request.
    2.  Generate a unique ID (e.g., using `uniqid()` or a UUID library).
    3.  Set the `type` to either 'registration' or 'showcase'.
    4.  Insert the data into the appropriate table (`registrations` or `showcases`).
    5.  Return a success response with the created data.

### 2. Get All Submissions

-   **Endpoint**: `GET /registrations` and `GET /showcases`
-   **Description**: Retrieves all submissions from the database.
-   **Logic**:
    1.  Query the `registrations` or `showcases` table.
    2.  Order the results by `submittedAt` in descending order.
    3.  Return the array of submissions in the `data` property.

### 3. Find Submission by ID

-   **Endpoint**: `GET /submissions/{id}`
-   **Description**: Finds a single submission (from either table) by its ID.
-   **Logic**:
    1.  Search the `registrations` table for the given ID.
    2.  If not found, search the `showcases` table.
    3.  If found, return the submission data.
    4.  If not found in either table, return a 404 error.

### 4. Find Submission by Email

-   **Endpoint**: `GET /submissions/find?email={email}`
-   **Description**: Finds a single submission by email address.
-   **Logic**:
    1.  Search the `registrations` table for the email.
    2.  If not found, search the `showcases` table for the `presenterEmail`.
    3.  Return the first matching record found.
    4.  If not found, return a 404 error.

### 5. Update Submission Status (Generic Update)

-   **Endpoint**: `PATCH /submissions/{id}`
-   **Description**: Updates a submission's status or other details (like payment method and receipt number).
-   **Request Body**: A JSON object like `{"status": "paid", "receiptNumber": "12345"}`.
-   **Logic**:
    1.  Determine if the ID belongs to a registration or a showcase.
    2.  Construct a `PATCH` SQL query to update the specified fields for the given ID.
    3.  Execute the update.
    4.  Return a success response.

### 6. Mark Submissions as Pending

-   **Endpoint**: `POST /submissions/mark-pending`
-   **Description**: Updates multiple submissions to have the `payment_pending` status. This is used by the admin panel to send out "payment requests".
-   **Request Body**: `{"ids": ["id1", "id2", "id3"]}`
-   **Logic**:
    1.  Loop through the provided IDs.
    2.  For each ID, update its status to `payment_pending` in the correct table (`registrations` or `showcases`). A single `UPDATE ... WHERE id IN (...)` query for each table would be most efficient.
    3.  Return a success response.
