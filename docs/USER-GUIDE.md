# Signal Map 0.1.5

LUNA workflow add-on by Førm Sonics. Read-only routing inspection, not an AU/VST insert.

## Install and open
Unzip the delivery ZIP and open Signal-Map-0.1.5.lunaaddon on the LUNA machine. In a compatible LUNA Builder-enabled version, open Add Ons > Windows > Signal Map. Requires SDK/LUNA 3.1.2 or compatible newer host. Installer and native host behavior remain unverified.

## Use
Connect to LUNA, select a track or bus, and follow its main output and send connections. Click a diagram node to inspect it; Trace Selected Track makes it the root. Session Map shows up to 512 nodes, with readable framing, panning and a minimap. Search matches both tracks and buses. Fit, zoom and drag navigate the diagram. Refresh rereads the session. Locate explicitly selects the channel and opens the LUNA mixer without changing audio controls.

The large primary logo is SIGNAL MAP with the small byline "by Førm Sonics". No large FORM logo.

## Boundaries
- Reads main and send routes only. Cue routes, plugin internal paths, Apollo Console, physical cables and hardware monitoring are not inspected.
- Missing data is unknown, not evidence of successful routing or a fault. Silent meter levels alone do not diagnose a fault. Solo audibility and send behavior are not inferred.
- LEVEL is the SDK meter value, not a claimed RMS measurement. PEAK is the SDK peak value. No metering reset or audio control writes.
- Mute, solo and record indicators are not buttons. The only session UI mutation is explicit Locate.
- Demo mode uses clearly labeled synthetic routing and static meter values. Use its scenario selector for muted, missing, unavailable and cycle examples.
- No automatic retries. Use Connect again after opening LUNA.

## Verification
12 Node checks pass, including graph convergence/cycles, missing versus unknown, silence, multiple assignments, send filtering, caps, stale data and an official SDK MockEngine read that emits only get/subscribe requests. Browser checks cover demo scenarios, sends toggle, search and branding; screenshot inspected. Native LUNA launch, real subscription updates, real meter streams, navigation, disconnect/reopen and large real sessions remain pending. This is an evaluation build, not a native-host-validated release. 

