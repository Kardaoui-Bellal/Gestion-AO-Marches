document.addEventListener("DOMContentLoaded", () => {
  // ==========================
  // Evolution des appels d'offres
  // ==========================

  const aoChart = echarts.init(document.getElementById("aoChart"));

  aoChart.setOption({
    tooltip: {
      trigger: "axis",
    },

    xAxis: {
      type: "category",
      data: [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Août",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
      ],
    },

    yAxis: {
      type: "value",
    },

    series: [
      {
        data: [2, 4, 5, 3, 6, 8, 5, 7, 9, 8, 6, 10],

        type: "line",

        smooth: true,

        areaStyle: {},
      },
    ],
  });

  // ==========================
  // Répartition des marchés
  // ==========================

  const statusChart = echarts.init(document.getElementById("statusChart"));

  statusChart.setOption({
    tooltip: {
      trigger: "item",
    },

    legend: {
      bottom: 0,
    },

    series: [
      {
        type: "pie",

        radius: "65%",

        data: [
          { value: 18, name: "En cours" },

          { value: 9, name: "Terminés" },

          { value: 5, name: "Expirés" },

          { value: 4, name: "Suspendus" },
        ],
      },
    ],
  });

  // ==========================
  // Budget annuel
  // ==========================

  const budgetChart = echarts.init(document.getElementById("budgetChart"));

  budgetChart.setOption({
    tooltip: {},

    xAxis: {
      type: "category",

      data: ["2021", "2022", "2023", "2024", "2025", "2026"],
    },

    yAxis: {
      type: "value",
    },

    series: [
      {
        type: "bar",

        data: [
          3.2,

          4.5,

          5.8,

          6.7,

          7.3,

          8.4,
        ],
      },
    ],
  });

  // ==========================
  // Répartition par domaine
  // ==========================

  const domainChart = echarts.init(document.getElementById("domainChart"));

  domainChart.setOption({
    tooltip: {
      trigger: "item",
    },

    legend: {
      bottom: 0,
    },

    series: [
      {
        type: "pie",

        radius: ["45%", "70%"],

        data: [
          {
            value: 15,

            name: "Matériel",
          },

          {
            value: 9,

            name: "Logiciels",
          },

          {
            value: 6,

            name: "Maintenance",
          },

          {
            value: 4,

            name: "Sécurité",
          },

          {
            value: 5,

            name: "Réseau",
          },
        ],
      },
    ],
  });
});
// ========================================
// Animation des compteurs
// ========================================

function animateValue(element, start, end, duration) {
  let startTimestamp = null;

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;

    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    element.textContent = Math.floor(progress * (end - start) + start);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

document.querySelectorAll(".stat-card h3").forEach((counter) => {
  const value = parseInt(counter.textContent.replace(/\D/g, ""));

  if (!isNaN(value)) {
    animateValue(counter, 0, value, 1200);
  }
});

// ========================================
// Responsive Charts
// ========================================

window.addEventListener("resize", () => {
  aoChart.resize();

  statusChart.resize();

  budgetChart.resize();

  domainChart.resize();
});

// ========================================
// Notification
// ========================================

const notificationBtn = document.querySelector(".notification-btn");

if (notificationBtn) {
  notificationBtn.addEventListener("click", () => {
    alert("Vous avez 4 nouvelles notifications.");
  });
}

// ========================================
// Hover des cartes
// ========================================

document.querySelectorAll(".stat-card").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-8px)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

// ========================================
// Hover mini cartes
// ========================================

document.querySelectorAll(".mini-card").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-6px)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

// ========================================
// Boutons Voir
// ========================================

document.querySelectorAll(".btn-light").forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();

    console.log("Consultation de l'élément.");
  });
});

// ========================================
// Animation activité récente
// ========================================

const activities = document.querySelectorAll(".activity-item");

activities.forEach((item, index) => {
  item.style.opacity = "0";

  item.style.transform = "translateY(25px)";

  setTimeout(() => {
    item.style.transition = "0.5s";

    item.style.opacity = "1";

    item.style.transform = "translateY(0)";
  }, index * 180);
});

// ========================================
// Message console
// ========================================

console.log(
  "%cDashboard ORMVA/SM chargé avec succès.",
  "color:green;font-size:15px;font-weight:bold;",
);
