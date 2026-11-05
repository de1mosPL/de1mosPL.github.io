const apiKey = "6db9565ee2c6fc47ddee94e3ed309f90";
const apiUrl = "https://api.openweathermap.org/data/2.5";

let cityInput = document.getElementById("city-input");
let message = document.getElementById("message");
let currentBox = document.getElementById("current");
let forecastBox = document.getElementById("forecast");

// wziąłem to z repozytorium z gita z katalogu 10-key-events z done.html (tam na window, u mnie na polu tekstowym)
cityInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    searchWeather();
  }
});

function searchWeather() {
  let city = cityInput.value.trim();

  if (city === "") {
    message.innerText = "Wpisz nazwę miejscowości.";
    return;
  }

  message.innerText = "Pobieram dane...";
  getCurrentWeather(city); // pogoda bieżąca (XMLHttpRequest)
  getForecast(city); // prognoza (fetch)
}

// wziąłem to z repozytorium z gita z katalogu 13-xmlhttprequest z json.html
// (korzystam z adresu API zamiast data.json i sprawdzam req.status)
function getCurrentWeather(city) {
  let url = `${apiUrl}/weather?q=${encodeURIComponent(city)}&units=metric&lang=pl&appid=${apiKey}`;

  let req = new XMLHttpRequest();
  req.open("GET", url, true);

  req.addEventListener("load", function (event) {
    let data = JSON.parse(req.responseText);
    console.log(data);

    if (req.status !== 200) {
      showError(req.status);
      return;
    }
    showCurrent(data);
  });

  req.addEventListener("error", function () {
    message.innerText = "Brak połączenia z internetem.";
  });

  req.send(null);
}

// wziąłem to z repozytorium z gita z katalogu 16-fetch-from-api z done.html
// (tutaj również korzystam z adresu API i sprawdzam response.ok)
async function getForecast(city) {
  const response = await fetch(`${apiUrl}/forecast?q=${encodeURIComponent(city)}&units=metric&lang=pl&appid=${apiKey}`);
  const data = await response.json();
  console.log(data);

  if (!response.ok) {
    showError(response.status);
    return;
  }
  showForecast(data);
}

// pomógł mi to robić github copilot (dodał mi więcej parametrów i zmienił strukturę html, w który go opakowuję)
function showCurrent(data) {
  let tz = data.timezone;

  currentBox.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <div class="current-main">
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" width="100" height="100" alt="${data.weather[0].description}">
      <span class="current-temp">${Math.round(data.main.temp)}°C</span>
      <span class="description">${data.weather[0].description}</span>
    </div>
    <ul class="details">
      <li>Odczuwalna: <b>${Math.round(data.main.feels_like)}°C</b></li>
      <li>Wilgotność: <b>${data.main.humidity}%</b></li>
      <li>Ciśnienie: <b>${data.main.pressure} hPa</b></li>
      <li>Wiatr: <b>${Math.round(data.wind.speed * 3.6)} km/h</b></li>
      <li>Zachmurzenie: <b>${data.clouds.all}%</b></li>
      <li>Wschód / zachód słońca: <b>${formatTime(data.sys.sunrise, tz)} / ${formatTime(data.sys.sunset, tz)}</b></li>
    </ul>
  `;

  message.innerText = "";
}

function showForecast(data) {
  let tz = data.city.timezone;
  let lastDay = "";
  let dayGrid;

  forecastBox.innerHTML = "";

  for (let item of data.list) {
    let day = formatDay(item.dt, tz);

    // nowy dzień to nowy nagłówek i nowa siatka (zrobił mi to github copilot)
    if (day !== lastDay) {
      let heading = document.createElement("h3");
      heading.innerText = day;
      forecastBox.appendChild(heading);

      dayGrid = document.createElement("div");
      dayGrid.className = "day-grid";
      forecastBox.appendChild(dayGrid);

      lastDay = day;
    }

    // wziąłem to z repozytorium z gita z katalogu 16-fetch-from-api z done.html
    let tile = document.createElement("div");
    tile.className = item.sys.pod === "n" ? "tile night" : "tile"; // "d" = dzień, "n" = noc
    tile.innerHTML = `
      <span class="hour">${formatTime(item.dt, tz)}</span>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" width="60" height="60" alt="${item.weather[0].description}">
      <span class="temp">${Math.round(item.main.temp)}°C</span>
      <span class="desc">${item.weather[0].description}</span>
      <span class="rain">Opady: ${Math.round(item.pop * 100)}%</span>
    `;
    dayGrid.appendChild(tile);
  }
}

function showError(status) {
  if (status === 404) {
    message.innerText = "Nie znaleziono takiej miejscowości.";
  } else if (status === 401) {
    message.innerText = "Błędny albo jeszcze nieaktywny klucz API (błąd 401).";
  } else {
    message.innerText = "Wystąpił błąd: " + status;
  }

  currentBox.innerHTML = `<p class="placeholder">Brak danych.</p>`;
  forecastBox.innerHTML = `<p class="placeholder">Brak danych.</p>`;
}

// zrobił mi to github copilot - API podaje czas w sekundach (UTC), a timezone to przesunięcie strefy czasowej miasta.
// Github copilot zrobił przesunięcie i formatowanie jako UTC, żeby była godzina lokalna tego miasta.
function formatTime(seconds, timezone) {
  let date = new Date((seconds + timezone) * 1000);
  return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

function formatDay(seconds, timezone) {
  let date = new Date((seconds + timezone) * 1000);
  return date.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}
