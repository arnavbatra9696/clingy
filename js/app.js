/**
 * Wires the page to the timer engine and storage.
 * This is the only file that reads or writes the DOM.
 */

import * as timer from "./timer.js";
import * as storage from "./storage.js";

const el = {
  clock: document.getElementById("clock"),
  status: document.getElementById("status"),
  error: document.getElementById("error"),
  task: document.getElementById("task-label"),
  start: document.getElementById("btn-start"),
  pause: document.getElementById("btn-pause"),
  skip: document.getElementById("btn-skip"),
  reset: document.getElementById("btn-reset"),
  durFocus: document.getElementById("dur-focus"),
  durShort: document.getElementById("dur-short"),
  durLong: document.getElementById("dur-long"),
  sessionButtons: document.querySelectorAll("[data-session]"),
  timingButtons: document.querySelectorAll("[data-timing]"),
};

const SESSION_LABELS = {
  [timer.SESSION.FOCUS]: "Focus",
  [timer.SESSION.SHORT_BREAK]: "Short break",
  [timer.SESSION.LONG_BREAK]: "Long break",
};

let state = timer.createIdleState();
let durations = { ...timer.DEFAULT_DURATIONS_MS };

function minutesToMs(value, fallbackMinutes) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return fallbackMinutes * 60 * 1000;
  return n * 60 * 1000;
}

function msToMinutes(ms) {
  return Math.round(ms / 60000);
}

function persist() {
  storage.save({ state, durations });
}

function applyDurationsFromInputs() {
  durations = {
    focus: minutesToMs(el.durFocus.value, 25),
    shortBreak: minutesToMs(el.durShort.value, 5),
    longBreak: minutesToMs(el.durLong.value, 15),
  };
}

function syncDurationInputs() {
  el.durFocus.value = String(msToMinutes(durations.focus));
  el.durShort.value = String(msToMinutes(durations.shortBreak));
  el.durLong.value = String(msToMinutes(durations.longBreak));
}

function isActive() {
  return state.status !== timer.STATUS.IDLE;
}

function setPressed(buttons, attr, value) {
  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset[attr] === value));
  });
}

function cycleText() {
  return `${state.completedFocusCount} of 4 focuses until a long break`;
}

function render() {
  const now = Date.now();
  const clock = timer.readClock(state, now);
  const idle = state.status === timer.STATUS.IDLE;

  let displayMs;
  if (state.timingMode === timer.TIMING.STOPWATCH && !idle) {
    displayMs = clock.elapsedMs;
  } else if (idle) {
    displayMs = timer.idlePreviewMs(state.sessionType, durations);
  } else {
    displayMs = clock.remainingMs;
  }

  el.clock.textContent = timer.formatTime(displayMs);

  const modeLabel = state.timingMode === timer.TIMING.STOPWATCH ? "Stopwatch" : "Countdown";
  const sessionLabel = SESSION_LABELS[state.sessionType];
  let phase = "Idle";
  if (state.status === timer.STATUS.RUNNING) phase = "Running";
  if (state.status === timer.STATUS.PAUSED) phase = "Paused";

  const taskBit = state.taskLabel ? ` · ${state.taskLabel}` : "";
  el.status.textContent = `${phase} · ${sessionLabel} · ${modeLabel}${taskBit} · ${cycleText()}`;

  setPressed(el.sessionButtons, "session", state.sessionType);
  setPressed(el.timingButtons, "timing", state.timingMode);
  el.task.value = state.taskLabel;

  const focusNeedsTask =
    state.sessionType === timer.SESSION.FOCUS && !el.task.value.trim();

  el.task.disabled = isActive();
  el.durFocus.disabled = isActive();
  el.durShort.disabled = isActive();
  el.durLong.disabled = isActive();
  el.sessionButtons.forEach((b) => {
    b.disabled = isActive();
  });
  el.timingButtons.forEach((b) => {
    b.disabled = isActive();
  });

  el.start.disabled = !idle || (state.sessionType === timer.SESSION.FOCUS && focusNeedsTask);

  if (state.status === timer.STATUS.RUNNING) {
    el.pause.textContent = "Pause";
    el.pause.disabled = false;
  } else if (state.status === timer.STATUS.PAUSED) {
    el.pause.textContent = "Resume";
    el.pause.disabled = false;
  } else {
    el.pause.textContent = "Pause";
    el.pause.disabled = true;
  }
  el.skip.disabled = idle;
  el.reset.disabled = idle;
}

function showError(message) {
  el.error.textContent = message ?? "";
}

function commitState(next) {
  state = next;
  persist();
  render();
}

function settleAndRender() {
  const settledState = timer.settle(state, { now: Date.now(), durations });
  if (settledState !== state) {
    state = settledState;
    persist();
  }
  render();
}

function restore() {
  const saved = storage.load();
  if (!saved) return;
  if (saved.durations) {
    durations = {
      focus: saved.durations.focus ?? durations.focus,
      shortBreak: saved.durations.shortBreak ?? durations.shortBreak,
      longBreak: saved.durations.longBreak ?? durations.longBreak,
    };
    syncDurationInputs();
  }
  if (saved.state) {
    state = { ...timer.createIdleState(), ...saved.state };
    state = timer.settle(state, { now: Date.now(), durations });
    persist();
  }
}

el.sessionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (isActive()) return;
    state = { ...state, sessionType: button.dataset.session };
    persist();
    showError("");
    render();
  });
});

el.timingButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (isActive()) return;
    state = { ...state, timingMode: button.dataset.timing };
    persist();
    render();
  });
});

el.task.addEventListener("input", () => {
  if (isActive()) return;
  state = { ...state, taskLabel: el.task.value };
  persist();
  showError("");
  render();
});

el.start.addEventListener("click", () => {
  applyDurationsFromInputs();
  const result = timer.start(state, {
    now: Date.now(),
    durations,
    sessionType: state.sessionType,
    timingMode: state.timingMode,
    taskLabel: el.task.value,
  });
  if (!result.ok) {
    showError(
      result.error === "task-required"
        ? "Name a micro-task before starting focus."
        : "Cannot start right now."
    );
    render();
    return;
  }
  showError("");
  commitState(result.state);
});

el.pause.addEventListener("click", () => {
  const now = Date.now();
  if (state.status === timer.STATUS.RUNNING) {
    const result = timer.pause(state, now);
    if (result.ok) commitState(result.state);
    return;
  }
  if (state.status === timer.STATUS.PAUSED) {
    const result = timer.resume(state, now);
    if (result.ok) commitState(result.state);
  }
});

el.skip.addEventListener("click", () => {
  applyDurationsFromInputs();
  const result = timer.skip(state, { now: Date.now(), durations });
  if (result.ok) {
    showError("");
    commitState(result.state);
  }
});

el.reset.addEventListener("click", () => {
  const result = timer.reset(state);
  showError("");
  commitState(result.state);
});

[el.durFocus, el.durShort, el.durLong].forEach((input) => {
  input.addEventListener("change", () => {
    if (isActive()) return;
    applyDurationsFromInputs();
    syncDurationInputs();
    persist();
    render();
  });
});

restore();
render();

setInterval(settleAndRender, 250);
