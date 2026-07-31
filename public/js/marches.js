// ---------------------------------------------------------------
// marches.js — liste (recherche/filtre), formulaire (onglets +
// validation), détail (confirmations), impression.
// ---------------------------------------------------------------

const toast = document.getElementById('toast');
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2600);
}

// ---------------------------------------------------------------
// Liste
// ---------------------------------------------------------------
(function initListe() {
  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;

  const searchInput = document.getElementById('searchInput');
  const filterType = document.getElementById('filterType');
  const filterStatut = document.getElementById('filterStatut');
  const resetBtn = document.getElementById('resetBtn');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  const printBtn = document.getElementById('printBtn');

  const rows = Array.from(tableBody.querySelectorAll('tr[data-row]'));
  const totalCount = rows.length;

  function applyFilters() {
    const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const type = filterType ? filterType.value : '';
    const statut = filterStatut ? filterStatut.value : '';
    let visible = 0;

    rows.forEach((row) => {
      const haystack = row.dataset.search || '';
      const matchesSearch = !q || haystack.includes(q);
      const matchesType = !type || row.dataset.type === type;
      const matchesStatut = !statut || row.dataset.statut === statut;
      const show = matchesSearch && matchesType && matchesStatut;
      row.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (resultCount) {
      resultCount.innerHTML = `<b>${visible}</b> marché${visible > 1 ? 's' : ''} sur <b>${totalCount}</b>`;
    }
    if (emptyState) emptyState.style.display = visible === 0 ? 'block' : 'none';
    tableBody.parentElement.style.display = visible === 0 ? 'none' : '';
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (filterType) filterType.addEventListener('change', applyFilters);
  if (filterStatut) filterStatut.addEventListener('change', applyFilters);
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (filterType) filterType.value = '';
      if (filterStatut) filterStatut.value = '';
      applyFilters();
    });
  }
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  applyFilters();
})();

// ---------------------------------------------------------------
// Suppression / archivage — confirmation avant soumission
// ---------------------------------------------------------------
document.querySelectorAll('.delete-form').forEach((form) => {
  form.addEventListener('submit', (e) => {
    const numero = form.dataset.numero || 'ce marché';
    const ok = confirm(
      `Supprimer définitivement le marché ${numero} ?\n\nCette action supprime aussi sa checklist et tous ses documents joints. Elle est irréversible.`,
    );
    if (!ok) e.preventDefault();
  });
});

document.querySelectorAll('.archive-form').forEach((form) => {
  form.addEventListener('submit', (e) => {
    const ok = confirm("Archiver ce document ? Il restera consultable dans l'historique mais ne sera plus listé comme actif.");
    if (!ok) e.preventDefault();
  });
});

// ---------------------------------------------------------------
// Fiche / détail — impression directe
// ---------------------------------------------------------------
(function initPrint() {
  const printBtn = document.getElementById('printFicheBtn');
  if (printBtn) printBtn.addEventListener('click', () => window.print());
})();

// ---------------------------------------------------------------
// Formulaire — onglets (Infos générales / Complémentaires / Pièces jointes)
// ---------------------------------------------------------------
(function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  if (!tabs.length) return;

  function activate(tabName) {
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tabName));
    panels.forEach((p) => p.classList.toggle('active', p.dataset.panel === tabName));
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab.dataset.tab));
  });

  // Boutons "Suivant" internes aux panneaux, s'ils existent
  document.querySelectorAll('[data-next-tab]').forEach((btn) => {
    btn.addEventListener('click', () => activate(btn.dataset.nextTab));
  });
})();

// ---------------------------------------------------------------
// Formulaire — auto-remplissage du fournisseur depuis l'AO choisi
// ---------------------------------------------------------------
(function initAoLink() {
  const aoSelect = document.getElementById('appel_offre_id');
  const fournisseurSelect = document.getElementById('fournisseur_id');
  if (!aoSelect || !fournisseurSelect) return;

  aoSelect.addEventListener('change', () => {
    const opt = aoSelect.options[aoSelect.selectedIndex];
    const fId = opt ? opt.dataset.fournisseur : '';
    if (fId && fournisseurSelect.querySelector(`option[value="${fId}"]`)) {
      fournisseurSelect.value = fId;
    }
  });
})();

// ---------------------------------------------------------------
// Formulaire — validation avant envoi (numéro, montant, dates cohérentes)
// ---------------------------------------------------------------
(function initValidate() {
  const form = document.getElementById('marcheForm');
  if (!form) return;

  function setInvalid(input, invalid) {
    const field = input.closest('.field');
    if (field) field.classList.toggle('invalid', invalid);
  }

  function validate() {
    let ok = true;
    let firstBadTab = null;

    form.querySelectorAll('[required]').forEach((input) => {
      if (input.closest('.inline-upload-form')) return;
      
      const invalid = !input.value || !input.value.trim();
      setInvalid(input, invalid);
      if (invalid) {
        ok = false;
        const panel = input.closest('.tab-panel');
        if (panel && !firstBadTab) firstBadTab = panel.dataset.panel;
      }
    });

    const montant = document.getElementById('montant');
    if (montant && montant.value && Number(montant.value) < 0) {
      setInvalid(montant, true);
      ok = false;
      firstBadTab = firstBadTab || 'general';
    }

    const dateDebut = document.getElementById('date_debut');
    const dateFin = document.getElementById('date_fin');
    if (dateDebut && dateFin && dateDebut.value && dateFin.value && dateFin.value < dateDebut.value) {
      setInvalid(dateFin, true);
      ok = false;
      firstBadTab = firstBadTab || 'complementaire';
    }

    if (!ok && firstBadTab) {
      const tabBtn = document.querySelector(`.tab-btn[data-tab="${firstBadTab}"]`);
      if (tabBtn) tabBtn.click();
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
})();

// ---------------------------------------------------------------
// Formulaire d'upload inline (page détail) — juste un feedback visuel,
// la vraie soumission part vers POST /documents/upload
// ---------------------------------------------------------------
document.querySelectorAll('.inline-upload-form').forEach((form) => {
  form.addEventListener('submit', (e) => {
    const fileInput = form.querySelector('input[type="file"]');
    if (fileInput && !fileInput.value) {
      e.preventDefault();
      showToast('Choisissez un fichier avant de l\'ajouter.');
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {

    const badges = document.querySelectorAll(".badge-echeance");

    const aujourdhui = new Date();

    badges.forEach(badge => {

        const valeur = badge.dataset.date;

        if (!valeur) {

            badge.textContent = "—";
            return;

        }

        const dateFin = new Date(valeur);

        const diff = Math.ceil(
            (dateFin - aujourdhui) / (1000 * 60 * 60 * 24)
        );

        if (diff < 0) {

            badge.textContent = "Expiré";
            badge.classList.add("expire");

        } else if (diff <= 30) {

            badge.textContent = "Échéance proche";
            badge.classList.add("proche");

        } else {

            badge.textContent = "Valide";
            badge.classList.add("valide");

        }

    });

});