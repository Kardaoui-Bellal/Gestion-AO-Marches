const passInput = document.getElementById("password");
const toggleBtn = document.getElementById("togglePass");
const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");
const loginBtn = document.getElementById("loginBtn");
const btnText = document.getElementById("btnText");
const forgotLink = document.getElementById("forgotLink");

// Afficher / masquer le mot de passe
toggleBtn.addEventListener("click", () => {
  passInput.type = passInput.type === "password" ? "text" : "password";
});


form.addEventListener("submit", (e) => {
  const email = document.getElementById("email").value.trim();
  const password = passInput.value.trim();

  if (!email || !password) {
    e.preventDefault();
    errorMsg.textContent = "Veuillez remplir tous les champs.";
    errorMsg.classList.add("show");
    return;
  }

  loginBtn.disabled = true;
  btnText.textContent = "Connexion...";
});

// Mot de passe oublié
forgotLink.addEventListener("click", (e) => {
  e.preventDefault();
  alert(
    "Veuillez contacter le Bureau Informatique pour réinitialiser votre mot de passe.",
  );
});