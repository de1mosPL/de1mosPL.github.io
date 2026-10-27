class Todo {
  constructor() {
    this.list = document.getElementById("list");
    this.tasks = []; // zadania: { text: "...", date: "2026-11-01" albo "" }
    this.term = ""; // fraza wpisana w wyszukiwarkę
    this.editingIndex = null; // numer edytowanego zadania (null = żadne)
    this.load();
    this.draw();
  }

  save() {
    localStorage.setItem("todo", JSON.stringify(this.tasks));
  }

  load() {
    const saved = localStorage.getItem("todo");
    if (saved) {
      this.tasks = JSON.parse(saved);
    }
  }

  validate(text, date) { // zwraca true, gdy dane są poprawne, a jeśli nie to alert o błędzie w wprowadzanych danych
    if (text.length < 3 || text.length > 255) {
      alert("Zadanie musi mieć od 3 do 255 znaków.");
      return false;
    }
    const today = new Date(); // moje sprawdzanie daty było wadliwe więc github copilot naprawił
    today.setHours(0, 0, 0, 0); // dzisiaj o północy, więc dzisiejsza data też przejdzie (to zrobił github copilot)
    if (date !== "" && new Date(date + "T00:00") < today) { // + T00:00, żeby data była liczona w czasie lokalnym (+ T00:00 dodał github copilot)
      alert("Data musi być pusta albo w przyszłości.");
      return false;
    }
    return true;
  }

  add(text, date) {
    text = text.trim();
    if (!this.validate(text, date)) {
      return false;
    }
    this.tasks.push({ text: text, date: date });
    this.save();
    this.draw();
    return true;
  }

  remove(index) {
    this.tasks.splice(index, 1);
    this.editingIndex = null;
    this.save();
    this.draw();
  }

  startEdit(index) {
    this.editingIndex = index;
    this.draw();
    this.editText.focus();
  }

  saveEdit() {  // zapisuje zmiany z pól edycji, zwraca false, gdy dane są błędne
    const task = this.tasks[this.editingIndex];
    const text = this.editText.value.trim();
    const date = this.editDate.value;
    if (!this.validate(text, date === task.date ? "" : date)) { // github copilot dodał date === task.date ? "" : date, żeby nie weryfikować daty gdy się nie zmieniła
      return false;
    }
    this.tasks[this.editingIndex] = { text: text, date: date };
    this.editingIndex = null;
    this.save();
    this.draw();
    return true;
  }

  getFilteredTasks() { // zadania zawierające szukaną frazę
    if (this.term.length < 2) {
      return this.tasks;
    }
    const term = this.term.toLowerCase();
    return this.tasks.filter(task => task.text.toLowerCase().includes(term));
  }

  highlight(text) { // zwraca <span> z tekstem zadania, w którym szukana fraza jest w <mark>
    const span = document.createElement("span"); // stworzenie span
    if (this.term.length < 2) {
      span.textContent = text; // dzięki textContent tekst jest zwykłym testem, a nie html
      return span;
    }
    const lowerText = text.toLowerCase();
    const term = this.term.toLowerCase();
    let start = 0;
    let pos = lowerText.indexOf(term);
    while (pos !== -1) { // tutaj pomagał github copilot
      span.append(text.slice(start, pos)); // tekst przed frazą
      const mark = document.createElement("mark");
      mark.textContent = text.slice(pos, pos + term.length); // sama fraza
      span.append(mark);
      start = pos + term.length;
      pos = lowerText.indexOf(term, start); // kolejne wystąpienie frazy
    }
    span.append(text.slice(start)); // reszta tekstu
    return span;
  }

  draw() { // czyści listę i rysuje ją od nowa na podstawie tablicy tasks
    this.list.innerHTML = "";
    for (const task of this.getFilteredTasks()) {
      const index = this.tasks.indexOf(task); // numer w całej tablicy, a nie w przefiltrowanej
      const li = document.createElement("li");
      li.dataset.index = index;

      if (index === this.editingIndex) {
        this.editText = document.createElement("input"); // to dodał github copilot
        this.editText.value = task.text;
        this.editDate = document.createElement("input"); // to dodał github copilot
        this.editDate.type = "date";
        this.editDate.value = task.date;
        li.append(this.editText, this.editDate);
      } else {
        li.append(this.highlight(task.text));
        if (task.date !== "") {
          const date = document.createElement("small");
          date.textContent = task.date.split("-").reverse().join("."); // zmiana formatu wyświetlania daty (2026-11-01 -> 01.11.2026)
          li.append(date);
        }
      }
      const button = document.createElement("button");
      button.textContent = "Usuń";
      li.append(button);
      this.list.append(li);
    }
  }
}

const todo = new Todo();
document.todo = todo; // do testów w konsoli, np. document.todo.add("Test", "") (github copilot mi to dodał)

document.getElementById("add-form").addEventListener("submit", (event) => { // dodawanie zadania
  event.preventDefault(); // formularz nie będzie przeładował strony
  const text = document.getElementById("new-text");
  const date = document.getElementById("new-date");
  if (todo.add(text.value, date.value)) {
    text.value = "";
    date.value = "";
  }
});

document.getElementById("search").addEventListener("input", (event) => { // odświerzanie listy wyszukiwania po każdym znaku
  todo.term = event.target.value.trim();
  todo.draw();
});

document.addEventListener("click", (event) => { // obsługa kliknięć na stronie (edycja, usuwanie i zapis po kliknięciu obok listy)
  const li = event.target.closest("li"); // zadanie, w które kliknięto (albo null)
  const index = li ? Number(li.dataset.index) : null;
  if (todo.editingIndex !== null && index !== todo.editingIndex) { // kliknięcie poza edytowanym zadaniem zapisuje zmiany
    if (!todo.saveEdit()) {
      return; // błędne dane (trzeba pozostać w trybie edycji)
    }
  }
  if (index === null) {
    return; // kliknięto poza listą
  }
  if (event.target.tagName === "BUTTON") {
    todo.remove(index);
  } else if (index !== todo.editingIndex) {
    todo.startEdit(index);
  }
});
