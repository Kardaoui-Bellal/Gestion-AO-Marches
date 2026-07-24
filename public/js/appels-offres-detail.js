// Petites interactions côté client pour la fiche détail AO.
// Aucune donnée n'est manipulée ici : toutes les actions (archiver un
// document, etc.) passent par de vraies soumissions de formulaire vers
// les routes existantes (POST /documents/:id/archive), pas par fetch/JSON.

const toast = document.getElementById('toast');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2600);
}

// Confirmation avant archivage d'un document (la soumission se poursuit
// normalement ensuite vers /documents/:id/archive).
document.querySelectorAll('.archive-form').forEach((form) => {
  form.addEventListener('submit', (e) => {
    const ok = confirm("Archiver ce document ? Il restera consultable dans l'historique mais ne sera plus listé comme actif.");
    if (!ok) e.preventDefault();
  });
});

// Copie rapide du numéro d'AO dans le presse-papiers, si le navigateur
// le permet (amélioration progressive — aucune dépendance).
const refEl = document.querySelector('.ref-line .ref');
if (refEl && navigator.clipboard) {
  refEl.style.cursor = 'pointer';
  refEl.title = 'Cliquer pour copier le numéro';
  refEl.addEventListener('click', () => {
    navigator.clipboard.writeText(refEl.textContent.trim())
      .then(() => showToast('Numéro copié.'))
      .catch(() => {});
  });
}