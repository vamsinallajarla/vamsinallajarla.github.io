document.addEventListener("DOMContentLoaded", function () {
  emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual EmailJS public key

  document.getElementById("contact-form").addEventListener("submit", function (event) {
    event.preventDefault();

    emailjs.sendForm("service_grog0kp", "template_oi3yja8", this)
      .then(function () {
        document.getElementById("sendmessage").classList.add("show");
        document.getElementById("errormessage").classList.remove("show");
        document.getElementById("contact-form").reset();
      }, function (error) {
        document.getElementById("sendmessage").classList.remove("show");
        document.getElementById("errormessage").classList.add("show");
        document.getElementById("errormessage").innerHTML = "Message failed: " + error.text;
      });
  });
});

