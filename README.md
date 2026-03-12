# Grand Theft Auto Mini

## ▶️ Play now: https://mysticalg.github.io/GrandTheftAutoMini/

## About
Grand Theft Auto Mini is a fast, browser-based open-world action sandbox inspired by classic GTA-style gameplay. Explore a large city, complete missions, drive and switch vehicles, evade wanted levels, and experiment with emergent chaos systems.

The game runs entirely in the browser with no build step required for players.

## Features
- **Large open city map** with roads, districts, interiors, and discoverable locations.
- **Mission progression** with quick mission cycling and objective prompts.
- **Vehicle gameplay** including cars plus specialty vehicle types (for example air/water/heavy variants in the world simulation).
- **Combat + survival loop** with health, stamina-style pressure, police escalation, and respawn flow.
- **Interactive HUD** with money, wanted status, health bar, notifications, and minimap.
- **Minimap navigation tools** with wheel zoom and drag pan support.
- **NPC and traffic systems** for a more dynamic city feel.
- **Audio feedback** for combat, pickups, alerts, and other key actions.

## Instructions
### Objective
- Explore the city, complete missions, build your score/cash, and survive escalating encounters.

### Controls
- **Move / drive:** `WASD`
- **Sprint:** `SHIFT`
- **Attack:** `SPACE`
- **Interact:** `F`
- **Enter/exit vehicle or interiors:** `E`
- **Next mission:** `N`
- **Open full world map:** `M`
- **Zoom/adjust minimap detail:** `Q` / `Z`
- **Minimap controls:** Mouse wheel to zoom, drag to pan
- **Repair vehicle:** `G`
- **Use drug/boost action:** `H`
- **Respawn:** `R`

### Gameplay tips
- Use the minimap aggressively: zoom out while traveling, zoom in during combat-heavy blocks.
- Entering different vehicles can dramatically change escape and mission options.
- If wanted pressure ramps up, break line-of-sight and reroute through denser streets.

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
