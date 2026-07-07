<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, X-Upload-Secret");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Security token to ensure only your TECHNOVA app can upload files
$secret_key = "technova_lws_upload_secure_token_58934751";
$headers = getallheaders();
$received_secret = isset($headers['X-Upload-Secret']) ? $headers['X-Upload-Secret'] : '';

if ($received_secret !== $secret_key) {
    header("HTTP/1.1 403 Forbidden");
    echo json_encode(["error" => "Access denied"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['file'])) {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode(["error" => "No file uploaded"]);
        exit;
    }

    $file = $_FILES['file'];
    $original_name = basename($file['name']);
    $extension = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));
    
    // Generate a unique safe name to avoid overwriting and security exploits
    $safe_name = uniqid('tn_', true) . '.' . $extension;
    
    $upload_dir = __DIR__ . '/uploads/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    $destination = $upload_dir . $safe_name;
    
    if (move_uploaded_file($file['tmp_name'], $destination)) {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
        $host = $_SERVER['HTTP_HOST'];
        $public_url = $protocol . "://" . $host . "/uploads/" . $safe_name;
        
        echo json_encode(["url" => $public_url, "success" => true]);
    } else {
        header("HTTP/1.1 500 Internal Server Error");
        echo json_encode(["error" => "Failed to move uploaded file"]);
    }
} else {
    header("HTTP/1.1 405 Method Not Allowed");
    echo json_encode(["error" => "Invalid method"]);
}
