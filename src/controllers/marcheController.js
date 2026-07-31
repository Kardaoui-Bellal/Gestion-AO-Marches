npm start

> ormvasm-ao-marches@1.0.0 start
> node server.js

MySQL connected.
Server running on http://localhost:3000
[2026-07-31T11:51:42.701Z] Erreur sur GET /marches: ReferenceError: /home/belk/Documents/Stage/Gestion-AO-Marches/views/marches/liste.ejs:125
    123|                 <td><%= m.fournisseur_nom %></td>
    124|                 <td class="montant-cell"><%= fmtMoney(m.montant) %></td>
 >> 125|                 <td><span class="badge <%= statutBadgeClass(m.statut_code) %>"><%= m.statut_libelle %></span></td>
    126|                 <td><span class="badge-echeance" data-date="<%= m.date_fin %>"></span></td>
    127|                 <td>
    128|                   <div class="actions">

statutBadgeClass is not defined
    at eval ("/home/belk/Documents/Stage/Gestion-AO-Marches/views/marches/liste.ejs":103:7)
    at Array.forEach (<anonymous>)
    at eval ("/home/belk/Documents/Stage/Gestion-AO-Marches/views/marches/liste.ejs":76:16)
    at liste (/home/belk/Documents/Stage/Gestion-AO-Marches/node_modules/ejs/lib/cjs/ejs.js:643:23)
    at tryHandleCache (/home/belk/Documents/Stage/Gestion-AO-Marches/node_modules/ejs/lib/cjs/ejs.js:253:42)
    at ejs.renderFile [as engine] (/home/belk/Documents/Stage/Gestion-AO-Marches/node_modules/ejs/lib/cjs/ejs.js:444:12)
    at View.render (/home/belk/Documents/Stage/Gestion-AO-Marches/node_modules/express/lib/view.js:135:8)
    at tryRender (/home/belk/Documents/Stage/Gestion-AO-Marches/node_modules/express/lib/application.js:657:10)
    at Function.render (/home/belk/Documents/Stage/Gestion-AO-Marches/node_modules/express/lib/application.js:609:3)
    at ServerResponse.render (/home/belk/Documents/Stage/Gestion-AO-Marches/node_modules/express/lib/response.js:1049:7)
    at list (/home/belk/Documents/Stage/Gestion-AO-Marches/src/controllers/marcheController.js:26:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
  path: '/home/belk/Documents/Stage/Gestion-AO-Marches/views/marches/liste.ejs'
}
