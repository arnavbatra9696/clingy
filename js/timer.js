/**
 * Clingy timer engine.
 * Pure logic only: no buttons, no HTML, no localStorage.
 *
 * Time is based on timestamps (when the session should end, or when
 * the stopwatch started), not on subtracting 1 every second.
 */

export const SESSION = {
  FOCUS: "focus",
  SHORT_BREAK: "shortBreak",
  LONG_BREAK: "longBreak",
};

export const TIMING = {
  COUNTDOWN: "countdown",
  STOPWATCH: "stopwatch",
};

export const STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  PAUSED: "paused",
};

export const DEFAULT_DURATIONS_MS = {
  focus: 25 * 60 * 1000,
  shortBreak: 5 * 60 * 1000,
  longBreak: 15 * 60 * 1000,
};

function isFocus(sessionType) {
  return sessionType === SESSION.FOCUS;
}

function durationFor(sessionType, durations) {
  if (sessionType === SESSION.FOCUS) return durations.focus;
  if (sessionType === SESSION.SHORT_BREAK) return durations.shortBreak;
  return durations.longBreak;
}

export function createIdleState(overrides = {}) {
  return {
    status: STATUS.IDLE,
    sessionType: SESSION.FOCUS,
    timingMode: TIMING.COUNTDOWN,
    taskLabel: "",
    endsAt: null,
    remainingMs: null,
    startedAt: null,
    elapsedMs: 0,
    plannedDurationMs: null,
    completedFocusCount: 0,
    ...overrides,
  };
}

/**
 * After a focus finishes or is skipped, pick short vs long break.
 * Four completed focuses → long break, then the cycle count resets.
 */
export function nextBreakAfterFocus(completedFocusCount) {
  const next = completedFocusCount + 1;
  if (next % 4 === 0) {
    return {
      sessionType: SESSION.LONG_BREAK,
      completedFocusCount: 0,
    };
  }
  return {
    sessionType: SESSION.SHORT_BREAK,
    completedFocusCount: next,
  };
}

function startBreakState({ durations, breakType, completedFocusCount, startedAt }) {
  const planned = durationFor(breakType, durations);
  return {
    status: STATUS.RUNNING,
    sessionType: breakType,
    timingMode: TIMING.COUNTDOWN,
    taskLabel: "",
    endsAt: startedAt + planned,
    remainingMs: planned,
    startedAt: null,
    elapsedMs: 0,
    plannedDurationMs: planned,
    completedFocusCount,
  };
}

export function start(state, { now, durations, sessionType, timingMode, taskLabel }) {
  if (state.status !== STATUS.IDLE) {
    return { ok: false, error: "already-active", state };
  }

  const type = sessionType ?? state.sessionType;
  const timing = timingMode ?? state.timingMode;
  const label = (taskLabel ?? state.taskLabel).trim();

  if (isFocus(type) && !label) {
    return { ok: false, error: "task-required", state };
  }

  const planned = durationFor(type, durations);

  if (timing === TIMING.STOPWATCH) {
    return {
      ok: true,
      state: {
        ...state,
        status: STATUS.RUNNING,
        sessionType: type,
        timingMode: TIMING.STOPWATCH,
        taskLabel: isFocus(type) ? label : "",
        startedAt: now,
        elapsedMs: 0,
        endsAt: null,
        remainingMs: null,
        plannedDurationMs: planned,
      },
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      status: STATUS.RUNNING,
      sessionType: type,
      timingMode: TIMING.COUNTDOWN,
      taskLabel: isFocus(type) ? label : "",
      endsAt: now + planned,
      remainingMs: planned,
      startedAt: null,
      elapsedMs: 0,
      plannedDurationMs: planned,
    },
  };
}

export function pause(state, now) {
  if (state.status !== STATUS.RUNNING) {
    return { ok: false, error: "not-running", state };
  }

  if (state.timingMode === TIMING.STOPWATCH) {
    return {
      ok: true,
      state: {
        ...state,
        status: STATUS.PAUSED,
        elapsedMs: Math.max(0, now - state.startedAt),
        startedAt: null,
      },
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      status: STATUS.PAUSED,
      remainingMs: Math.max(0, state.endsAt - now),
      endsAt: null,
    },
  };
}

export function resume(state, now) {
  if (state.status !== STATUS.PAUSED) {
    return { ok: false, error: "not-paused", state };
  }

  if (state.timingMode === TIMING.STOPWATCH) {
    return {
      ok: true,
      state: {
        ...state,
        status: STATUS.RUNNING,
        startedAt: now - state.elapsedMs,
      },
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      status: STATUS.RUNNING,
      endsAt: now + state.remainingMs,
    },
  };
}

export function reset(state) {
  return {
    ok: true,
    state: createIdleState({
      sessionType: SESSION.FOCUS,
      timingMode: state.timingMode,
      completedFocusCount: state.completedFocusCount,
    }),
  };
}

export function skip(state, { now, durations }) {
  if (state.status === STATUS.IDLE) {
    return { ok: false, error: "idle", state };
  }

  if (isFocus(state.sessionType)) {
    const next = nextBreakAfterFocus(state.completedFocusCount);
    return {
      ok: true,
      state: startBreakState({
        durations,
        breakType: next.sessionType,
        completedFocusCount: next.completedFocusCount,
        startedAt: now,
      }),
    };
  }

  return {
    ok: true,
    state: createIdleState({
      timingMode: TIMING.COUNTDOWN,
      completedFocusCount: state.completedFocusCount,
    }),
  };
}

export function readClock(state, now) {
  if (state.status === STATUS.IDLE) {
    return { remainingMs: null, elapsedMs: 0, finished: false };
  }

  if (state.timingMode === TIMING.STOPWATCH) {
    const elapsed =
      state.status === STATUS.RUNNING
        ? Math.max(0, now - state.startedAt)
        : state.elapsedMs;
    return { remainingMs: null, elapsedMs: elapsed, finished: false };
  }

  const remaining =
    state.status === STATUS.RUNNING
      ? Math.max(0, state.endsAt - now)
      : Math.max(0, state.remainingMs ?? 0);
  const planned = state.plannedDurationMs ?? 0;

  return {
    remainingMs: remaining,
    elapsedMs: Math.max(0, planned - remaining),
    finished: remaining === 0 && state.status === STATUS.RUNNING,
  };
}

/**
 * If a countdown already passed its end time (tab slept, laptop closed),
 * finish that session. Auto-started breaks begin at the focus end time,
 * so a long sleep can finish the break too.
 */
export function settle(state, { now, durations }) {
  let current = state;

  while (
    current.status === STATUS.RUNNING &&
    current.timingMode === TIMING.COUNTDOWN &&
    now >= current.endsAt
  ) {
    const finishedAt = current.endsAt;
    if (isFocus(current.sessionType)) {
      const next = nextBreakAfterFocus(current.completedFocusCount);
      current = startBreakState({
        durations,
        breakType: next.sessionType,
        completedFocusCount: next.completedFocusCount,
        startedAt: finishedAt,
      });
    } else {
      current = createIdleState({
        timingMode: TIMING.COUNTDOWN,
        completedFocusCount: current.completedFocusCount,
      });
    }
  }

  return current;
}

export function idlePreviewMs(sessionType, durations) {
  return durationFor(sessionType, durations);
}

export function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}
