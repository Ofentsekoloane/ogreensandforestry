<?php
// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Your email where messages will be sent
    $to = "Ofentsekoloane101@gmail.com"; 

    // Collect form data
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $message = strip_tags(trim($_POST["message"]));

    // Prepare email content
    $subject = "New message from O-Greens & Forestry website";
    $email_content = "Name: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Message:\n$message\n";

    $email_headers = "From: $name <$email>";

    // Send email to you
    if (mail($to, $subject, $email_content, $email_headers)) {
        $success = true;

        // Optional: Auto-reply to visitor
        $auto_subject = "Thank you for contacting O-Greens & Forestry!";
        $auto_message = "Hello $name,\n\nThank you for reaching out to O-Greens & Forestry. We have received your message and will respond within 24 hours.\n\nBest regards,\nO-Greens & Forestry";
        mail($email, $auto_subject, $auto_message, "From: O-Greens & Forestry <$to>");
    } else {
        $success = false;
    }
}
?>

<!-- HTML Contact Form -->
<section id="contact">
  <h2>Send Us a Message</h2>

  <?php if (isset($success) && $success): ?>
      <p style="color: green; font-weight: bold;">Thank you! Your message has been sent. We will respond within 24 hours.</p>
  <?php elseif (isset($success) && !$success): ?>
      <p style="color: red; font-weight: bold;">Oops! Something went wrong. Please try again later.</p>
  <?php else: ?>
      <form action="" method="POST">
          <label for="name">Your Name</label>
          <input type="text" id="name" name="name" placeholder="Enter your name" required>

          <label for="email">Your Email</label>
          <input type="email" id="email" name="email" placeholder="Enter your email" required>

          <label for="message">Your Message</label>
          <textarea id="message" name="message" rows="5" placeholder="Type your message here" required></textarea>

          <button type="submit">Send Message</button>
      </form>
  <?php endif; ?>
</section>

<!-- Optional CSS -->
<style>
  #contact { max-width: 600px; margin: auto; padding: 20px; }
  #contact input, #contact textarea { width: 100%; padding: 10px; margin: 8px 0; }
  #contact button { padding: 10px 20px; background-color: #2c7a7b; color: white; border: none; cursor: pointer; }
  #contact button:hover { background-color: #285e61; }
</style>
