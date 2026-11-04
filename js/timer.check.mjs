import * as timer from "./timer.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const durations = { focus: 60_000, shortBreak: 30_000, longBreak: 90_000 };
let t0 = 1_000_000;

let state = timer.createIdleState();
let r = timer.start(state, {
  now: t0,
  durations,
  sessionType: "focus",
  timingMode: "countdown",
  taskLabel: "  ",
});
assert(!r.ok && r.error === "task-required", "empty task should fail");

r = timer.start(state, {
  now: t0,
  durations,
  sessionType: "focus",
  timingMode: "countdown",
  taskLabel: "write the timer",
});
assert(r.ok, "start should work");
state = r.state;
assert(state.endsAt === t0 + 60_000, "end timestamp set");
assert(timer.readClock(state, t0 + 10_000).remainingMs === 50_000, "remaining from timestamp");

r = timer.pause(state, t0 + 10_000);
state = r.state;
assert(state.remainingMs === 50_000, "pause freezes remaining");
r = timer.resume(state, t0 + 40_000);
state = r.state;
assert(state.endsAt === t0 + 90_000, "resume extends end time");

state = timer.settle(state, { now: t0 + 90_000, durations });
assert(state.sessionType === "shortBreak", "auto short break");
assert(state.endsAt === t0 + 90_000 + 30_000, "break starts at focus end");
assert(state.completedFocusCount === 1, "cycle increments");

state = timer.settle(state, { now: t0 + 90_000 + 30_000, durations });
assert(state.status === "idle", "break end goes idle");

state = timer.createIdleState({ completedFocusCount: 3 });
r = timer.start(state, {
  now: t0,
  durations,
  sessionType: "focus",
  timingMode: "countdown",
  taskLabel: "fourth",
});
state = timer.settle(r.state, { now: t0 + 60_000, durations });
assert(state.sessionType === "longBreak", "4th focus -> long break");
assert(state.completedFocusCount === 0, "cycle resets");

state = timer.createIdleState();
r = timer.start(state, {
  now: t0,
  durations,
  sessionType: "focus",
  timingMode: "stopwatch",
  taskLabel: "keep going",
});
state = r.state;
assert(timer.readClock(state, t0 + 5000).elapsedMs === 5000, "stopwatch elapsed");
assert(!timer.readClock(state, t0 + 5000).finished, "stopwatch never auto-finishes");
r = timer.skip(state, { now: t0 + 5000, durations });
assert(r.state.sessionType === "shortBreak", "skip focus starts break");

r = timer.reset(r.state);
assert(r.state.status === "idle", "reset idle");
assert(r.state.completedFocusCount === 1, "reset keeps cycle count");

console.log("timer checks passed");
