<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $subject = strip_tags(trim($_POST["subject"]));
    $message = trim($_POST["message"]);

    if (empty($name) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($subject) || empty($message)) {
        echo "Please fill in all fields correctly.";
        exit;
    }

    $to = "upendra.nallajarla8055@gmail.com"; // Your Gmail
    $email_subject = "New Contact Form Message: $subject";
    $email_body = "You received a new message from your website contact form.\n\n" .
                  "Name: $name\n" .
                  "Email: $email\n" .
                  "Subject: $subject\n\n" .
                  "Message:\n$message\n";

    $headers = "From: $name <$email>";

    if (mail($to, $email_subject, $email_body, $headers)) {
        echo "OK";
    } else {
        echo "Mail sending failed. Please try again later.";
    }
}
?>
