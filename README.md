# Great Escape Reimagined (Prototype)

## ▶️ Play now: https://mysticalg.github.io/GrandTheftAutoMini/

## About
Great Escape Reimagined is a lightweight, browser-based isometric prison-escape prototype inspired by classic routine-and-risk sandbox games. You play as a prisoner balancing daily routine, stealth, and progression while trying to gather everything needed for a successful escape.

The simulation blends structured prison schedules (roll call, work detail, lights out) with emergent moments from patrols, spotlights, and NPC movement.

## Features
- **Isometric prison map** with themed sections: sleeping quarters, mess hall, admin, solitude, yard, fences, and an exit gate.
- **Living day/night cycle** with schedule phases: Roll Call, Work Detail, Mess Hall, Free Period, and Lights Out.
- **Player movement + automation** with manual control and an auto-routine toggle.
- **Guard patrol + capture loop** that punishes mistakes by sending you to solitude.
- **Morale system** that rewards progress and drops under pressure.
- **Collectible escape items** (e.g., tools/disguises/papers) needed before reaching the final gate.
- **Tunnel hatch traversal** to move between key areas quickly.
- **Ambient world activity** from roaming prisoners and nighttime spotlights.
- **Retro UI + audio feedback** including badges, inventory, event log, and beep SFX.

## Instructions
### Objective
1. Collect all required escape items.
2. Reach the exit gate to complete the escape.

### Controls
- **Move:** `WASD` or Arrow Keys
- **Toggle auto-routine:** `A`
- **Use tunnel hatch (when standing on one):** `E`

### Gameplay tips
- During **Lights Out**, avoid spotlight sweeps to protect morale.
- If a guard catches you, you are moved to solitude and lose morale.
- Auto-routine can help you stay aligned with schedule windows before making your escape attempt.

## Run locally
Open `index.html` directly, or serve the folder with:

```bash
python3 -m http.server 8000
```

Then browse to `http://localhost:8000`.

## GitHub Pages deployment
This repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` to automatically publish the static site.

### One-time repository settings
1. Push to the `main` branch (or trigger the workflow manually from Actions).
2. In GitHub, open **Settings → Pages**.
3. Ensure **Source** is set to **GitHub Actions**.

After the workflow succeeds, your site will be available at:
`https://mysticalg.github.io/GrandTheftAutoMini/`.
