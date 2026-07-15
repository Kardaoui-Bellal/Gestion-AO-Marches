const searchInput = document.getElementById("searchInput");
const categorieFilter = document.getElementById("categorieFilter");
const etatFilter = document.getElementById("etatFilter");

const rows = document.querySelectorAll("#tableBody tr");

function filtrerTable() {

    const texte = searchInput.value.toLowerCase();
    const categorie = categorieFilter.value.toLowerCase();
    const etat = etatFilter.value.toLowerCase();

    rows.forEach(row => {

        const numero = row.cells[0].textContent.toLowerCase();
        const objet = row.cells[1].textContent.toLowerCase();
        const categorieRow = row.cells[2].textContent.toLowerCase();
        const etatRow = row.cells[3].textContent.toLowerCase();

        const rechercheOK =
            numero.includes(texte) ||
            objet.includes(texte);

        const categorieOK =
            categorie === "" ||
            categorieRow === categorie;

        const etatOK =
            etat === "" ||
            etatRow === etat;

        if(rechercheOK && categorieOK && etatOK){
            row.style.display="";
        }else{
            row.style.display="none";
        }

    });

}

searchInput.addEventListener("keyup", filtrerTable);

categorieFilter.addEventListener("change", filtrerTable);

etatFilter.addEventListener("change", filtrerTable);