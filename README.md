# Great Escape Reimagined (Prototype)

A browser-based isometric prison-escape simulation inspired by classic systems.

## Features implemented
- Isometric map with prison sections: sleeping quarters, mess hall, admin, solitude, yard, fences, and gate.
- Day/night schedule with roll call, work detail, mess hall, free period, and lights out.
- Auto routine mode toggle (`A`) that makes the player follow daily routine.
- Guards with patrol routes and capture behavior (solitude punishment).
- Morale flag meter that rises with progress and drops when caught/pressured.
- Collectible escape items and win condition at exit gate.
- Underground tunnel network with hatch travel (`E`).
- Other prisoners moving around camp.
- Night spotlights scanning yard.
- Splash screen, UI badges, event log, inventory, procedural sprite-like visuals, and retro beeps.

## Run
Open `index.html` directly or serve with:

```bash
python3 -m http.server 8000
```

Then browse to `http://localhost:8000`.
