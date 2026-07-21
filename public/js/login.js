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

// Connexion
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  errorMsg.classList.remove("show");

  const email = document.getElementById("email").value.trim();
  const password = passInput.value.trim();

  if (!email || !password) {
    errorMsg.textContent = "Veuillez remplir tous les champs.";
    errorMsg.classList.add("show");
    return;
  }

  loginBtn.disabled = true;
  btnText.textContent = "Connexion...";

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    loginBtn.disabled = false;
    btnText.textContent = "Se connecter";

    if (data.success) {
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("nom", data.user.nom);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("role", data.user.role);

      switch (data.user.role) {
        case "ADMIN":
          window.location.href = "/admin/dashboard";
          break;

        case "CONSULTATEUR":
          window.location.href = "/consultateur/dashboard";
          break;

        default:
          errorMsg.textContent = "Profil utilisateur inconnu.";
          errorMsg.classList.add("show");
      }
    } else {
      errorMsg.textContent = data.message;
      errorMsg.classList.add("show");
    }
    
  } catch (err) {
    loginBtn.disabled = false;
    btnText.textContent = "Se connecter";

    errorMsg.textContent = "Erreur de connexion au serveur.";
    errorMsg.classList.add("show");
  }
});

// Mot de passe oublié
forgotLink.addEventListener("click", (e) => {
  e.preventDefault();
  alert(
    "Veuillez contacter le Bureau Informatique pour réinitialiser votre mot de passe.",
  );
});
