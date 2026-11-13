/* JS mínimo: menú en celular y año del pie. Los enlaces de WhatsApp ya vienen armados en el HTML. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- Menú hamburguesa (celular y tablet) ---------- */
  var boton = document.querySelector(".nav__boton");
  var menu = document.getElementById("nav-menu");
  if (boton && menu) {
    boton.hidden = false;
    var abrir = function (estado) {
      boton.setAttribute("aria-expanded", String(estado));
      menu.classList.toggle("abierto", estado);
    };
    boton.addEventListener("click", function () {
      abrir(boton.getAttribute("aria-expanded") !== "true");
    });
    // Cerrar al elegir una sección
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) abrir(false);
    });
    // Cerrar con Escape y devolver el foco al botón
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && boton.getAttribute("aria-expanded") === "true") {
        abrir(false);
        boton.focus();
      }
    });
  }

  /* ---------- Año actual en el pie ---------- */
  document.querySelectorAll("[data-anio]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
