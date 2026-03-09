// Great Escape Reimagined core loop and systems.
const TILE_W = 52;
const TILE_H = 26;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const inventoryEl = document.getElementById('inventory');
const logEl = document.getElementById('log');
const periodBadge = document.getElementById('periodBadge');
const autoBadge = document.getElementById('autoBadge');
const moraleBadge = document.getElementById('moraleBadge');

const audio = new (window.AudioContext || window.webkitAudioContext)();
const playBeep = (hz = 330, duration = 0.08) => {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = hz;
  osc.type = 'square';
  gain.gain.value = 0.06;
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration);
};

const map = {
  w: 24,
  h: 24,
  tiles: Array.from({ length: 24 * 24 }, () => ({ type: 'yard', passable: true }))
};
const idx = (x, y) => y * map.w + x;
const inBounds = (x, y) => x >= 0 && y >= 0 && x < map.w && y < map.h;

// Build sections: cells, mess, admin, solitude, fences.
for (let y = 2; y <= 8; y++) for (let x = 3; x <= 9; x++) map.tiles[idx(x, y)] = { type: 'cells', passable: true };
for (let y = 3; y <= 8; y++) for (let x = 12; x <= 18; x++) map.tiles[idx(x, y)] = { type: 'mess', passable: true };
for (let y = 12; y <= 16; y++) for (let x = 3; x <= 7; x++) map.tiles[idx(x, y)] = { type: 'admin', passable: true };
for (let y = 12; y <= 15; y++) for (let x = 10; x <= 12; x++) map.tiles[idx(x, y)] = { type: 'solitude', passable: true };
for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
  if (x === 0 || y === 0 || x === map.w - 1 || y === map.h - 1) map.tiles[idx(x, y)] = { type: 'fence', passable: false };
}
map.tiles[idx(22, 12)] = { type: 'gate', passable: true };

const tunnels = [{ x: 5, y: 7, to: { x: 20, y: 20 } }, { x: 20, y: 20, to: { x: 5, y: 7 } }];

const game = {
  running: false,
  t: 0,
  dayClock: 0,
  period: 'Roll Call',
  isNight: false,
  autoMode: false,
  morale: 80,
  hero: { x: 6, y: 6, anim: 0, caught: 0 },
  inventory: [],
  guards: [
    { x: 4, y: 4, dir: 1, route: [{ x: 4, y: 4 }, { x: 15, y: 4 }, { x: 15, y: 18 }, { x: 4, y: 18 }], routeI: 0 },
    { x: 19, y: 6, dir: -1, route: [{ x: 19, y: 6 }, { x: 19, y: 19 }, { x: 8, y: 19 }, { x: 8, y: 6 }], routeI: 0 }
  ],
  prisoners: Array.from({ length: 6 }, (_, i) => ({ x: 5 + i, y: 8 + (i % 2), mood: Math.random() })),
  items: [
    { name: 'Wire Cutters', x: 17, y: 4, got: false },
    { name: 'Guard Uniform', x: 4, y: 14, got: false },
    { name: 'Shovel', x: 18, y: 18, got: false },
    { name: 'Fake Papers', x: 11, y: 13, got: false },
  ],
  spotlights: [{ x: 21, y: 4, a: 0 }, { x: 21, y: 19, a: Math.PI }]
};

const events = [];
function log(msg) {
  events.unshift(`[${game.period}] ${msg}`);
  if (events.length > 16) events.pop();
  logEl.innerHTML = events.map(e => `<div>${e}</div>`).join('');
}

function isoToScreen(x, y) {
  const ox = canvas.width * 0.35;
  const oy = 70;
  return { sx: ox + (x - y) * TILE_W / 2, sy: oy + (x + y) * TILE_H / 2 };
}

function drawTile(x, y, tile) {
  const { sx, sy } = isoToScreen(x, y);
  const palette = {
    yard: '#4d7a58', cells: '#6f7f9b', mess: '#8a6f59', admin: '#6e5e83', solitude: '#555', fence: '#39424f', gate: '#7f8f4c'
  };
  const c = palette[tile.type] || '#666';
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx + TILE_W / 2, sy + TILE_H / 2);
  ctx.lineTo(sx, sy + TILE_H);
  ctx.lineTo(sx - TILE_W / 2, sy + TILE_H / 2);
  ctx.closePath();
  ctx.fillStyle = c;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.2)';
  ctx.stroke();
  if (tile.type === 'fence') {
    ctx.strokeStyle = '#9fb0c7';
    ctx.beginPath();
    ctx.moveTo(sx - 8, sy + 6);
    ctx.lineTo(sx + 8, sy + 20);
    ctx.stroke();
  }
}

function drawCharacter(x, y, color, bob = 0) {
  const { sx, sy } = isoToScreen(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 8 + bob, 8, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#10131f';
  ctx.fillRect(sx - 5, sy + 18 + bob, 10, 6);
}

function updateUI() {
  periodBadge.textContent = `${game.isNight ? 'Night' : 'Day'}: ${game.period}`;
  autoBadge.textContent = `Auto: ${game.autoMode ? 'On' : 'Off'}`;
  moraleBadge.textContent = `Morale ${'▰'.repeat(Math.max(1, Math.round(game.morale / 20))).padEnd(5, '▱')}`;
  inventoryEl.innerHTML = game.inventory.map(i => `<li>🎒 ${i}</li>`).join('') || '<li>None yet</li>';
}

function targetMove(ent, tx, ty, speed = 0.02) {
  if (Math.random() > speed) return;
  const dx = tx - ent.x;
  const dy = ty - ent.y;
  const sx = dx ? Math.sign(dx) : 0;
  const sy = dy ? Math.sign(dy) : 0;
  const nx = ent.x + (Math.abs(dx) > Math.abs(dy) ? sx : 0);
  const ny = ent.y + (Math.abs(dx) <= Math.abs(dy) ? sy : 0);
  if (inBounds(nx, ny) && map.tiles[idx(nx, ny)].passable) { ent.x = nx; ent.y = ny; }
}

function applyRoutine() {
  const c = game.dayClock % 3000;
  if (c < 600) game.period = 'Roll Call';
  else if (c < 1300) game.period = 'Work Detail';
  else if (c < 1800) game.period = 'Mess Hall';
  else if (c < 2500) game.period = 'Free Period';
  else game.period = 'Lights Out';
  game.isNight = game.period === 'Lights Out';

  if (game.autoMode) {
    const dest = {
      'Roll Call': { x: 8, y: 8 }, 'Work Detail': { x: 14, y: 7 }, 'Mess Hall': { x: 15, y: 5 },
      'Free Period': { x: 12, y: 12 }, 'Lights Out': { x: 6, y: 6 }
    }[game.period];
    targetMove(game.hero, dest.x, dest.y, 0.17);
  }
}

const keys = new Set();
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'a') { game.autoMode = !game.autoMode; playBeep(550); }
  if (e.key.toLowerCase() === 'e') {
    const t = tunnels.find(tn => tn.x === game.hero.x && tn.y === game.hero.y);
    if (t) { game.hero.x = t.to.x; game.hero.y = t.to.y; log('Used tunnel hatch.'); playBeep(180, .15); }
  }
  keys.add(e.key);
});
window.addEventListener('keyup', e => keys.delete(e.key));

function updatePlayer() {
  if (game.autoMode || game.hero.caught > 0) return;
  const mv = [['ArrowUp', 0, -1], ['w', 0, -1], ['ArrowDown', 0, 1], ['s', 0, 1], ['ArrowLeft', -1, 0], ['a', -1, 0], ['ArrowRight', 1, 0], ['d', 1, 0]];
  for (const [k, dx, dy] of mv) {
    if (keys.has(k)) {
      const nx = game.hero.x + dx;
      const ny = game.hero.y + dy;
      if (inBounds(nx, ny) && map.tiles[idx(nx, ny)].passable) {
        game.hero.x = nx; game.hero.y = ny; game.hero.anim += 1;
      }
      break;
    }
  }
}

function updateGuards() {
  for (const g of game.guards) {
    const dest = g.route[g.routeI];
    targetMove(g, dest.x, dest.y, 0.2);
    if (g.x === dest.x && g.y === dest.y) g.routeI = (g.routeI + 1) % g.route.length;
    const d = Math.abs(g.x - game.hero.x) + Math.abs(g.y - game.hero.y);
    if (d <= 1 && game.hero.caught <= 0) {
      game.hero.caught = 360;
      game.hero.x = 11; game.hero.y = 13;
      game.morale = Math.max(10, game.morale - 15);
      log('Caught by guard. Sent to solitude.');
      playBeep(120, 0.25);
    }
  }
}

function updatePrisoners() {
  for (const p of game.prisoners) {
    if (Math.random() < 0.04) {
      const nx = p.x + (Math.random() < 0.5 ? 1 : -1);
      const ny = p.y + (Math.random() < 0.5 ? 1 : -1);
      if (inBounds(nx, ny) && map.tiles[idx(nx, ny)].passable) { p.x = nx; p.y = ny; }
    }
  }
}

function collectItemsAndWin() {
  for (const item of game.items) {
    if (!item.got && item.x === game.hero.x && item.y === game.hero.y) {
      item.got = true;
      game.inventory.push(item.name);
      game.morale = Math.min(100, game.morale + 5);
      log(`Found ${item.name}.`);
      playBeep(760, 0.12);
    }
  }
  if (game.inventory.length === game.items.length && game.hero.x === 22 && game.hero.y === 12) {
    log('You escaped! Freedom achieved.');
    game.running = false;
  }
}

function updateSpotlights() {
  if (!game.isNight || game.hero.caught > 0) return;
  for (const s of game.spotlights) {
    s.a += 0.02;
    const lx = s.x + Math.cos(s.a) * 6;
    const ly = s.y + Math.sin(s.a) * 6;
    if (Math.abs(lx - game.hero.x) < 1.2 && Math.abs(ly - game.hero.y) < 1.2) {
      game.morale = Math.max(0, game.morale - 0.05);
      if (Math.random() < 0.01) log('Spotlight grazes your position.');
    }
  }
}

function drawSpotlights() {
  if (!game.isNight) return;
  for (const s of game.spotlights) {
    const { sx, sy } = isoToScreen(s.x, s.y);
    ctx.strokeStyle = 'rgba(255,255,160,.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(s.a) * 140, sy + Math.sin(s.a) * 80);
    ctx.stroke();
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (game.isNight) {
    ctx.fillStyle = '#0b0f20';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) drawTile(x, y, map.tiles[idx(x, y)]);
  for (const t of tunnels) {
    const { sx, sy } = isoToScreen(t.x, t.y);
    ctx.fillStyle = '#121212';
    ctx.fillRect(sx - 8, sy + 6, 16, 10);
  }
  for (const item of game.items.filter(i => !i.got)) drawCharacter(item.x, item.y, '#ffe66d', Math.sin(game.t / 8) * 2);
  for (const p of game.prisoners) drawCharacter(p.x, p.y, '#9bc3f0', Math.sin(game.t / 12 + p.mood) * 1.6);
  for (const g of game.guards) drawCharacter(g.x, g.y, '#f07167', Math.sin(game.t / 10) * 1.5);
  drawCharacter(game.hero.x, game.hero.y, '#ffffff', Math.sin(game.t / 6) * 2);
  drawSpotlights();
}

function tick() {
  if (!game.running) return render();
  game.t++; game.dayClock++;
  if (game.hero.caught > 0) game.hero.caught--;
  applyRoutine();
  updatePlayer();
  updateGuards();
  updatePrisoners();
  updateSpotlights();
  collectItemsAndWin();
  updateUI();
  render();
  requestAnimationFrame(tick);
}

document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('splash').style.display = 'none';
  game.running = true;
  log('Escape plan started.');
  updateUI();
  playBeep(240, 0.15);
  tick();
});
