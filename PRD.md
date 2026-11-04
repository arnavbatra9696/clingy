# Clingy: Product Requirements Document

**Owner:** Arnav (design generalist, beginner programmer)
**Platform:** Windows 11 for v1 (keep the code cross-platform)
**Target:** a working v1 in about one week
**Status:** Final. Start building at Milestone 1 (M1).

---

## 1. Overview

Clingy is an always-on-top focus timer widget for Windows. A cute "girlfriend" character lives in the widget. She sulks while you work, softens as the session goes on, and rewards you with a kiss when your break starts.

**Pitch:** A floating focus timer for students and young professionals that keeps you on task by acting like a dramatic, clingy girlfriend who only forgives you when the session is done.

**v1 principle:** bare-bones functionality. v1 has the persona, efficient timers, and a session logging system. Everything else is later.

## 2. Problem

- Good-looking timers are often paid, run as web apps, or do not behave as a widget that lives above other windows.
- Many polished timers target Mac features such as the notch, not Windows.
- Phone timers are a distraction. Most work happens on a laptop or tablet, and picking up a phone breaks your train of thought.
- A browser tab is a poor desktop widget because it is stuck inside a rectangular window.
- People who work or study alone tend to write big tasks that feel daunting, and then drift.

**Owner's story:** Arnav searched for a good Windows timer that works in picture-in-picture and looks good. The best one he found (Flocus) did not have enough personality, and apps like Forest, where you grow a plant, are paid and on iOS. He also picked the stopwatch instead of the countdown by mistake, started doing something else, and came back to the timer about 3 hours later.

## 3. Users

- A 23-year-old Bangalore-based design generalist who is vibe coding his next project.
- A 19-year-old entrepreneur trying to focus his way through his day.

Wider audience: students and working professionals aged 18-25 in metropolitan cities, including self-employed people who need structure in their focus sessions.

## 4. Goals and success

**Goals:**
1. Help users finish small tasks inside a session instead of drifting.
2. Make a timer people enjoy looking at, not just tolerate.
3. Ship a Windows v1 that the owner uses every day.

**Success for v1:**
- The owner uses it daily for two weeks.
- A number of users complete 10 or more sessions each (no target number set yet).

## 5. Product principles

1. **Small tasks win.** Every focus session starts with one small task the user names.
2. **Present but never in the way.** The widget stays visible like a desktop pet, but it never steals keyboard focus or blocks typing. The biggest worry is that messages distract from the focus session, so messages are short and rare.
3. **Dramatic, not harmful.** The character is playful and fun. She must never traumatize, shame, or guilt-trip anyone.
4. **Accurate above all.** The timer stays correct after sleep, lag, or a crash.
5. **Local first.** Data stays on the user's machine in v1.
6. **Kisses as the game.** Each completed session earns a kiss, so the number of kisses is the number of sessions completed.

## 6. Character

**Concept:** the copy and character pose as a hypothetical girlfriend who is upset with the user until the session is done. At the start of a break the widget moves to the center of the screen and she blows a kiss.

**Personality:** passive-aggressive, kind, and forgiving. She comes across as someone who genuinely wants to spend time with the user, understands that the focus task is important, and comes around as the session progresses. Her mood builds to a crescendo: a kiss to start the break.

**Tone limits (all apply):**
- No swearing.
- No real guilt or shame.
- No jealousy of real people.
- Nothing that implies the user is a bad person.
- Nobody should feel hurt by a virtual girlfriend. Fun and personality come first.

**Visual style:** cute, minimal, and not distracting. The art is AI-generated 3D (reference: https://img.favpng.com/3/11/24/3d-woman-avatar-stylized-cartoon-woman-avatar-with-glasses-g0FutwYY.jpg). v1 uses still images for each state, and only the kiss moment is animated. The owner has a pop-star wallpaper as a mood reference for the kiss. Use it as inspiration only: the character must be an original, not a likeness of a real person.

**Character count:** one character (the girlfriend) in v1. The system should allow more characters later.

### States

| State | Expression | Widget behavior |
|---|---|---|
| Idle | Waiting, a little hopeful | Small, in a corner |
| Focus (early) | Pouting, arms crossed, head turned to the side | Corner |
| Focus (middle) | Miffed, sighing | Corner, subtle idle motion |
| Focus (last two minutes) | Softening, peeking at the user | Corner, expression warms up |
| Break starts | Overjoyed, blows a kiss (animated) | Glides to the center, stays there for the whole break |
| Break ends | Pouty again | Returns to the corner |
| Paused | "Where are you going?" (reuse the miffed image) | Corner |
| Abandoned session | Dramatic betrayal | Corner |

That is 6 images: idle, pouting, miffed, softening, kiss (animated), and betrayal.

### Copy

- The owner writes the copy lines. Until then, use clearly marked placeholders such as `[copy: focus_start_1]`.
- Keep lines in a data file (for example `copy.json`), grouped by state, and pick one at random.
- **Message budget (proposed):** at most one line at session start, one mid-session, one in the last two minutes, and one at break start. No other messages during focus.

## 7. Features

### Must have (v1)

1. **Timer core:** start, pause, resume, reset.
2. **Modes:** focus, short break, long break (countdown), plus a stopwatch mode.
3. **Micro-task label:** required before a focus session starts. Show a hint such as "small enough to finish in this session".
4. **Completion check:** when a focus session ends she asks "Did you finish it?" (yes, partly, no). Session completion depends on this answer, so it is required in v1.
5. **Widget window:** small, frameless, draggable, always on top of other windows.
6. **Character states and copy:** as described above.
7. **Break behavior:** at the start of a break the widget moves to the center and stays for the whole break, then returns to the corner when the break ends.
8. **Session log:** every session is saved locally.
9. **Durations:** defaults are 25 minutes focus, 5 minutes short break, and 15 minutes long break after 4 focus sessions. Users can change them, and the first-run setup asks for them.

### Should have (if time allows in v1)

1. **Kiss counter:** shows total kisses earned (completed sessions).
2. **Simple stats:** today, this week, streak, focus hours per day.
3. **Tray icon and global shortcuts** (defaults: Ctrl+Alt+Space start/pause, Ctrl+Alt+H show/hide; make them changeable).
4. **Settings:** opacity, size, turn off the move-to-center, hide from screen share.

### Later

- Launch at login
- CSV export, and editing or deleting sessions
- Export of session data to Obsidian or Notion
- More characters (original characters only; a real person's likeness would need permission)
- Themes
- Mac and Linux builds
- An idle check-in for stopwatch mode (for example after a long run)
- An end-of-session sound (removed from v1: the kiss and the move to the center are the signal)

### Out of scope

Accounts, sync, cloud storage, mobile apps, analytics or user tracking, and task-app integrations.

## 8. Widget behavior

- **Size:** small, about 240 by 120 pixels, fixed in v1.
- **Controls:** start, pause, skip, and reset are visible; anything else appears on hover.
- **Position:** remembers where the user placed it. During focus it sits in a corner.
- **Always on top:** stays above normal windows. It stays **hidden over fullscreen apps and games** and shows again when the user leaves fullscreen. Cursor needs to research how to detect fullscreen on Windows.
- **Screen share:** a setting turns off the move-to-center. The widget should also not appear in a screen share or capture where the operating system allows it (in Electron, look at content protection).
- **Mouse and keyboard:** the widget never steals keyboard focus. During the break view, try letting clicks pass through to the window underneath, and confirm in testing.
- **Next session:** starts only after the user clicks.

## 9. Session data

**Saved per session:** unique ID, start time, planned duration, actual duration, mode, task label, status, and end time.

**Status values:** completed (user confirmed the task is done), partly completed, not completed, abandoned.

**Rules:**
- A session is written when it starts and updated when it ends, so a crash does not lose data.
- Remaining time comes from a saved end timestamp, not from counting ticks.
- A session is abandoned if the user resets or closes the app before the end.
- Data is stored locally on the user's machine only.

## 10. Design direction

- Cute, minimal, not distracting.
- Dark mode only in v1.
- The owner has a design reference image. Save it in a `design/` folder in the project and follow it.
- The character art is AI-generated 3D (see Section 6).

## 11. Technical approach

- **Prototype first:** build the timer, states, and copy as a plain web app (HTML, CSS, JavaScript). The web version stays usable so the owner can use it right away and note changes and improvements.
- **Desktop shell:** Electron for the Windows widget (always on top, frameless, draggable, tray icon, global shortcuts). Electron is cross-platform, which keeps Mac and Linux possible later.
- **Timer logic:** one pure module with no UI code, driven by an end timestamp.
- **State machine:** idle, focus, break, paused, abandoned, each mapped to one image and one set of copy lines.
- **Storage:** a local file or SQLite on the user's machine. No server, no accounts.
- **Packaging (later):** `electron-builder` for a Windows `.exe` installer.

## 11a. Milestones

These are a rough guide. **Start with M1 and plan the next milestone only after the current one works.** The goal is a working v1 in about one week, working as many hours as needed.

- **M1. Browser timer.** Countdown and stopwatch, start, pause, reset, and the three modes, with the micro-task label. Test: the timer stays correct after the tab sleeps or the laptop is closed for a minute.
- **M2. Character and copy.** All states with still images, the kiss moment, and the copy file wired in with placeholders. Test: every state shows the right image and a random line, within the message budget.
- **M3. Session log.** Sessions are saved, including the completion check. Test: close and reopen and the data is still there; kill the app mid-session and it is recorded as abandoned.
- **M4. Desktop widget.** Electron shell, always on top, frameless, draggable, move to the center on break, and hidden over fullscreen apps. Test: stays above other windows across monitors and virtual desktops.
- **M5. Polish and real use.** Should-have items and bug fixes. Test: five real workdays of use with a bug list.
- **M6. Ship.** A Windows installer on GitHub Releases. Test: install it on a clean computer, including the SmartScreen warning.
- **M7. Launch.** Landing page, demo GIF, README, case study, and posts.

## 12. Risks

- **Distraction (biggest worry):** messages or animation pulling attention from the focus session. Mitigation: the message budget and a calm, minimal design.
- **Fullscreen and screen share:** hiding over fullscreen apps and out of screen shares needs real testing on Windows.
- **Timer drift:** avoided by using an end timestamp.
- **Art workload:** v1 uses 6 images and one animation.
- **Unsigned installer warning:** SmartScreen shows a blue warning until the app builds reputation. Ship with clear "More info, then Run anyway" instructions.
- **Persona tone:** the tone limits in Section 6 keep the character fun and harmless.
- **Name:** no exact "Clingy" focus timer was found in search, but the handle and domain have not been checked.

## 13. Distribution and launch (later)

Focus on v1 and functionality first. Open for later: installer signing, open or closed source, pricing, handles and domain, the Framer landing page, and launch posts.

## 14. Open items to settle during the build

1. Copy lines (the owner writes them).
2. Exact kiss animation (a short loop or a few frames).
3. Click-through behavior during the break view.
4. How to detect fullscreen apps on Windows.
5. Whether the kiss counter and simple stats make it into v1.
6. Handle and domain check for Clingy.
7. The final global shortcut keys.

## 15. Working agreements for Cursor

- Build one milestone at a time and stop for review at the end of each.
- The user is a beginner. Explain new code in plain language, and after writing code, summarize what each file does.
- Keep the timer logic in its own module with no UI code in it.
- Do not add features outside the Must and Should lists without asking.
- Ask before installing any new dependency.
- Keep copy lines in a data file, not inside components.
- Commit at the end of every working session with a clear message.
- When something breaks, show the full error and the cause before fixing it.
