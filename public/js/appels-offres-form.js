// Validation légère côté client. Le formulaire est ensuite soumis
// normalement en POST vers /appels-offres (création) ou
// /appels-offres/:id (édition), géré par appelOffreController.create /
// .update, qui ré-affiche ce même formulaire avec `error` en cas de
// souci (numéro déjà utilisé, champs manquants, etc.).

const form = document.getElementById('aoForm');
const submitBtn = document.getElementById('submitBtn');
const submitBtnText = document.getElementById('submitBtnText');

const requiredFields = ['numero_ao', 'objet', 'categorie_id', 'etat_id', 'montant_estimatif'];

function fieldWrap(el) {
  return el.closest('.field');
}

function validate() {
  let valid = true;

  requiredFields.forEach((name) => {
    const el = form.elements[name];
    const wrap = fieldWrap(el);
    const empty = !el.value || !el.value.trim();
    wrap.classList.toggle('invalid', empty);
    if (empty) valid = false;
  });

  const montantEl = form.elements['montant_estimatif'];
  if (montantEl.value && Number(montantEl.value) < 0) {
    fieldWrap(montantEl).classList.add('invalid');
    valid = false;
  }

  return valid;
}

form.addEventListener('submit', (e) => {
  if (!validate()) {
    e.preventDefault();
    const firstInvalid = form.querySelector('.field.invalid input, .field.invalid select');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtnText.textContent = 'Enregistrement...';
  // Pas de preventDefault : soumission classique du formulaire.
});

// Retire l'état "invalid" dès que l'utilisateur corrige un champ.
requiredFields.forEach((name) => {
  const el = form.elements[name];
  el.addEventListener('input', () => fieldWrap(el).classList.remove('invalid'));
  el.addEventListener('change', () => fieldWrap(el).classList.remove('invalid'));
});