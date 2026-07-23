
// ---------------------------------------------------------------
// Données injectées par le serveur (EJS) depuis la variable `appelsOffres`
// passée au res.render(). Le tableau ci-dessous alimente la recherche,
// le tri et la pagination côté client, en plus du rendu initial côté serveur.
// ---------------------------------------------------------------
const appelsOffres = <%- JSON.stringify(_appelsOffres) %>;

const statutBadge = {
  "En cours":"info",
  "Clôturé":"neutral",
  "Attribué":"success",
  "Infructueux":"warning",
  "Annulé":"danger",
};

const state = { search:"", statut:"", type:"", sortKey:"datePublication", sortDir:"desc", page:1, perPage:8 };

const tableBody = document.getElementById('tableBody');
const resultCount = document.getElementById('resultCount');
const emptyState = document.getElementById('emptyState');
const paginationInfo = document.getElementById('paginationInfo');
const paginationControls = document.getElementById('paginationControls');
const toast = document.getElementById('toast');

function fmtDate(iso){
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function fmtBudget(n){
  return n.toLocaleString('fr-FR') + ' MAD';
}
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>toast.classList.remove('show'), 2600);
}

function getFiltered(){
  let rows = appelsOffres.filter(r=>{
    const q = state.search.trim().toLowerCase();
    const matchesSearch = !q || r.reference.toLowerCase().includes(q) || r.objet.toLowerCase().includes(q);
    const matchesStatut = !state.statut || r.statut === state.statut;
    const matchesType = !state.type || r.type === state.type;
    return matchesSearch && matchesStatut && matchesType;
  });
  rows.sort((a,b)=>{
    let av = a[state.sortKey], bv = b[state.sortKey];
    if(typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
    if(av < bv) return state.sortDir === 'asc' ? -1 : 1;
    if(av > bv) return state.sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  return rows;
}

function render(){
  const filtered = getFiltered();
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / state.perPage));
  if(state.page > totalPages) state.page = totalPages;
  const start = (state.page - 1) * state.perPage;
  const pageRows = filtered.slice(start, start + state.perPage);

  resultCount.innerHTML = `<b>${total}</b> appel(s) d'offres trouvé(s)`;

  tableBody.innerHTML = '';
  if(pageRows.length === 0){
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    pageRows.forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="ref">${r.reference}</span></td>
        <td class="objet">
          <div class="objet-title">${r.objet}</div>
          <div class="objet-service">${r.service}</div>
        </td>
        <td><span class="type-tag">${r.type}</span></td>
        <td><span class="date-mono">${fmtDate(r.datePublication)}</span></td>
        <td><span class="date-mono">${fmtDate(r.dateLimite)}</span></td>
        <td><span class="budget">${fmtBudget(r.budget)}</span></td>
        <td><span class="badge ${statutBadge[r.statut] || 'neutral'}">${r.statut}</span></td>
        <td>
          <div class="actions">
            <a class="icon-btn" title="Voir la fiche" href="/appels-offres/${r.reference}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
            </a>
            <a class="icon-btn" title="Modifier" href="/appels-offres/${r.reference}/modifier">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
            </a>
            <button class="icon-btn danger" title="Supprimer" data-action="delete" data-ref="${r.reference}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16"/><path d="M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
            </button>
          </div>
        </td>`;
      tableBody.appendChild(tr);
    });
  }

  // pagination
  paginationInfo.textContent = total === 0
    ? 'Aucun résultat'
    : `Affichage ${start+1}–${Math.min(start+state.perPage, total)} sur ${total}`;

  paginationControls.innerHTML = '';
  const mkBtn = (label, disabled, onClick, active=false)=>{
    const b = document.createElement('button');
    b.className = 'page-btn' + (active ? ' active' : '');
    b.textContent = label;
    b.disabled = disabled;
    b.addEventListener('click', onClick);
    return b;
  };
  paginationControls.appendChild(mkBtn('‹', state.page<=1, ()=>{state.page--; render();}));
  for(let p=1; p<=totalPages; p++){
    paginationControls.appendChild(mkBtn(String(p), false, ()=>{state.page=p; render();}, p===state.page));
  }
  paginationControls.appendChild(mkBtn('›', state.page>=totalPages, ()=>{state.page++; render();}));

  // sort header indicators
  document.querySelectorAll('thead th[data-key]').forEach(th=>{
    th.classList.toggle('sorted', th.dataset.key === state.sortKey);
    const arrow = th.querySelector('.arrow');
    arrow.textContent = th.dataset.key === state.sortKey ? (state.sortDir === 'asc' ? '▲' : '▼') : '';
  });
}

// events
document.getElementById('searchInput').addEventListener('input', e=>{
  state.search = e.target.value; state.page = 1; render();
});
document.getElementById('filterStatut').addEventListener('change', e=>{
  state.statut = e.target.value; state.page = 1; render();
});
document.getElementById('filterType').addEventListener('change', e=>{
  state.type = e.target.value; state.page = 1; render();
});
document.getElementById('resetBtn').addEventListener('click', ()=>{
  state.search=''; state.statut=''; state.type=''; state.page=1;
  document.getElementById('searchInput').value='';
  document.getElementById('filterStatut').value='';
  document.getElementById('filterType').value='';
  render();
});
document.querySelectorAll('thead th[data-key]').forEach(th=>{
  th.addEventListener('click', ()=>{
    const key = th.dataset.key;
    if(state.sortKey === key){
      state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortKey = key; state.sortDir = 'asc';
    }
    render();
  });
});
tableBody.addEventListener('click', e=>{
  const btn = e.target.closest('button[data-action="delete"]');
  if(!btn) return;
  const ref = btn.dataset.ref;
  if(confirm(`Confirmer la suppression de l'appel d'offres ${ref} ?`)){
    // À connecter : DELETE /appels-offres/:reference
    fetch(`/appels-offres/${encodeURIComponent(ref)}`, { method: 'DELETE' })
      .then(res => {
        if(!res.ok) throw new Error('Échec de la suppression');
        const idx = appelsOffres.findIndex(a=>a.reference===ref);
        if(idx !== -1){ appelsOffres.splice(idx,1); render(); showToast(`${ref} supprimé.`); }
      })
      .catch(() => showToast(`Erreur lors de la suppression de ${ref}.`));
  }
});

// Le rendu initial vient du serveur (EJS) ; on ne relance render() que si
// l'utilisateur interagit (recherche, tri, filtre, pagination) — voir events ci-dessus.
// Pour activer le tri/la pagination dès le chargement, décommenter la ligne suivante :
// render();