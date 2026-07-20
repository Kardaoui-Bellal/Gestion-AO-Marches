 const passInput = document.getElementById("password");
      const toggleBtn = document.getElementById("togglePass");
      const form = document.getElementById("loginForm");
      const errorMsg = document.getElementById("errorMsg");
      const loginBtn = document.getElementById("loginBtn");
      const btnText = document.getElementById("btnText");
      const forgotLink = document.getElementById("forgotLink");

      // Toggle password visibility
      toggleBtn.addEventListener("click", () => {
        const isPassword = passInput.type === "password";
        passInput.type = isPassword ? "text" : "password";
      });

      // Form submit handling
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        errorMsg.classList.remove("show");

        const email = document.getElementById("email").value.trim();
        const password = passInput.value.trim();

        if (!email || !password) {
          errorMsg.textContent = "Veuillez remplir tous les champs.";
          errorMsg.classList.add("show");
          return;
        }

        // Simulate a login request (à remplacer par un appel API réel)
        loginBtn.disabled = true;
        btnText.textContent = "Connexion...";

        setTimeout(() => {
          loginBtn.disabled = false;
          btnText.textContent = "Se connecter";

          // TODO: remplacer cette logique par la vérification réelle côté serveur
          if (email === "admin@ormvasm.ma" && password === "admin123") {
            window.location.href = "dashboard.html";
          } else {
            errorMsg.textContent = "Email ou mot de passe incorrect.";
            errorMsg.classList.add("show");
          }
        }, 900);
      });

      forgotLink.addEventListener("click", (e) => {
        e.preventDefault();
        alert(
          "Veuillez contacter le Bureau Informatique pour réinitialiser votre mot de passe.",
        );
      });