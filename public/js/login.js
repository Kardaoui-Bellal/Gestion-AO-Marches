 const form = document.getElementById('loginForm');
    const alertBox = document.getElementById('alertBox');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');

    function afficherErreur(message) {
      alertBox.textContent = message;
      alertBox.classList.remove('d-none');
    }

    function masquerErreur() {
      alertBox.classList.add('d-none');
    }

    function setChargement(actif) {
      submitBtn.disabled = actif;
      submitSpinner.classList.toggle('d-none', !actif);
      submitText.textContent = actif ? 'Connexion en cours...' : 'Se connecter';
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      masquerErreur();

      const login = document.getElementById('login').value.trim();
      const mot_de_passe = document.getElementById('mot_de_passe').value;

      if (!login || !mot_de_passe) {
        afficherErreur('Veuillez saisir votre identifiant et votre mot de passe.');
        return;
      }

      setChargement(true);

      try {
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login, mot_de_passe })
        });

        const data = await response.json();

        if (!response.ok) {
          afficherErreur(data.message || 'Identifiants incorrects.');
          setChargement(false);
          return;
        }

        // Connexion réussie -> redirection (selon profil géré côté serveur)
        window.location.href = data.redirect || '/dashboard.html';

      } catch (error) {
        console.error(error);
        afficherErreur('Impossible de contacter le serveur. Veuillez réessayer.');
        setChargement(false);
      }
    });
 
