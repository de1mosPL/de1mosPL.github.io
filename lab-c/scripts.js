// kod wziąłem z repozytorium z gita z katalogu 04-js-apis i go przerobiłem (to, czego nie było w repo, dodał github copilot)

const COLS = 4; // puzzle w poziomie
const ROWS = 4; // puzzle w pionie
const PIECES = COLS * ROWS;

// wziąłem to z repozytorium gita z katalogu 26-maps-leaflet z leaflet.html
let rasterMap = document.getElementById("rasterMap");
let rasterContext = rasterMap.getContext("2d");
// a stół, planszę i rozmiar jednego puzzla dodał github copilot (moja wersja się rozjeżdżała)
let table = document.getElementById("table");
let board = document.getElementById("board");
let pieceWidth = Math.floor(rasterMap.width / COLS);
let pieceHeight = Math.floor(rasterMap.height / ROWS);

// wzięte z repozytorium z gita z katalogu 26-maps-leaflet z leaflet.html
let map = L.map("map").setView([53.430127, 14.564802], 18);
L.tileLayer.provider("Esri.WorldImagery").addTo(map);
// w repozytorium git marker był od razu na mapie, a github copilot
// zrobił tak, że pojawia się dopiero po kliknięciu "Moja lokalizacja"
let marker = null;

// powiadomienia dodał github copilot
function askForNotifications() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().then(permission => console.log("Powiadomienia: " + permission));
  }
}

askForNotifications();

// wziąłem z repozytorium z gita z katalogu 25-geolocation z geolocation.html, a
// github copilot przerobił to tak, żeby pytało o zgodę na lokalizację od razu po wejściu na stronę
navigator.geolocation.getCurrentPosition(
  () => console.log("Lokalizacja: zgoda udzielona"),
  positionError => console.error(positionError)
);

// wziąłem przycisk z repozytorium z gita z katalogu 26-maps-leaflet
// z leaflet.html (a wpisywanie współrzędnych na stronę z 25-geolocation z geolocation.html)
document.getElementById("getLocation").addEventListener("click", function () {
  // dodał to github copilot, bo firefox pyta o powiadomienia dopiero po kliknięciu
  askForNotifications();

  if (!navigator.geolocation) {
    console.log("No geolocation.");
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    console.log(position);
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    document.getElementById("latitude").innerText = lat;
    document.getElementById("longitude").innerText = lon;

    map.setView([lat, lon]);
    // marker i bindPopup są z leaflet.html, ale przestawianie markera przy kolejnym
    // kliknięciu (setLatLng) i otwieranie dymka (openPopup) dodał github copilot
    if (!marker) marker = L.marker([lat, lon]).addTo(map);
    marker.setLatLng([lat, lon]).bindPopup("<strong>Tu jesteś!</strong>").openPopup();
  }, positionError => {
    console.error(positionError);
    // github copilot dodał alert z błędem
    alert("Nie udało się pobrać lokalizacji: " + positionError.message);
  });
});

// wziąłem przycisk z repozytorium z gita z katalogu 26-maps-leaflet
// z leaflet.html (zapis mapy do canvas przez leafletImage)
document.getElementById("saveButton").addEventListener("click", function () {
  askForNotifications(); // dodane przez github copilot

  leafletImage(map, function (err, canvas) {
    rasterContext.drawImage(canvas, 0, 0, rasterMap.width, rasterMap.height);
    createPuzzle(); // dodane przez github copilot
  });
});

// plansza, którą poprawił mi github copilot (robi tyle pól, ile jest
// puzzli, czyli COLS x ROWS a moja wersja się trochę rozjeżdżała)
function createBoard() {
  board.style.gridTemplateColumns = `repeat(${COLS}, ${pieceWidth}px)`;
  board.style.gridTemplateRows = `repeat(${ROWS}, ${pieceHeight}px)`;

  for (let i = 0; i < PIECES; i++) {
    let slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = i; // który puzzel pasuje do tego pola
    addDropEvents(slot);
    board.appendChild(slot);
  }
}

// podział mapy na puzzle tak, że każdy puzzel to osobny canvas naprawił mi github copilot,
// oprócz drawImage, które wziąłem z repozytorium
function createPuzzle() {
  table.innerHTML = "";
  for (let slot of board.children) slot.innerHTML = "";

  // wymieszane puzzle na stole
  let order = [...Array(PIECES).keys()].sort(() => Math.random() - 0.5);

  for (let i of order) {
    let x = (i % COLS) * pieceWidth // kolumna
    let y = Math.floor(i / COLS) * pieceHeight; // wiersz

    let piece = document.createElement("canvas");
    piece.width = pieceWidth;
    piece.height = pieceHeight;
    piece.id = "piece-" + i;
    piece.className = "item"; // nazwa klasy "item" wziąłem z repozytorium gita z 22-drag-and-drop z drag-and-drop.html
    piece.draggable = true;
    piece.dataset.index = i;

    // wziąłem z repozytorium z gita z katalogu 18-canvas-images z canvas-images.html
    piece.getContext("2d").drawImage(rasterMap, x, y, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);

    addDragEvents(piece);
    table.appendChild(piece);
  }
  console.debug("Mapa podzielona na " + PIECES + " puzzli");
}

// wziąłem drag & drop z repozytorium z gita z katalogu 22-drag-and-drop
// z drag-and-drop.html (w repozytorium była ramka style.border, ale github copilot zmienił ją
// na przezroczystość, bo przez ramkę puzzle się przesuwały)
function addDragEvents(item) {
  item.addEventListener("dragstart", function (event) {
    this.style.opacity = "0.5";
    event.dataTransfer.setData("text", this.id);
  });
  item.addEventListener("dragend", function () {
    this.style.opacity = "1";
  });
}

// miejsca upuszczenia (pola planszy i stół) wziąłem z repozytorium z gita z katalogu
// 22-drag-and-drop z drag-and-drop.html (w repozytorium kolor zmieniał się przez style.border,
// a tutaj jest klasa "over" z .css)
function addDropEvents(target) {
  target.addEventListener("dragenter", function () {
    this.classList.add("over");
  });
  // sprawdzanie relatedTarget dodał github copilot, żeby podświetlenie nie znikało nad puzzlem
  target.addEventListener("dragleave", function (event) {
    if (!this.contains(event.relatedTarget)) this.classList.remove("over");
  });
  target.addEventListener("dragover", function (event) {
    event.preventDefault();
  });
  target.addEventListener("drop", function (event) {
    event.preventDefault();
    this.classList.remove("over");

    // w repozytorium było querySelector("#" + ...), a github copilot zmienił to na getElementById
    let myElement = document.getElementById(event.dataTransfer.getData("text"));
    if (!myElement) return;

    // github copilot naprawił mi zamiana puzzli (bo w mojej wersji stary puzzel nie zmieniał
    // miejsca prawidłowo) jak pole jest zajęte, to stary puzzel idzie tam, skąd przyszedł nowy
    let oldPiece = this.querySelector(".item");
    if (this !== table && oldPiece && oldPiece !== myElement) {
      myElement.parentElement.appendChild(oldPiece);
    }

    this.appendChild(myElement);
    checkPuzzle(); // dodane przez github copilot
  });
}

// github copilot
function checkPuzzle() {
  let correct = 0;
  for (let slot of board.children) {
    let piece = slot.querySelector(".item");
    if (piece && piece.dataset.index === slot.dataset.index) correct++;
  }

  console.debug(`Ułożone poprawnie: ${correct}/${PIECES}`);

  if (correct === PIECES) {
    console.debug("Wszystkie puzzle ułożone!");
    showNotification();
  }
}

// powiadomienie systemowe wziąłem z dokumentacji MDN (z linku), a alerty, gdy
// przeglądarka nie ma powiadomień albo są zablokowane, dodał github copilot
function showNotification() {
  let title = "Puzzle ułożone!";
  let options = { body: "Brawo! Wszystkie puzzle mapy są na swoim miejscu." };

  if (!("Notification" in window)) {
    alert(title);
  } else if (Notification.permission === "granted") {
    new Notification(title, options);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") new Notification(title, options);
    });
  } else {
    alert(title + " (powiadomienia są zablokowane w przeglądarce)");
  }
}

createBoard();
addDropEvents(table);
