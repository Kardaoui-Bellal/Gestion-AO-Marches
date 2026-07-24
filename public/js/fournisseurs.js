// ---------------------------------------------------------------
// fournisseurs.js
// Comme pour appels-offres.js, ce fichier est servi tel quel par
// express.static (jamais interprété par EJS). Les données réelles
// (liste des fournisseurs) restent côté DOM : on filtre les lignes
// <tr> déjà rendues par le serveur, on ne les re-génère pas en JS.
// Ce fichier gère 3 pages : liste (#tableBody), formulaire (#fournisseurForm)
// et fiche détail (rien de spécifique).
// ---------------------------------------------------------------

(function initListe() {
  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return; // pas sur la page liste

  const searchInput = document.getElementById('searchInput');
  const filterDomaine = document.getElementById('filterDomaine');
  const resetBtn = document.getElementById('resetBtn');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  const toast = document.getElementById('toast');

  const rows = Array.from(tableBody.querySelectorAll('tr[data-row]'));
  const totalCount = rows.length;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function applyFilters() {
    const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const domaine = filterDomaine ? filterDomaine.value : '';
    let visible = 0;

    rows.forEach((row) => {
      const haystack = row.dataset.search || '';
      const matchesSearch = !q || haystack.includes(q);
      const matchesDomaine = !domaine || row.dataset.domaine === domaine;
      const show = matchesSearch && matchesDomaine;
      row.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (resultCount) {
      resultCount.innerHTML = `<b>${visible}</b> fournisseur${visible > 1 ? 's' : ''} sur <b>${totalCount}</b>`;
    }
    if (emptyState) emptyState.style.display = visible === 0 ? 'block' : 'none';
    tableBody.parentElement.style.display = visible === 0 ? 'none' : '';
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (filterDomaine) filterDomaine.addEventListener('change', applyFilters);
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (filterDomaine) filterDomaine.value = '';
      applyFilters();
    });
  }

  applyFilters();

  // Activation / désactivation (soft-delete, cf. POST /fournisseurs/:id/toggle)
  document.querySelectorAll('form[data-toggle-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      const isActive = form.dataset.currentlyActive === '1';
      const msg = isActive
        ? 'Désactiver ce fournisseur ? Il n\'apparaîtra plus dans les listes de sélection actives.'
        : 'Réactiver ce fournisseur ?';
      if (!confirm(msg)) e.preventDefault();
    });
  });

  // Impression : ouvre l'aperçu d'impression natif du navigateur, filtré CSS print
  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }
})();

// ---------------------------------------------------------------
// Formulaire (ajout / modification) — validation avant envoi
// ---------------------------------------------------------------
(function initForm() {
  const form = document.getElementById('fournisseurForm');
  if (!form) return;

  const iceInput = document.getElementById('ice');
  const telInput = document.getElementById('telephone');

  function setInvalid(input, invalid) {
    const field = input.closest('.field');
    if (field) field.classList.toggle('invalid', invalid);
  }

  function validate() {
    let ok = true;

    form.querySelectorAll('[required]').forEach((input) => {
      const invalid = !input.value || !input.value.trim();
      setInvalid(input, invalid);
      if (invalid) ok = false;
    });

    if (iceInput && iceInput.value) {
      const iceDigits = iceInput.value.replace(/\s+/g, '');
      const iceValid = /^\d{15}$/.test(iceDigits);
      setInvalid(iceInput, !iceValid);
      if (!iceValid) ok = false;
    }

    if (telInput && telInput.value) {
      const telDigits = telInput.value.replace(/[\s.-]+/g, '');
      const telValid = /^0\d{9}$/.test(telDigits);
      setInvalid(telInput, !telValid);
      if (!telValid) ok = false;
    }

    return ok;
  }

  form.addEventListener('submit', (e) => {
    if (!validate()) {
      e.preventDefault();
      const firstInvalid = form.querySelector('.field.invalid input, .field.invalid select');
      if (firstInvalid) firstInvalid.focus();
    }
  });

  [iceInput, telInput].forEach((input) => {
    if (input) input.addEventListener('blur', validate);
  });
})();