# Signal Map
by Førm Sonics

Signal Map visualizes LUNA tracks, buses, main outputs and sends. It is a LUNA add-on, not an AU/VST insert.

## Install
Open the versioned `.lunaaddon` file with LUNA, confirm installation, then open Signal Map from the add-on windows menu. Requires LUNA 3.1.2 or compatible newer host; currently tested on macOS. New installations replace older versions with the same add-on ID.

## Explore a session
1. Open a LUNA session and connect Signal Map. Connect disappears when connected and returns after a disconnection.
2. Select a track or bus from the sidebar; search matches both kinds.
3. Use Signal path to trace a selected channel downstream, or Session map for the broader graph.
4. Toggle Sends to include send connections. Downstream and Isolate path apply to signal-path mode.
5. Pan by dragging empty map space or scrolling; Ctrl/Command-scroll zooms. Shift-scroll pans horizontally. Readable fit preserves useful label size rather than shrinking a large session into unreadable cards. The Session map overview provides point-and-click navigation.
6. Click a node to inspect its connections and state. Double-click to trace its path. Focus selected centers it.
7. Locate in LUNA explicitly selects the channel and opens the mixer. It does not change gain, routing, mute, solo, effects or transport playback.
8. Refresh rereads routing. After disconnect, the last view is marked stale; reconnect explicitly.

## Interpretation and boundaries
- Shows up to 512 graph nodes with a truncation notice when necessary.
- Mute, solo and record badges are indicators, not controls.
- Main output and send connections are inspected; cue routes, plugin internals, physical cabling, Apollo Console and hardware monitoring are outside scope.
- Missing/unavailable data is shown as unknown. A silent meter alone does not identify a fault.
- Level and peak are values exposed by the SDK, not a separate RMS or calibrated loudness measurement.
- Demo uses explicitly labeled synthetic routing and static meters. It is not an audio test or a live session.

## Data and updates
Signal Map stores no user library, session notes, account credentials or preferences. The selected channel, search and zoom are temporary in-memory UI state and reset when the window reloads. It reconstructs routing from the connected session; it does not save a separate graph. There is no add-on data export/import or migration to perform. Save your work in LUNA normally. Native installation/update and embedded-webview behavior must still be verified separately from browser reload checks.

## Troubleshooting
If no session appears, open one in LUNA and reconnect. If disconnected, do not interpret stale meter/routing values as current. An unavailable connection may reflect unsupported SDK data rather than broken audio. Use LUNA itself for routing edits.
