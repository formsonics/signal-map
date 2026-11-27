# Signal Map 0.1.6 verification

## Automated checks
15 Node tests cover graph traversal/cycles, state interpretation, read-only SDK data loading, large-map framing, and the Locate regression. Release packaging and UA's official local archive/content checker are run separately. These do not imply marketplace approval.

## Real LUNA engine, November 27, 2026
LUNA 3.1.2 on macOS 13.7.2; app displayed in desktop Chrome connected to the real engine through the private Studio bridge. Used an owned disposable session, not a working mix.

Passed:
- Live tracks, buses and main routing rendered; connected button state correct.
- Track rename from an independent SDK client appeared in the UI, then restored.
- Locate clicked in the UI; an independent engine read confirmed track selection.
- Disconnection marked stale and exposed reconnect; explicit reconnect restored the view.
- Session close cleared UI; saved session reopened and UI rebound.
- Browser reload reconstructed the view without app storage.
- No browser page errors on the successful pass.

The test exposed a real bug: `focus: mixer` is not a valid session context focus. 0.1.6 omits that write, selects the track and uses the GUI mixer-page API. The corrected pass verified the result. Temporary tracks remained only in the disposable test session; rename was restored and the session saved/closed. No working session, Apollo settings or playback was changed.

## Owner-reported native acceptance — November 27, 2026
After being asked to install 0.1.6 and confirm its embedded window, routing, Locate and live meters, the owner reported that everything works on their end. This is owner-reported acceptance, not agent-observed native UI evidence or a performance benchmark.

The real-engine/browser lifecycle tests above separately cover disconnect/reconnect and session close/reopen. Signal Map stores no user library, so saved-library migration does not apply. Broader host/OS compatibility and exhaustive long-session performance are not certified.
