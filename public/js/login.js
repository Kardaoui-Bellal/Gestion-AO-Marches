// Gestion du formulaire de connexion
document.querySelector(".login-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  console.log("Nom d'utilisateur:", username);
  console.log("Mot de passe:", password);
  alert("Connexion en cours... (Ceci est un exemple)");
});

// Gestion du lien "Mot de passe oublié ?"
const forgotPasswordLink = document.getElementById("forgot-password-link");
const modal = document.getElementById("forgot-password-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const closeModalSpan = document.querySelector(".close-modal");

forgotPasswordLink.addEventListener("click", function (e) {
  e.preventDefault();
  modal.style.display = "flex";
});

closeModalBtn.addEventListener("click", function () {
  modal.style.display = "none";
});

closeModalSpan.addEventListener("click", function () {
  modal.style.display = "none";
});

// Fermer la modale en cliquant en dehors de celle-ci
window.addEventListener("click", function (e) {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
