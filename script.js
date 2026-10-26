(function () {
  "use strict";

  var KEY = "proteines-du-jour";

  var elTotal = document.getElementById("total");
  var elDate = document.getElementById("date");
  var elEntries = document.getElementById("entries");
  var elEmpty = document.getElementById("empty");
  var elSheet = document.getElementById("sheet");
  var elAmount = document.getElementById("amount");
  var elError = document.getElementById("error");

  // Date locale au format AAAA-MM-JJ (change à minuit, heure de l'appareil)
  function today() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var j = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + j;
  }

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY));
      if (data && data.day === today() && Array.isArray(data.entries)) return data;
    } catch (e) {}
    return { day: today(), entries: [] }; // nouveau jour ou rien d'enregistré : retour à zéro
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  var state = load();

  function fmt(n) {
    return String(Math.round(n * 10) / 10).replace(".", ",");
  }

  function render() {
    // Si minuit est passé, on repart à zéro
    if (state.day !== today()) {
      state = { day: today(), entries: [] };
      save(state);
    }

    var total = state.entries.reduce(function (s, e) { return s + e.g; }, 0);
    elTotal.textContent = fmt(total);

    elDate.textContent = new Date().toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long"
    });

    elEntries.innerHTML = "";
    state.entries.slice().reverse().forEach(function (entry, idxFromEnd) {
      var index = state.entries.length - 1 - idxFromEnd;
      var li = document.createElement("li");

      var left = document.createElement("span");
      left.textContent = "+ " + fmt(entry.g) + " g";
      var time = document.createElement("span");
      time.className = "time";
      time.textContent = entry.t;
      left.appendChild(time);

      var del = document.createElement("button");
      del.type = "button";
      del.setAttribute("aria-label", "Supprimer cet ajout");
      del.textContent = "×";
      del.addEventListener("click", function () {
        state.entries.splice(index, 1);
        save(state);
        render();
      });

      li.appendChild(left);
      li.appendChild(del);
      elEntries.appendChild(li);
    });

    elEmpty.hidden = state.entries.length > 0;
  }

  function openSheet() {
    elAmount.value = "";
    elError.hidden = true;
    elSheet.hidden = false;
    elAmount.focus();
  }

  function closeSheet() {
    elSheet.hidden = true;
  }

  function add() {
    var g = parseFloat(String(elAmount.value).replace(",", "."));
    if (!isFinite(g) || g <= 0) {
      elError.textContent = "Entre un nombre supérieur à 0.";
      elError.hidden = false;
      return;
    }
    var now = new Date();
    state.entries.push({
      g: g,
      t: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    });
    save(state);
    closeSheet();
    render();
  }

  document.getElementById("open").addEventListener("click", openSheet);
  document.getElementById("cancel").addEventListener("click", closeSheet);
  document.getElementById("add").addEventListener("click", add);
  elAmount.addEventListener("keydown", function (e) { if (e.key === "Enter") add(); });
  elSheet.addEventListener("click", function (e) { if (e.target === elSheet) closeSheet(); });

  // Réinitialisation à minuit : à chaque retour sur la page, et par minuteur
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) render();
  });
  setInterval(render, 30 * 1000);

  render();
})();

