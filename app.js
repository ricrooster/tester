const STORAGE_KEY = "simple-task-list-v1";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const taskCount = document.getElementById("task-count");
const clearCompletedButton = document.getElementById("clear-completed");

let todos = loadTodos();

render();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    return;
  }

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });

  input.value = "";
  persistAndRender();
});

clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  persistAndRender();
});

list.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const deleteButton = target.closest(".delete-btn");
  if (!deleteButton) {
    return;
  }

  const item = deleteButton.closest(".todo-item");
  if (!item) {
    return;
  }

  const { id } = item.dataset;
  todos = todos.filter((todo) => todo.id !== id);
  persistAndRender();
});

list.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  if (target.type !== "checkbox") {
    return;
  }

  const item = target.closest(".todo-item");
  if (!item) {
    return;
  }

  const { id } = item.dataset;
  todos = todos.map((todo) =>
    todo.id === id
      ? { ...todo, completed: target.checked }
      : todo,
  );
  persistAndRender();
});

function render() {
  list.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item${todo.completed ? " completed" : ""}`;
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", `Mark "${todo.text}" as complete`);

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete "${todo.text}"`);

    li.append(checkbox, text, deleteButton);
    list.appendChild(li);
  });

  const total = todos.length;
  const remaining = todos.filter((todo) => !todo.completed).length;

  taskCount.textContent = `${remaining} remaining · ${total} total`;
  emptyState.hidden = total > 0;
  clearCompletedButton.disabled = !todos.some((todo) => todo.completed);
}

function persistAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  render();
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (todo) =>
        todo &&
        typeof todo.id === "string" &&
        typeof todo.text === "string" &&
        typeof todo.completed === "boolean",
    );
  } catch {
    return [];
  }
}
