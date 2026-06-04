(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const mainCtx = canvas.getContext('2d');
  let ctx = mainCtx;
  let staticLayer = null;
  const loading = document.getElementById('loading');
  const titleUI = document.getElementById('title-ui');
  const gameoverUI = document.getElementById('gameover-ui');
  const nameInput = document.getElementById('player-name');
  const nameWarning = document.getElementById('name-warning');
  const newShiftButton = document.getElementById('new-shift');
  const continueSavedButton = document.getElementById('continue-saved');
  const continueShiftButton = document.getElementById('continue-shift');
  const restartShiftButton = document.getElementById('restart-shift');
  const downloadScoreButton = document.getElementById('download-score');
  const muteToggleButton = document.getElementById('mute-toggle');
  const displayToggleButton = document.getElementById('display-toggle');
  const gameShell = document.getElementById('game-shell');
  const volumePanel = document.getElementById('volume-panel');
  const volumeSlider = document.getElementById('volume-slider');
  const volumeValue = document.getElementById('volume-value');
  const unstuckButton = document.getElementById('unstuck-button');
  const playControls = document.getElementById('play-controls');
  const actionControl = document.getElementById('action-control');
  const directionControls = Array.from(document.querySelectorAll('.direction[data-key]'));
  const introUI = document.getElementById('intro-ui');
  const introImage = document.getElementById('intro-image');
  const introCaption = document.getElementById('intro-caption');
  const introNextButton = document.getElementById('intro-next');
  const introSkipButton = document.getElementById('intro-skip');

  const W = canvas.width;
  const H = canvas.height;
  const DRAW_MARGIN = 150;
  const TILE = 118;
  const BASE_MAP_W = 50;
  const BASE_MAP_H = 36;
  let MAP_W = BASE_MAP_W;
  let MAP_H = BASE_MAP_H;
  let WORLD_W = MAP_W * TILE;
  let WORLD_H = MAP_H * TILE;
  const MAX_HEARTS = 3;
  const ACTIVE_BOXES = 20;
  const ACTIVE_COFFEES = 9;
  const ASSET_PATH = 'assets/';
  const SAVE_KEY = 'zalandoScoutSavedShiftV2';
  const NAME_KEY = 'zalandoScoutPlayerName';
  const BEST_KEY = 'zalandoScoutBest';
  const MUTE_KEY = 'zalandoScoutAudioMuted';
  const VOLUME_KEY = 'zalandoScoutAudioVolume';
  const DISPLAY_MODE_KEY = 'zalandoScoutDisplayMode';
  const INVENTORY_DURATION = 30000;
  const PUZZLE_COLS = 5;
  const PUZZLE_ROWS = 6;
  const PUZZLE_SIZE = PUZZLE_COLS * PUZZLE_ROWS;
  const FLOOR_TINTS = ['rgba(255,118,36,.055)', 'rgba(41,117,154,.045)', 'rgba(120,94,48,.05)', 'rgba(74,124,89,.045)', 'rgba(128,70,110,.04)'];
  const keys = new Set();

  const assetSources = {
    actionssprite: ['actionssprite.png'], background: ['background1.jpg'], box1: ['box1.png'], box2: ['box2.png'],
    box3: ['box3.png'], box4: ['box4.png'], box5: ['box5.png'], box6: ['box6.png'], box7: ['box7.png'],
    cement: ['cement.jpeg'], clothes: ['clothes.png'], coffee: ['coffee.png'], entrance: ['entrance.png'],
    evilguy: ['evilguy.png'], evilguysprite: ['evilguysprite.png'], exit: ['exit.png', 'exit.jpg'], gameover: ['gameover.png'],
    heart: ['heart.png'], inventory1: ['inventory1.png'], inventory2: ['inventory2.png'], inventory3: ['inventory3.png'],
    inventory4: ['inventory4.png'], inventory5: ['inventory5.png'], kitchen: ['kitchen.png'], meeting: ['meeting.jpg'],
    pickup: ['pickup.png'], qs: ['qs.jpeg'], qsObj1: ['qs.png'], qsObj2: ['qs2.png'], cone: ['cone.png'], score: ['score.png'],
    screens: ['screens.jpg'], sign: ['sign.png'], tiles: ['tiles.jpeg'], carpet: ['carpet.jpg', 'cement.jpeg'],
    inventorybg: ['inventory.png', 'inventory.jpg', 'inventorycheck.jpg', 'meeting.jpg'],
    table: ['table.png'], table2: ['table2.png'], table3: ['table3.png'], zalandologo: ['zalandologo.png'],
    smallbox: ['smallbox.png'], smallbox2: ['smallbox2.png'], smallbox3: ['smallbox3.png'], shoe: ['shoe.png'],
    title: ['title.png'], truck: ['truck.png'], walksprite: ['walksprite.png']
  };
  const optionalAssets = new Set(['cone', 'qsObj1', 'qsObj2', 'table', 'table2', 'table3', 'zalandologo', 'smallbox', 'smallbox2', 'smallbox3', 'shoe']);
  const musicFiles = {
    startup: 'startup.mp3', gameplay: 'gameplay.mp3', gameplay1: 'gameplay1.mp3', gameplay2: 'gameplay2.mp3', gameplay3: 'gameplay3.mp3',
    inventory: 'inventory.mp3', gameover: 'gameover.mp3', winner: 'winner.mp3', kitchen: 'kitchen.mp3',
    welcome: 'welcome.mp3', factory: 'factory.mp3', evilrobot: 'evilrobot.mp3'
  };
  const gameplayPlaylist = ['gameplay', 'gameplay1', 'gameplay2', 'gameplay3'];

  // Opening story sequence and its soundtrack mapping.
  const introSlides = [
    { images: ['welcome0.jpg', 'wecome0.jpg'], music: 'welcome', text: 'Welcome to Zalando Scout! I know you are in the Ops team, but we need your help.' },
    { images: ['robot.jpg'], music: 'welcome', text: 'Zalando has invested in automation systems in our warehouses to help make getting customers orders more efficient.' },
    { images: ['welcome2.jpg'], music: 'factory', text: 'Everything has been going well for the last few months, and productivity is up!' },
    { images: ['itguy.jpg'], music: 'evilrobot', text: 'But one day Crazy Ivan from IT decided to enhance the robots with his own special AI algorithm, and something has gone wrong!' },
    { images: ['warehouse.jpg'], music: 'factory', text: 'We need to send you to the warehouse to investigate and help with the tasks which are not getting done.', captionPosition: 'top' },
    { images: ['danger.jpg'], music: 'evilrobot', text: 'Beware of the evil automated robots. They do not want you taking their jobs.' },
    { images: ['inventorycheck.jpg'], music: 'inventory', text: 'We need you to help out with inventory checks.' },
    { images: ['qs2.jpg'], music: 'kitchen', text: 'And help out with Quarantine Storage.' },
    { images: ['exit.jpg'], music: 'winner', text: 'Complete your tasks and make your way to the exit, so we can send you to the next warehouse!' },
    { images: ['background1.jpg'], music: 'gameplay', text: 'Your shift begins now!' }
  ];
  const INTRO_TYPE_INTERVAL = 19;
  let introToken = 0;
  let introTypeTimer = null;
  let pendingShiftStart = null;
  const images = {};
  let patterns = {};

  const directions = [
    { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
  ];
  const rackProfiles = [
    { image: 'box4', w: 7, h: 4 },
    { image: 'box5', w: 8, h: 5 },
    { image: 'box6', w: 7, h: 5 },
    { image: 'box7', w: 5, h: 4 },
    { image: 'box2', w: 3, h: 3 },
    { image: 'box3', w: 3, h: 3 }
  ];

  const game = {
    mode: 'title',
    playerName: localStorage.getItem(NAME_KEY) || '',
    level: 1,
    score: 0,
    bestScore: Number(localStorage.getItem(BEST_KEY) || 0),
    health: 3,
    coffees: 0,
    muted: localStorage.getItem(MUTE_KEY) === '1',
    volume: clamp(Number(localStorage.getItem(VOLUME_KEY) || 72) / 100, 0, 1),
    displayMode: localStorage.getItem(DISPLAY_MODE_KEY) === 'mobile' ? 'mobile' : 'desktop',
    map: [],
    obstacles: [],
    zoneProps: [],
    borderProps: [],
    decorativeProps: [],
    colliders: [],
    zones: {},
    boxes: [],
    looseCoffees: [],
    enemies: [],
    forklifts: [],
    player: null,
    camera: { x: 0, y: 0 },
    messages: [],
    particles: [],
    routePath: [],
    routeUntil: 0,
    transitionUntil: 0,
    lastTime: 0,
    truck: null,
    truckTimer: null,
    soundReady: false,
    specialMusic: null,
    introIndex: 0,
    inventoryBriefUntil: 0,
    inventoryCooldownUntil: 0,
    inventoryPuzzle: null,
    unstuckUntil: 0,
    floorTint: FLOOR_TINTS[0],
    floorLogos: [],
    stats: freshStats()
  };

  function freshStats() {
    return { boxesOpened: 0, coffeesCollected: 0, returnsProcessed: 0, trucksCompleted: 0, heartsFound: 0, warehousesCleared: 0, inventoryMatches: 0, offlineStock: 0, customerOrders: 0, sharesFound: 0, lunchBreaks: 0, mixedStock: 0, mouldyClothes: 0, opsFinds: 0, inventoryChecks: 0, coffeeSprints: 0, jumps: 0, robotHits: 0, forkliftHits: 0 };
  }

  class Synth {
    constructor() { this.audio = null; }
    init() {
      if (!this.audio) this.audio = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audio.state === 'suspended') this.audio.resume();
      game.soundReady = true;
    }
    note(freq, duration, type = 'square', volume = 0.04, delay = 0) {
      if (game.muted || game.volume <= 0 || !game.soundReady || !this.audio) return;
      const t = this.audio.currentTime + delay;
      const osc = this.audio.createOscillator();
      const gain = this.audio.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(volume * game.volume, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(gain);
      gain.connect(this.audio.destination);
      osc.start(t);
      osc.stop(t + duration + 0.025);
    }
    pickup() { this.note(740, .07); this.note(990, .12, 'square', .045, .07); }
    points() { this.note(523, .06); this.note(659, .06, 'square', .04, .06); this.note(784, .12, 'square', .04, .12); }
    hurt() { this.note(170, .12, 'sawtooth', .07); this.note(110, .22, 'square', .06, .08); }
    teleport() { this.note(440, .07, 'triangle'); this.note(330, .07, 'triangle', .05, .08); this.note(220, .16, 'triangle', .05, .16); }
    truck() { this.note(196, .10, 'square', .06); this.note(196, .10, 'square', .06, .17); this.note(294, .22, 'square', .06, .34); }
    route() { [523, 659, 784, 1047].forEach((f, i) => this.note(f, .12, 'square', .045, i * .08)); }
    powerDown() { this.note(260, .07, 'sawtooth', .045); this.note(130, .17, 'sawtooth', .045, .07); }
    jump() { this.note(360, .06, 'square', .045); this.note(650, .11, 'triangle', .05, .05); this.note(920, .09, 'square', .035, .13); }
  }

  class MusicController {
    constructor() { this.audio = null; this.current = null; this.gameplayQueue = []; }
    play(name, loop = true, onEnded = null) {
      if (!musicFiles[name] || game.muted || game.volume <= 0) return;
      if (this.current === name && this.audio && !this.audio.paused) return;
      this.stop();
      this.current = name;
      this.audio = new Audio(ASSET_PATH + musicFiles[name]);
      this.audio.loop = loop;
      this.audio.volume = 0.45 * game.volume;
      this.audio.onended = onEnded;
      this.audio.onerror = () => { if (onEnded) onEnded(); else this.stop(); };
      this.audio.play().catch(() => {});
    }
    nextGameplayTrack(reset = false) {
      if (reset || !this.gameplayQueue.length) {
        this.gameplayQueue = shuffle(gameplayPlaylist);
        if (this.current && this.gameplayQueue.length > 1 && this.gameplayQueue[0] === this.current) {
          [this.gameplayQueue[0], this.gameplayQueue[1]] = [this.gameplayQueue[1], this.gameplayQueue[0]];
        }
      }
      return this.gameplayQueue.shift();
    }
    playGameplay(reset = false) {
      if (game.muted || game.volume <= 0) return;
      if (gameplayPlaylist.includes(this.current) && this.audio && !this.audio.paused && !reset) return;
      if (reset && gameplayPlaylist.includes(this.current)) this.stop();
      const name = this.nextGameplayTrack(reset);
      this.play(name, false, () => {
        if (game.mode !== 'play' || game.specialMusic || game.muted || game.volume <= 0) return;
        this.playGameplay();
      });
    }
    stop() {
      if (this.audio) { this.audio.pause(); this.audio.onended = null; this.audio.currentTime = 0; }
      this.audio = null;
      this.current = null;
    }
    setMuted(muted) {
      if (muted || game.volume <= 0) this.stop();
      else if (game.mode === 'play') {
        if (game.specialMusic) this.play(game.specialMusic, true);
        else this.playGameplay();
      } else if (game.mode === 'inventoryBriefing' || game.mode === 'inventoryPuzzle') this.play('inventory', true);
      else if (game.mode === 'gameover') this.play('gameover', true);
      else if (game.mode === 'intro') this.play(introSlides[game.introIndex].music, true);
      else if (game.mode === 'title') this.play('startup', true);
    }
    setVolume(value) {
      if (this.audio) this.audio.volume = 0.45 * value;
      if (value > 0 && !game.muted && !this.audio) this.setMuted(false);
      if (value <= 0) this.stop();
    }
  }

  const synth = new Synth();
  const music = new MusicController();

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function controlButtonForCode(code) {
    const mapping = { KeyW: 'ArrowUp', KeyA: 'ArrowLeft', KeyS: 'ArrowDown', KeyD: 'ArrowRight' };
    const canonical = mapping[code] || code;
    return directionControls.find(control => control.dataset.key === canonical);
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function cellKey(x, y) { return `${x},${y}`; }
  function tileCenter(t) { return { x: t.x * TILE + TILE / 2, y: t.y * TILE + TILE / 2 }; }
  function worldToTile(x, y) { return { x: clamp(Math.floor(x / TILE), 0, MAP_W - 1), y: clamp(Math.floor(y / TILE), 0, MAP_H - 1) }; }
  function shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = randInt(0, i); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }

  async function loadAssets() {
    const entries = Object.entries(assetSources);
    await Promise.all(entries.map(([key, files]) => loadImageWithFallback(key, files)));
    patterns = {
      cement: ctx.createPattern(images.cement, 'repeat'),
      qs: ctx.createPattern(images.qs, 'repeat'),
      tiles: ctx.createPattern(images.tiles, 'repeat'),
      carpet: ctx.createPattern(images.carpet, 'repeat')
    };
    loading.classList.add('hidden');
    refreshSavedButton();
    updateMuteButton();
    updateDisplayModeButton();
    requestAnimationFrame(loop);
  }

  function loadImageWithFallback(key, files) {
    const candidates = Array.isArray(files) ? files : [files];
    return new Promise((resolve, reject) => {
      const tryFile = index => {
        if (index >= candidates.length) {
          if (optionalAssets.has(key)) { images[key] = null; resolve(); return; }
          reject(new Error(`Could not load ${candidates.join(' or ')}`));
          return;
        }
        const img = new Image();
        img.onload = () => { images[key] = img; resolve(); };
        img.onerror = () => tryFile(index + 1);
        img.src = ASSET_PATH + candidates[index];
      };
      tryFile(0);
    });
  }

  function configureMapSize(level) {
    // Warehouses 1–4 are twice the original area; from warehouse 5 onward the playable floor doubles again.
    const scale = level >= 5 ? 4 : 2;
    MAP_W = BASE_MAP_W * scale;
    MAP_H = BASE_MAP_H * scale;
    WORLD_W = MAP_W * TILE;
    WORLD_H = MAP_H * TILE;
  }
  function activeBoxCount() { return game.level >= 5 ? 72 : 38; }
  function activeCoffeeCount() { return game.level >= 5 ? 26 : 15; }
  function makeFloorGrid() { return Array.from({ length: MAP_H }, () => Array(MAP_W).fill(0)); }
  function rectTiles(rect) {
    const tiles = [];
    for (let y = rect.top; y < rect.top + rect.height; y++) for (let x = rect.left; x < rect.left + rect.width; x++) tiles.push({ x, y });
    return tiles;
  }
  function zone(left, top, width, height, name, arrivalX = Math.floor(width / 2), arrivalY = Math.floor(height / 2)) {
    return { left, top, width, height, x: left + arrivalX, y: top + arrivalY, name, tiles: rectTiles({ left, top, width, height }) };
  }
  function paddedRect(rect, pad = 0) {
    return { left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 };
  }
  function overlaps(a, b) {
    return a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
  }
  function withinMap(rect) {
    return rect.left >= 1 && rect.top >= 1 && rect.left + rect.width <= MAP_W - 1 && rect.top + rect.height <= MAP_H - 1;
  }
  function isZoneBlocked(rect, pad = 1) {
    const zones = [game.zones.quarantine, game.zones.dock, game.zones.inventory, game.zones.exit, ...game.zones.kitchens];
    return zones.some(z => overlaps(rect, paddedRect(z, pad)));
  }
  function markBlocked(rect) {
    const left = Math.max(0, Math.floor(rect.left));
    const top = Math.max(0, Math.floor(rect.top));
    const right = Math.min(MAP_W, Math.ceil(rect.left + rect.width));
    const bottom = Math.min(MAP_H, Math.ceil(rect.top + rect.height));
    if (left >= right || top >= bottom) return false;
    for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) game.map[y][x] = 1;
    return true;
  }
  function sceneryFootprint(rect, image, options = {}) {
    if (options.collisionRect) return options.collisionRect;
    if (image === 'cone') return { left: rect.left + .16, top: rect.top + .34, width: rect.width * .68, height: rect.height * .54 };
    if (image === 'dock-building') return { left: rect.left + .10, top: rect.top + rect.height * .69, width: rect.width * .80, height: rect.height * .24 };
    const floorBand = options.floorBand ?? (image === 'kitchen' ? .28 : .30);
    const sideInset = options.sideInset ?? .11;
    return {
      left: rect.left + rect.width * sideInset,
      top: rect.top + rect.height * (1 - floorBand),
      width: rect.width * (1 - sideInset * 2),
      height: rect.height * floorBand
    };
  }
  function addCollider(rect, image = 'solid', insetRatio = 0.04) {
    const insetX = rect.width * insetRatio;
    const insetY = rect.height * insetRatio;
    game.colliders.push({
      left: (rect.left + insetX) * TILE,
      top: (rect.top + insetY) * TILE,
      width: Math.max(TILE * .16, (rect.width - insetX * 2) * TILE),
      height: Math.max(TILE * .12, (rect.height - insetY * 2) * TILE),
      image
    });
  }
  function canFlipImage(image) {
    return /^box[2-7]$/.test(image) || /^inventory[1-5]$/.test(image) || image === 'qsObj2';
  }
  function occupyObstacle(rect, image, options = {}) {
    if (!withinMap(rect) || isZoneBlocked(rect, .35) || game.obstacles.some(o => overlaps(rect, o))) return false;
    const collisionRect = sceneryFootprint(rect, image, options);
    markBlocked(collisionRect);
    addCollider(collisionRect, image, options.collisionInset ?? .04);
    const flipX = options.flipX ?? (canFlipImage(image) && Math.random() < 0.5);
    game.obstacles.push({ ...rect, image, flipX, collisionRect });
    return true;
  }
  function addZoneProp(image, rect, options = {}) {
    if (!images[image] || !withinMap(rect)) return;
    const collisionRect = sceneryFootprint(rect, image, options);
    if (options.block !== false) {
      markBlocked(collisionRect);
      addCollider(collisionRect, image, options.collisionInset ?? .04);
    }
    const flipX = options.flipX ?? (canFlipImage(image) && Math.random() < 0.5);
    game.zoneProps.push({ ...rect, image, flipX, collisionRect: options.block === false ? null : collisionRect });
  }
  function addBorderProp(image, rect, flipX = false) {
    if (!images[image]) return;
    game.borderProps.push({ ...rect, image, flipX, collisionRect: null, border: true });
  }
  function addDecorativeProp(image, rect, flipX = false) {
    if (!images[image]) return;
    game.decorativeProps.push({ ...rect, image, flipX, collisionRect: null, decorative: true });
  }
  function scatterDecorativeClutter() {
    game.decorativeProps = [];
    const choices = ['smallbox', 'smallbox2', 'smallbox3', 'shoe'].filter(key => images[key]);
    if (!choices.length) return;
    const shelfProps = game.obstacles.filter(prop => /^box[2-7]$/.test(prop.image));
    const scaleChoices = [1, .5, .3];
    const maxDecor = Math.min(game.level >= 5 ? 1800 : 840, Math.max(144, Math.round(shelfProps.length * .96)));
    let placed = 0;

    // Denser decorative clutter: keep it attached to shelf fronts and gaps, not stranded in open aisles.
    for (const shelf of shuffle(shelfProps)) {
      if (placed >= maxDecor) break;
      if (Math.random() < .18) continue;
      const itemsHere = Math.random() < .42 ? 2 : 1;
      for (let i = 0; i < itemsHere && placed < maxDecor; i++) {
        const image = choice(choices);
        const scale = choice(scaleChoices);
        const baseW = image === 'shoe' ? .98 : 1.0;
        const baseH = image === 'shoe' ? .62 : .88;
        const width = baseW * scale;
        const height = baseH * scale;
        const floorTop = shelf.collisionRect ? shelf.collisionRect.top : shelf.top + shelf.height * .72;
        const left = clamp(shelf.left + rand(.08, Math.max(.14, shelf.width - width - .08)), 1.1, MAP_W - width - 1.1);
        const top = clamp(floorTop + rand(.05, .48), 1.1, MAP_H - height - 1.1);
        addDecorativeProp(image, { left, top, width, height }, Math.random() < .5);
        placed++;
      }
    }
  }
  function scatterConeHazards() {
    if (!images.cone) return;
    const groupsTarget = game.level >= 5 ? 34 : 18;
    let groupsPlaced = 0;
    let attempts = 0;
    while (groupsPlaced < groupsTarget && attempts < groupsTarget * 45) {
      attempts++;
      const count = Math.random() < .55 ? 3 : 4;
      const horizontal = Math.random() < .5;
      const start = { x: randInt(3, MAP_W - (horizontal ? count + 3 : 4)), y: randInt(4, MAP_H - (horizontal ? 4 : count + 3)) };
      const cells = [];
      let valid = true;
      for (let i = 0; i < count; i++) {
        const t = { x: start.x + (horizontal ? i : 0), y: start.y + (horizontal ? 0 : i) };
        const rect = { left: t.x, top: t.y, width: 1, height: 1 };
        if (!isFloorTile(t.x, t.y) || tileInAnyZone(t, 2) || tileInsideVisibleScenery(t) || game.zoneProps.some(prop => overlaps(rect, prop))) {
          valid = false;
          break;
        }
        cells.push(rect);
      }
      if (!valid) continue;
      cells.forEach((rect, i) => addZoneProp('cone', rect, { flipX: i % 2 === 0 }));
      groupsPlaced++;
    }
  }

  function setZones() {
    game.zones = {
      quarantine: zone(2, 2, 11, 9, 'QUARANTINE', 6, 7),
      inventory: zone(MAP_W - 17, 13, 14, 12, 'INVENTORY CHECK', 6, 6),
      dock: zone(2, MAP_H - 15, 20, 12, 'DOCK', 16, 9),
      exit: zone(MAP_W - 14, 3, 10, 7, 'EXIT', 8, 5),
      kitchens: [zone(MAP_W - 13, MAP_H - 10, 8, 5, 'KITCHEN', 7, 4), zone(18, 3, 8, 5, 'KITCHEN', 7, 4)]
    };
  }
  function installSpecialAreaProps() {
    const q = game.zones.quarantine;
    if (images.qsObj1 || images.qsObj2) {
      addZoneProp('qsObj1', { left: q.left + 1, top: q.top + 1, width: 4, height: 3 });
      addZoneProp('qsObj2', { left: q.left + 5, top: q.top + 1, width: 4, height: 3 });
      addZoneProp('qsObj2', { left: q.left + 1, top: q.top + 4, width: 4, height: 2 });
    } else {
      addZoneProp('box1', { left: q.left + 0, top: q.top + 1, width: 3, height: 3 }, { flipX: false });
      addZoneProp('box2', { left: q.left + 5, top: q.top + 1, width: 3, height: 3 });
      addZoneProp('box3', { left: q.left + 0, top: q.top + 5, width: 2, height: 2 });
      addZoneProp('box3', { left: q.left + 3, top: q.top + 5, width: 2, height: 2 });
    }
    // Keep the arrival tile clear; cones create a jumpable hazard line beside it.
    if (images.cone) for (let i = 0; i < 4; i++) addZoneProp('cone', { left: q.left + 1 + i, top: q.top + 6, width: 1, height: 1 }, { flipX: i % 2 === 1 });

    const inv = game.zones.inventory;
    // Alcove shape: stock around the edges, open playable centre.
    addZoneProp('inventory1', { left: inv.left + 0, top: inv.top + 1, width: 3, height: 4 });
    addZoneProp('inventory2', { left: inv.left + 3, top: inv.top + 1, width: 3, height: 2 });
    addZoneProp('inventory3', { left: inv.left + 6, top: inv.top + 1, width: 3, height: 2 });
    addZoneProp('inventory4', { left: inv.left + 9, top: inv.top + 1, width: 3, height: 4 });
    if (images.table) addZoneProp('table', { left: inv.left + 1, top: inv.top + 6, width: 3, height: 2 });
    else addZoneProp('inventory5', { left: inv.left + 1, top: inv.top + 6, width: 3, height: 2 });
    if (images.table2) addZoneProp('table2', { left: inv.left + 5, top: inv.top + 7, width: 3, height: 2 });
    if (images.table3) addZoneProp('table3', { left: inv.left + 9, top: inv.top + 6, width: 2, height: 2 });

    // Kitchen artwork is visible, with the reduced inner footprint used for collision.
    game.zones.kitchens.forEach(k => addZoneProp('kitchen', { left: k.left + 0, top: k.top + 1, width: 6, height: 3 }, { collisionRect: { left: k.left + 0, top: k.top + 1, width: 6, height: 3 }, collisionInset: 0.20, flipX: false }));
    const d = game.zones.dock;
    const dockBuilding = { left: d.left + 1, top: d.top + 1, width: 9, height: 4 };
    const dockFootprint = sceneryFootprint(dockBuilding, 'dock-building');
    markBlocked(dockFootprint);
    addCollider(dockFootprint, 'dock-building', .04);
    if (images.cone) {
      // Never block the Dock spawn point at d.left + 7, d.top + 6.
      for (let i = 0; i < 4; i++) addZoneProp('cone', { left: d.left + 8 + i, top: d.top + 4, width: 1, height: 1 }, { flipX: i % 2 === 0 });
    }
  }
  function crossesMainAisle(rect) {


    const aisleRows = [11, 20];
    const aisleCols = [14, 29];
    return aisleRows.some(row => row >= rect.top && row < rect.top + rect.height) ||
      aisleCols.some(col => col >= rect.left && col < rect.left + rect.width);
  }
  function generateFloorLogos() {
    if (!images.zalandologo) return [];
    const candidates = shuffle(availableFloorTiles(true));
    const logos = [];
    const maxLogos = game.level >= 5 ? 48 : 24;
    for (const t of candidates) {
      const p = tileCenter(t);
      if (logos.every(l => Math.hypot(l.x - p.x, l.y - p.y) > TILE * 6)) {
        logos.push({ x: p.x, y: p.y, w: rand(680, 1000), rotation: choice([0, 0, 0, Math.PI / 2, -Math.PI / 2]), alpha: rand(.18, .26) });
      }
      if (logos.length >= maxLogos) break;
    }
    return logos;
  }
  function placeRackRun(image, left, top, count, width, height, gap = 0, vertical = false) {
    for (let i = 0; i < count; i++) {
      const slot = {
        left: left + (vertical ? 0 : i * (width + gap)),
        top: top + (vertical ? i * (height + gap) : 0),
        width,
        height
      };
      occupyObstacle(slot, image, { floorBand: .30, sideInset: .10 });
    }
  }
  function installWarehouseBorder() {
    // Dense decorative rack ring. The pieces deliberately overlap slightly so the outside
    // of the playable warehouse reads as a closed shelf boundary rather than an exit path.
    const horizontalStep = 2.7;
    let topIndex = 0;
    for (let x = -0.7; x < MAP_W + 1; x += horizontalStep) {
      const topImage = topIndex % 2 === 0 ? 'box5' : 'box6';
      const bottomImage = topIndex % 2 === 0 ? 'box6' : 'box5';
      addBorderProp(topImage, { left: x, top: -.78, width: 4.25, height: 2.12 }, topIndex % 3 === 1);
      addBorderProp(bottomImage, { left: x, top: MAP_H - 1.34, width: 4.25, height: 2.12 }, topIndex % 3 === 0);
      topIndex++;
    }
    const verticalStep = 1.72;
    let sideIndex = 0;
    for (let y = .25; y < MAP_H - .2; y += verticalStep) {
      const leftImage = sideIndex % 2 === 0 ? 'box7' : 'box3';
      const rightImage = sideIndex % 2 === 0 ? 'box3' : 'box7';
      addBorderProp(leftImage, { left: -.77, top: y, width: 2.08, height: 2.75 }, sideIndex % 3 === 0);
      addBorderProp(rightImage, { left: MAP_W - 1.32, top: y, width: 2.08, height: 2.75 }, sideIndex % 3 === 1);
      sideIndex++;
    }
  }
  function tryPlaceRun(image, left, top, count, width = 3, height = 2, gap = 0) {
    let placed = 0;
    for (let i = 0; i < count; i++) {
      const rect = { left: left + i * (width + gap), top, width, height };
      if (occupyObstacle(rect, image, { floorBand: .30, sideInset: .10 })) placed++;
    }
    return placed;
  }
  function installExitApproachMaze() {
    const ex = game.zones.exit;
    // A tighter final set of alternating shelf walls creates a short navigation challenge before the exit.
    const rows = [
      { top: ex.top + ex.height + 1, opening: ex.left - 3, image: 'box5' },
      { top: ex.top + ex.height + 5, opening: ex.left - 12, image: 'box6' },
      { top: ex.top + ex.height + 9, opening: ex.left - 5, image: 'box5' },
      { top: ex.top + ex.height + 13, opening: ex.left - 14, image: 'box6' }
    ];
    rows.forEach((row, index) => {
      const minX = Math.max(2, ex.left - 22);
      const maxX = Math.min(MAP_W - 4, ex.left + ex.width + 2);
      for (let x = minX; x < maxX; x += 3) {
        if (x < row.opening + 2 && x + 3 > row.opening) continue;
        const image = index % 3 === 2 && x % 2 === 0 ? 'box7' : row.image;
        occupyObstacle({ left: x, top: row.top, width: 3, height: 2 }, image, { floorBand: .30, sideInset: .10 });
      }
    });
  }

  function wallOpeningsForRow(rowIndex) {
    // One planned crossing per warehouse section: the gaps move between rows so the scout
    // must navigate through aisles, but no camera-sized view becomes an empty concrete field.
    const sectionWidth = game.level >= 5 ? 37 : 33;
    const gaps = [];
    for (let sectionStart = 4, section = 0; sectionStart < MAP_W - 4; sectionStart += sectionWidth, section++) {
      const usable = Math.min(sectionWidth - 7, MAP_W - sectionStart - 5);
      if (usable < 4) continue;
      const wobble = (rowIndex * 9 + section * 13) % usable;
      gaps.push(clamp(sectionStart + 3 + wobble, sectionStart + 2, Math.min(MAP_W - 5, sectionStart + sectionWidth - 3)));
    }
    return gaps;
  }

  function installDenseShelfWalls() {
    // Build the warehouse as repeated visual shelf bands. Each band is almost continuous,
    // with staggered crossing points. Shelf spacing is intentionally tighter than one
    // screen-height so a player can never stand in a huge blank expanse of concrete.
    let rowIndex = 0;
    const firstRow = 4.1;
    const lastRow = MAP_H - 5.1;
    const rowGap = 3.15;
    const rackW = 3.15;
    const rackH = 2.48;
    const rackStep = 3.04;
    for (let top = firstRow; top <= lastRow; top += rowGap, rowIndex++) {
      const openings = wallOpeningsForRow(rowIndex);
      const baseImage = rowIndex % 2 === 0 ? 'box5' : 'box6';
      const altImage = rowIndex % 4 === 1 ? 'box6' : 'box5';
      let segmentIndex = 0;
      for (let x = 1.55; x < MAP_W - 3.4; x += rackStep, segmentIndex++) {
        const rect = { left: x, top, width: rackW, height: rackH };
        // A crossing is only a narrow break in the shelf wall, never a broad empty zone.
        if (openings.some(gap => x < gap + 1.65 && x + rackW > gap - .35)) continue;
        let image = segmentIndex % 5 === 4 ? altImage : baseImage;
        // Deliberate short runs of other rack shapes keep repeated walls from looking cloned.
        if (rowIndex % 6 === 3 && segmentIndex % 11 >= 7 && segmentIndex % 11 <= 9) image = 'box7';
        if (rowIndex % 7 === 4 && segmentIndex % 13 >= 9 && segmentIndex % 13 <= 11) image = 'box3';
        occupyObstacle(rect, image, { floorBand: .23, sideInset: .10 });
      }
    }
  }

  function viewportHasShelfCoverage(left, top, width, height) {
    const view = { left, top, width, height };
    return game.obstacles.filter(o => /^box[2-7]$/.test(o.image) && overlaps(view, o)).length >= 2;
  }

  function sealUnexpectedOpenPatches() {
    // Failsafe: scan overlapping camera-sized patches and add a short shelf wall if any
    // section still has too little visible warehouse storage because a special-zone clearance
    // or placement rejection left it bare.
    const patchW = Math.max(10, Math.ceil(W / TILE) + 2);
    const patchH = Math.max(7, Math.ceil((H - 70) / TILE) + 1);
    for (let top = 2; top < MAP_H - patchH - 1; top += Math.max(3, Math.floor(patchH / 2))) {
      for (let left = 2; left < MAP_W - patchW - 1; left += Math.max(5, Math.floor(patchW / 2))) {
        if (viewportHasShelfCoverage(left, top, patchW, patchH)) continue;
        const y = top + Math.floor(patchH / 2) - .6;
        const centreGap = left + Math.floor(patchW / 2);
        for (let x = left; x < left + patchW - 2; x += 3.02) {
          if (x < centreGap + 1.25 && x + 3.12 > centreGap - .35) continue;
          occupyObstacle({ left: x, top: y, width: 3.12, height: 2.42 }, ((Math.floor(x) + Math.floor(y)) % 2 === 0 ? 'box5' : 'box6'), { floorBand: .23, sideInset: .10 });
        }
      }
    }
  }
  function buildWarehouseLayout() {
    game.map = makeFloorGrid();
    game.obstacles = [];
    game.zoneProps = [];
    game.borderProps = [];
    game.decorativeProps = [];
    game.colliders = [];
    setZones();

    // Expanded warehouses must contain expanded storage, not empty concrete.
    installDenseShelfWalls();
    installExitApproachMaze();
    installSpecialAreaProps();
    sealUnexpectedOpenPatches();
    scatterConeHazards();
    installWarehouseBorder();
    scatterDecorativeClutter();
    game.floorLogos = generateFloorLogos();
  }

  function isFloorTile(x, y) { return x >= 0 && x < MAP_W && y >= 0 && y < MAP_H && game.map[y][x] === 0; }
  function allZones() { return [game.zones.quarantine, game.zones.dock, game.zones.inventory, game.zones.exit, ...game.zones.kitchens]; }
  function tileInAnyZone(t, margin = 0) {
    return allZones().some(z => t.x >= z.left - margin && t.x < z.left + z.width + margin && t.y >= z.top - margin && t.y < z.top + z.height + margin);
  }
  function availableFloorTiles(excludeZones = false) {
    const tiles = [];
    for (let y = 1; y < MAP_H - 1; y++) for (let x = 1; x < MAP_W - 1; x++) {
      const t = { x, y };
      if (isFloorTile(x, y) && (!excludeZones || !tileInAnyZone(t, 0))) tiles.push(t);
    }
    return tiles;
  }
  function tileInsideVisibleScenery(t) {
    return [...game.obstacles, ...game.zoneProps].some(prop => {
      if (prop.image === 'cone') return false;
      return t.x >= prop.left && t.x < prop.left + prop.width && t.y >= prop.top && t.y < prop.top + prop.height;
    });
  }
  function destinationPosition(z) { return tileCenter({ x: z.x, y: z.y }); }
  function occupiedAt(p, includeEnemies = true) {
    const objects = [...game.boxes, ...game.looseCoffees, ...(includeEnemies ? game.enemies : [])];
    if (includeEnemies && game.forklifts.length) objects.push(...game.forklifts);
    return objects.some(o => dist(p, o) < TILE * 0.78);
  }
  function randomFloorTile(minDistance = 0, excludeZones = true, avoidScenery = true) {
    for (let attempt = 0; attempt < 160; attempt++) {
      const t = { x: randInt(1, MAP_W - 2), y: randInt(1, MAP_H - 2) };
      if (!isFloorTile(t.x, t.y)) continue;
      if (excludeZones && tileInAnyZone(t, 0)) continue;
      if (avoidScenery && tileInsideVisibleScenery(t)) continue;
      const p = tileCenter(t);
      if ((!game.player || dist(p, game.player) >= minDistance) && !occupiedAt(p)) return t;
    }
    const tiles = shuffle(availableFloorTiles(excludeZones));
    for (const t of tiles) {
      const p = tileCenter(t);
      if (avoidScenery && tileInsideVisibleScenery(t)) continue;
      if ((!game.player || dist(p, game.player) >= minDistance) && !occupiedAt(p)) return t;
    }
    return tiles.find(t => !avoidScenery || !tileInsideVisibleScenery(t)) || tiles[0] || { x: 1, y: 1 };
  }
  function tileNearZoneEdge(z) {
    const candidates = [];
    for (let x = z.left; x < z.left + z.width; x++) {
      candidates.push({ x, y: z.top - 1 }, { x, y: z.top + z.height });
    }
    for (let y = z.top; y < z.top + z.height; y++) {
      candidates.push({ x: z.left - 1, y }, { x: z.left + z.width, y });
    }
    const filtered = shuffle(candidates.filter(t => isFloorTile(t.x, t.y) && !tileInsideVisibleScenery(t) && !(t.x === z.x && t.y === z.y)));
    return filtered[0] || randomFloorTile(0, true);
  }

  function spawnBox() {
    const t = randomFloorTile(220, true);
    if (t) game.boxes.push({ ...tileCenter(t), bob: rand(0, Math.PI * 2) });
  }
  function spawnLooseCoffee() {
    const t = randomFloorTile(250, true);
    if (t) game.looseCoffees.push({ ...tileCenter(t), bob: rand(0, Math.PI * 2) });
  }
  function makeRobotAtTile(t, guard = false, index = 0) {
    const p = tileCenter(t);
    return {
      x: p.x, y: p.y, path: [], nextPathAt: 0, speed: 102 + game.level * 8 + rand(0, 15),
      detection: (guard ? 500 : 400) + game.level * 17, facing: 'right', anim: index % 5,
      wanderingUntil: 0, disabledUntil: 0, guard, scale: rand(0.62, 1.38)
    };
  }
  function spawnEnemies() {
    game.enemies = [];
    let index = 0;
    [
      game.zones.quarantine, game.zones.quarantine, game.zones.quarantine, game.zones.quarantine,
      game.zones.dock, game.zones.dock, game.zones.dock, game.zones.dock, game.zones.dock, game.zones.dock
    ].forEach(z => {
      const t = tileNearZoneEdge(z);
      if (t) game.enemies.push(makeRobotAtTile(t, true, index++));
    });
    const roamingCount = (2 + Math.floor((game.level - 1) * 0.72)) * 2;
    for (let i = 0; i < roamingCount; i++) game.enemies.push(makeRobotAtTile(randomFloorTile(700, true), false, index++));

    // Two forklift threats patrol every warehouse; later levels can add further special hazards.
    game.forklifts = [];
    for (let i = 0; i < 2; i++) {
      const ft = i === 0 ? tileNearZoneEdge(game.zones.dock) : randomFloorTile(900, true);
      const fp = tileCenter(ft);
      game.forklifts.push({
        x: fp.x, y: fp.y, path: [], nextPathAt: 0, speed: 137 + game.level * 11 + i * 8,
        detection: 570 + game.level * 22 + i * 28, facing: 'right', wanderingUntil: 0, disabledUntil: 0,
        scale: rand(0.91, 1.12)
      });
    }
  }

  function buildLevel(level) {
    configureMapSize(level);
    game.floorTint = FLOOR_TINTS[(level - 1) % FLOOR_TINTS.length];
    buildWarehouseLayout();
    const start = destinationPosition(game.zones.dock);
    game.player = {
      x: start.x, y: start.y, r: 23, speed: 315, facing: 'down', frame: 0, anim: 0,
      moving: false, sprinting: false, invulnerableUntil: performance.now() + 2500, action: null
    };
    game.boxes = [];
    game.looseCoffees = [];
    for (let i = 0; i < activeBoxCount(); i++) spawnBox();
    for (let i = 0; i < activeCoffeeCount(); i++) spawnLooseCoffee();
    spawnEnemies();
    game.routePath = [];
    game.routeUntil = 0;
    game.truck = null;
    game.truckTimer = null;
    game.specialMusic = null;
    rebuildStaticLayer();
    centerCamera();
    saveShift();
  }

  function resetRun() {
    game.level = 1;
    game.score = 0;
    game.health = 3;
    game.coffees = 0;
    game.stats = freshStats();
    game.messages = [];
    game.particles = [];
    game.specialMusic = null;
  }
  function requireName() {
    const value = nameInput.value.trim();
    if (!value) { nameWarning.classList.remove('hidden'); nameInput.focus(); return null; }
    nameWarning.classList.add('hidden');
    game.playerName = value;
    localStorage.setItem(NAME_KEY, value);
    return value;
  }
  function performNewShift() {
    resetRun();
    game.mode = 'play';
    titleUI.classList.add('hidden');
    gameoverUI.classList.add('hidden');
    setGameplayControlsVisible(true);
    buildLevel(game.level);
    music.playGameplay(true);
    addMessage(`WELCOME, ${game.playerName.toUpperCase()} — FIND THE EXIT`, '#ff7700', 3000);
  }
  function loadSavedShift() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (_) { return null; }
  }
  function performContinueSavedShift() {
    const save = loadSavedShift();
    if (!save) { performNewShift(); return; }
    game.level = Number(save.level) || 1;
    game.score = Number(save.score) || 0;
    game.health = clamp(Number(save.health) || MAX_HEARTS, 1, MAX_HEARTS);
    game.coffees = clamp(Number(save.coffees) || 0, 0, 2);
    game.stats = { ...freshStats(), ...(save.stats || {}) };
    game.mode = 'play';
    titleUI.classList.add('hidden');
    gameoverUI.classList.add('hidden');
    setGameplayControlsVisible(true);
    buildLevel(game.level);
    music.playGameplay(true);
    addMessage('SAVED SHIFT CONTINUED — BACK AT DOCK', '#ff7700', 3000);
  }
  function introIsReady() {
    return introSlides.length > 0 && introSlides.every(slide => String(slide.text || '').trim().length > 0);
  }
  function startNewShift() {
    if (!requireName()) return;
    synth.init();
    pendingShiftStart = 'new';
    if (introIsReady()) startIntro();
    else completePendingShiftStart();
  }
  function continueSavedShift() {
    if (!requireName()) return;
    synth.init();
    pendingShiftStart = 'continue';
    if (introIsReady()) startIntro();
    else completePendingShiftStart();
  }
  function completePendingShiftStart() {
    const requested = pendingShiftStart;
    pendingShiftStart = null;
    stopIntroTyping();
    introUI.classList.add('hidden');
    introImage.classList.remove('is-visible');
    if (requested === 'continue') performContinueSavedShift();
    else performNewShift();
  }
  function stopIntroTyping() {
    if (introTypeTimer) window.clearTimeout(introTypeTimer);
    introTypeTimer = null;
  }
  function typeIntroText(text, token) {
    stopIntroTyping();
    introCaption.textContent = '';
    let index = 0;
    const step = () => {
      if (token !== introToken || game.mode !== 'intro') return;
      introCaption.textContent = text.slice(0, index);
      if (index < text.length) {
        index += 1;
        introTypeTimer = window.setTimeout(step, INTRO_TYPE_INTERVAL);
      }
    };
    step();
  }
  function tryIntroImage(names, token, index = 0) {
    if (token !== introToken || game.mode !== 'intro') return;
    if (index >= names.length) {
      introImage.src = ASSET_PATH + 'background1.jpg';
      requestAnimationFrame(() => introImage.classList.add('is-visible'));
      return;
    }
    const candidate = new Image();
    candidate.onload = () => {
      if (token !== introToken || game.mode !== 'intro') return;
      introImage.src = candidate.src;
      requestAnimationFrame(() => introImage.classList.add('is-visible'));
    };
    candidate.onerror = () => tryIntroImage(names, token, index + 1);
    candidate.src = ASSET_PATH + names[index];
  }
  function showIntroSlide(index) {
    game.introIndex = clamp(index, 0, introSlides.length - 1);
    const slide = introSlides[game.introIndex];
    const token = ++introToken;
    stopIntroTyping();
    introCaption.textContent = '';
    introImage.classList.remove('is-visible');
    introUI.classList.toggle('caption-top', slide.captionPosition === 'top');
    tryIntroImage(slide.images, token);
    music.play(slide.music, true);
    typeIntroText(slide.text, token);
    introNextButton.textContent = game.introIndex === introSlides.length - 1 ? 'Start Shift' : 'Next';
  }
  function startIntro() {
    game.mode = 'intro';
    titleUI.classList.add('hidden');
    gameoverUI.classList.add('hidden');
    setGameplayControlsVisible(false);
    introUI.classList.remove('hidden');
    showIntroSlide(0);
  }
  function nextIntroSlide() {
    if (game.mode !== 'intro') return;
    if (game.introIndex >= introSlides.length - 1) completePendingShiftStart();
    else showIntroSlide(game.introIndex + 1);
  }
  function skipIntro() {
    if (game.mode !== 'intro') return;
    music.stop();
    completePendingShiftStart();
  }
  function updateDisplayModeButton() {
    const isMobile = game.displayMode === 'mobile';
    gameShell.classList.toggle('mobile-mode', isMobile);
    displayToggleButton.querySelector('.display-icon').textContent = isMobile ? '📱' : '🖥️';
    displayToggleButton.setAttribute('aria-label', isMobile ? 'Mobile controls active. Switch to desktop controls' : 'Desktop controls active. Switch to mobile controls');
    displayToggleButton.title = isMobile ? 'Mobile controls — switch to desktop layout' : 'Desktop controls — switch to mobile layout';
  }
  function toggleDisplayMode() {
    game.displayMode = game.displayMode === 'mobile' ? 'desktop' : 'mobile';
    localStorage.setItem(DISPLAY_MODE_KEY, game.displayMode);
    updateDisplayModeButton();
    if (game.mode === 'play') addMessage(game.displayMode === 'mobile' ? 'MOBILE CONTROLS ON' : 'DESKTOP CONTROLS ON', '#ffd054', 1200);
  }

  function updateMuteButton() {
    const silent = game.muted || game.volume <= 0;
    muteToggleButton.classList.toggle('is-muted', silent);
    muteToggleButton.querySelector('.speaker-icon').textContent = silent ? '🔇' : (game.volume < 0.45 ? '🔉' : '🔊');
    muteToggleButton.setAttribute('aria-label', 'Open volume control');
    muteToggleButton.title = `Volume ${Math.round(game.volume * 100)}%`;
    volumeSlider.value = String(Math.round(game.volume * 100));
    volumeValue.textContent = `${Math.round(game.volume * 100)}%`;
  }
  function setGameplayControlsVisible(visible) {
    unstuckButton.classList.toggle('hidden', !visible);
    playControls.classList.toggle('hidden', !visible);
    if (!visible) {
      unstuckButton.disabled = false;
      stopSprint();
      directionControls.forEach(button => button.classList.remove('active'));
      actionControl.classList.remove('active');
    }
  }
  function startTitleMusic() {
    if (game.mode === 'title' && !game.muted && game.volume > 0) music.play('startup', true);
  }

  function setVolume(value) {
    game.volume = clamp(Number(value) / 100, 0, 1);
    game.muted = game.volume <= 0;
    localStorage.setItem(VOLUME_KEY, String(Math.round(game.volume * 100)));
    localStorage.setItem(MUTE_KEY, game.muted ? '1' : '0');
    music.setVolume(game.volume);
    music.setMuted(game.muted);
    updateMuteButton();
  }
  function toggleAudio() {
    if (game.muted || game.volume <= 0) setVolume(72);
    else setVolume(0);
    if (game.mode === 'play') addMessage(game.muted ? 'SOUND OFF' : `VOLUME ${Math.round(game.volume * 100)}%`, '#eadab8', 1000);
  }

  function continueAfterDeath() {
    game.health = MAX_HEARTS;
    game.coffees = 0;
    const p = destinationPosition(game.zones.dock);
    game.player = { x: p.x, y: p.y, r: 23, speed: 315, facing: 'down', frame: 0, anim: 0, moving: false, sprinting: false, invulnerableUntil: performance.now() + 3000, action: null };
    spawnEnemies();
    game.mode = 'play';
    setGameplayControlsVisible(true);
    gameoverUI.classList.add('hidden');
    game.messages = [];
    game.specialMusic = null;
    centerCamera();
    music.playGameplay(true);
    addMessage('CONTINUE SHIFT — BACK TO DOCK', '#ff7700', 2900);
    saveShift();
  }
  function saveShift() {
    if (!game.playerName || game.mode === 'title') return;
    const save = { playerName: game.playerName, level: game.level, score: game.score, health: game.health, coffees: game.coffees, stats: game.stats };
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    refreshSavedButton();
  }
  function refreshSavedButton() {
    nameInput.value = game.playerName;
    const save = loadSavedShift();
    continueSavedButton.classList.toggle('hidden', !save);
    if (save) continueSavedButton.textContent = `Continue Shift — Warehouse ${save.level} / ${formatScore(save.score)}`;
  }
  function updateBest() {
    if (game.score > game.bestScore) {
      game.bestScore = game.score;
      localStorage.setItem(BEST_KEY, String(game.score));
    }
    saveShift();
  }

  function canMove(px, py, radius = 21) {
    if (px - radius < 0 || py - radius < 0 || px + radius >= WORLD_W || py + radius >= WORLD_H) return false;
    return !game.colliders.some(collider =>
      px + radius > collider.left && px - radius < collider.left + collider.width &&
      py + radius > collider.top && py - radius < collider.top + collider.height
    );
  }
  function propOccupiesTile(prop, t) {
    const r = prop.collisionRect || prop;
    return t.x >= r.left && t.x < r.left + r.width && t.y >= r.top && t.y < r.top + r.height;
  }
  function tileHasCone(t) {
    return game.zoneProps.some(prop => prop.image === 'cone' && propOccupiesTile(prop, t));
  }
  function tileBlockedBySolid(t) {
    if (!isFloorTile(t.x, t.y) && !tileHasCone(t)) return true;
    return game.obstacles.some(obstacle => propOccupiesTile(obstacle, t)) ||
      game.zoneProps.some(prop => prop.image !== 'cone' && propOccupiesTile(prop, t));
  }
  function facingVector() {
    switch (game.player.facing) {
      case 'left': return { x: -1, y: 0 };
      case 'right': return { x: 1, y: 0 };
      case 'up': return { x: 0, y: -1 };
      default: return { x: 0, y: 1 };
    }
  }
  function beginJump(target, now) {
    const p = game.player;
    if (!p || p.action) return false;
    p.action = { type: 'jump', start: now, duration: 430, finished: false, fromX: p.x, fromY: p.y, toX: target.x, toY: target.y };
    p.moving = false;
    p.invulnerableUntil = Math.max(p.invulnerableUntil, now + 480);
    synth.jump();
    game.stats.jumps++;
    saveShift();
    return true;
  }
  function tryJump(now) {
    if (game.mode !== 'play' || !game.player || game.player.action) return false;
    const from = worldToTile(game.player.x, game.player.y);
    const dir = facingVector();
    const one = { x: from.x + dir.x, y: from.y + dir.y };
    const two = { x: from.x + dir.x * 2, y: from.y + dir.y * 2 };
    const crossedCone = tileHasCone(one) || tileHasCone(from);
    if (crossedCone && isFloorTile(two.x, two.y) && !tileBlockedBySolid(two)) {
      return beginJump(tileCenter(two), now);
    }
    if (isFloorTile(one.x, one.y) && !tileBlockedBySolid(one)) {
      return beginJump(tileCenter(one), now);
    }
    // The scout still does a hop and makes a sound, but cannot vault a solid fixture or rack.
    return beginJump({ x: game.player.x, y: game.player.y }, now);
  }
  function emergencyMove() {
    if (game.mode !== 'play' || !game.player || performance.now() < game.unstuckUntil) return;
    const start = worldToTile(game.player.x, game.player.y);
    const options = shuffle(directions);
    let target = null;
    for (const step of [3, 2, 1]) {
      for (const dir of options) {
        const t = { x: start.x + dir.x * step, y: start.y + dir.y * step };
        if (isFloorTile(t.x, t.y) && !tileBlockedBySolid(t)) { target = t; break; }
      }
      if (target) break;
    }
    if (!target) target = randomFloorTile(0, false);
    const position = tileCenter(target);
    game.player.x = position.x; game.player.y = position.y;
    game.player.action = null;
    game.player.invulnerableUntil = performance.now() + 1600;
    game.unstuckUntil = performance.now() + 4000;
    unstuckButton.disabled = true;
    window.setTimeout(() => { unstuckButton.disabled = false; }, 4000);
    centerCamera();
    synth.teleport();
    addMessage('EMERGENCY MOVE — SAFE AISLE REACHED', '#ffd054', 2200);
  }
  function pointInsideZone(p, z) {
    const t = worldToTile(p.x, p.y);
    return t.x >= z.left && t.x < z.left + z.width && t.y >= z.top && t.y < z.top + z.height;
  }
  function updateSpecialMusic() {
    let wanted = null;
    if (game.zones.kitchens.some(k => pointInsideZone(game.player, k))) wanted = 'kitchen';
    else if (pointInsideZone(game.player, game.zones.inventory)) wanted = 'inventory';
    if (wanted !== game.specialMusic) {
      game.specialMusic = wanted;
      if (wanted) music.play(wanted, true);
      else music.playGameplay();
    }
  }

  function startPlayerAction(type, duration, callback) {
    if (game.player.action) return false;
    game.player.action = { type, start: performance.now(), duration, callback, finished: false };
    game.player.moving = false;
    return true;
  }
  function startSprint() {
    const p = game.player;
    if (game.mode !== 'play' || !p || p.action || p.sprinting || !p.moving || game.coffees <= 0) return false;
    game.coffees -= 1;
    game.stats.coffeeSprints++;
    p.sprinting = true;
    synth.pickup();
    addMessage('COFFEE BOOST — RUN!', '#e38537', 1400);
    saveShift();
    return true;
  }
  function stopSprint() {
    if (game.player) game.player.sprinting = false;
  }
  function handleActionPress(now) {
    if (game.mode !== 'play' || !game.player || game.player.action) return false;
    if (openNearbyBox(now)) return true;
    if (game.player.moving && game.coffees > 0 && startSprint()) return true;
    return tryJump(now);
  }

  function updatePlayerAction(now) {
    const action = game.player && game.player.action;
    if (!action) return false;
    if (action.type === 'jump') {
      const progress = clamp((now - action.start) / action.duration, 0, 1);
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      game.player.x = action.fromX + (action.toX - action.fromX) * eased;
      game.player.y = action.fromY + (action.toY - action.fromY) * eased;
      centerCamera();
    }
    if (!action.finished && now >= action.start + action.duration) {
      action.finished = true;
      const callback = action.callback;
      if (action.type === 'jump') { game.player.x = action.toX; game.player.y = action.toY; }
      game.player.action = null;
      if (callback) callback();
    }
    return true;
  }
  function updatePlayer(dt, now) {
    if (updatePlayerAction(now)) { centerCamera(); return; }
    const p = game.player;
    let dx = 0, dy = 0;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) dx--;
    if (keys.has('ArrowRight') || keys.has('KeyD')) dx++;
    if (keys.has('ArrowUp') || keys.has('KeyW')) dy--;
    if (keys.has('ArrowDown') || keys.has('KeyS')) dy++;
    p.moving = dx !== 0 || dy !== 0;
    if (p.sprinting && (!p.moving || !keys.has('Space'))) stopSprint();
    if (p.moving) {
      const len = Math.hypot(dx, dy); dx /= len; dy /= len;
      if (Math.abs(dx) > Math.abs(dy)) p.facing = dx > 0 ? 'right' : 'left';
      else p.facing = dy > 0 ? 'down' : 'up';
      const step = p.speed * (p.sprinting ? 1.72 : 1) * dt;
      if (canMove(p.x + dx * step, p.y, p.r)) p.x += dx * step;
      if (canMove(p.x, p.y + dy * step, p.r)) p.y += dy * step;
      p.anim += dt * (p.sprinting ? 17 : 10);
      p.frame = Math.floor(p.anim) % 5;
    } else p.frame = 0;

    for (let i = game.looseCoffees.length - 1; i >= 0; i--) {
      if (dist(p, game.looseCoffees[i]) < 48) {
        collectCoffee();
        game.looseCoffees.splice(i, 1);
        spawnLooseCoffee();
      }
    }
    // Reaching any visible part of the marked EXIT zone completes the warehouse; no action-button press is required.
    if (pointInsideZone(p, game.zones.exit)) triggerLevelWin();
    if (pointInsideZone(p, game.zones.inventory) && now >= game.inventoryCooldownUntil) startInventoryBriefing();
    updateSpecialMusic();
    centerCamera();
  }
  function centerCamera() {
    if (!game.player) return;
    game.camera.x = clamp(game.player.x - W / 2, 0, Math.max(0, WORLD_W - W));
    game.camera.y = clamp(game.player.y - H / 2, 0, Math.max(0, WORLD_H - H));
  }

  function bfs(start, goal) {
    const q = [start];
    const seen = new Set([cellKey(start.x, start.y)]);
    const prev = new Map();
    while (q.length) {
      const c = q.shift();
      if (c.x === goal.x && c.y === goal.y) break;
      for (const d of directions) {
        const n = { x: c.x + d.x, y: c.y + d.y };
        const key = cellKey(n.x, n.y);
        if (isFloorTile(n.x, n.y) && !seen.has(key)) { seen.add(key); prev.set(key, c); q.push(n); }
      }
    }
    const goalKey = cellKey(goal.x, goal.y);
    if (!seen.has(goalKey)) return [];
    const path = [];
    let cur = goal;
    while (cur.x !== start.x || cur.y !== start.y) {
      path.unshift(cur);
      cur = prev.get(cellKey(cur.x, cur.y));
      if (!cur) return [];
    }
    return path;
  }
  function moveAlongPath(entity, dt) {
    if (!entity.path.length) return;
    const target = tileCenter(entity.path[0]);
    let dx = target.x - entity.x;
    let dy = target.y - entity.y;
    const length = Math.hypot(dx, dy);
    if (length < 6) { entity.x = target.x; entity.y = target.y; entity.path.shift(); return; }
    dx /= length; dy /= length;
    entity.facing = dx >= 0 ? 'right' : 'left';
    const step = Math.min(entity.speed * dt, length);
    entity.x += dx * step;
    entity.y += dy * step;
  }
  function updateEnemy(enemy, dt, now, forklift = false) {
    if (!enemy) return;
    if (now < enemy.disabledUntil) return;
    const pt = worldToTile(game.player.x, game.player.y);
    const et = worldToTile(enemy.x, enemy.y);
    const chasing = dist(enemy, game.player) < enemy.detection;
    if (now >= enemy.nextPathAt) {
      if (chasing) {
        enemy.path = bfs(et, pt).slice(0, forklift ? 18 : 13);
        enemy.nextPathAt = now + (forklift ? 300 : 430);
      } else if (!enemy.path.length || now > enemy.wanderingUntil) {
        const target = enemy.guard && Math.random() < .7 ? tileNearZoneEdge(Math.random() < .5 ? game.zones.dock : game.zones.quarantine) : randomFloorTile(0, false);
        enemy.path = bfs(et, target).slice(0, randInt(3, forklift ? 13 : 9));
        enemy.wanderingUntil = now + randInt(1800, 4500);
        enemy.nextPathAt = now + 1000;
      }
    }
    moveAlongPath(enemy, dt);
    enemy.anim = (enemy.anim || 0) + dt * 7;
    if (dist(enemy, game.player) < (forklift ? 73 * enemy.scale : 43 * enemy.scale)) damagePlayer(forklift ? 2 : 1, now, forklift ? 'FORKLIFT COLLISION!' : 'ROBOT COLLISION!', enemy);
  }
  function damagePlayer(amount, now, label, attacker) {
    if (game.mode !== 'play' || game.player.action || now < game.player.invulnerableUntil) return;
    const damage = amount === 2 ? 2 : 1;
    game.health = Math.max(0, game.health - damage);
    if (damage > 1) game.stats.forkliftHits++;
    else game.stats.robotHits++;
    game.player.invulnerableUntil = now + 2600;
    if (attacker) {
      attacker.disabledUntil = now + 30000;
      attacker.path = [];
      const dx = game.player.x - attacker.x;
      const dy = game.player.y - attacker.y;
      const len = Math.hypot(dx, dy) || 1;
      const push = TILE * 0.72;
      const targetX = game.player.x + dx / len * push;
      const targetY = game.player.y + dy / len * push;
      if (canMove(targetX, targetY, game.player.r)) {
        game.player.x = targetX;
        game.player.y = targetY;
      }
    }
    synth.hurt();
    synth.powerDown();
    shake(12);
    const remaining = `${game.health}/${MAX_HEARTS} HEARTS REMAINING`;
    addMessage(`${label}  -${damage} HEART${damage > 1 ? 'S' : ''} — ${remaining}`, '#ee394d', 2900);
    burst(game.player.x, game.player.y, '#ee394d', 15);
    if (game.health <= 0) triggerDeath();
    updateBest();
  }

  function collectCoffee() {
    game.coffees++;
    game.stats.coffeesCollected++;
    if (game.coffees >= 3) {
      game.coffees = 0;
      if (game.health < MAX_HEARTS) { game.health++; addMessage('3 COFFEES — HEART RESTORED!', '#e38537', 1800); }
      else { game.score += 100; addMessage('FULL ENERGY — +100', '#e38537', 1600); }
    } else addMessage(`COFFEE COLLECTED  ${game.coffees}/3`, '#e38537', 1350);
    synth.pickup();
    updateBest();
  }

  const lootTable = [
    { id: 'offline', weight: 18 }, { id: 'order', weight: 15 }, { id: 'shares', weight: 8 }, { id: 'heart', weight: 7 },
    { id: 'coffee', weight: 12 }, { id: 'return', weight: 9 }, { id: 'mixed', weight: 7 }, { id: 'mould', weight: 7 },
    { id: 'break', weight: 6 }, { id: 'ops', weight: 3 }, { id: 'empty', weight: 8 }
  ];
  function weightedLoot() {
    const total = lootTable.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of lootTable) { roll -= item.weight; if (roll <= 0) return item.id; }
    return 'empty';
  }
  function openNearbyBox(now) {
    if (game.player.action || game.mode !== 'play') return false;
    let closest = null;
    let index = -1;
    let distance = TILE * 1.30;
    game.boxes.forEach((box, i) => {
      const d = dist(game.player, box);
      if (d < distance) { closest = box; index = i; distance = d; }
    });
    if (closest) {
      const result = weightedLoot();
      game.boxes.splice(index, 1);
      spawnBox();
      game.stats.boxesOpened++;
      burst(closest.x, closest.y, '#ff6900', 10);
      startPlayerAction('pickup', 610, () => resolveLoot(result, performance.now()));
      saveShift();
      return true;
    }
    if (game.truck && dist(game.player, destinationPosition(game.zones.dock)) < TILE * 3.7) {
      game.score += 500;
      game.stats.trucksCompleted++;
      if (game.truck) {
        game.truck.phase = 'leaving';
        game.truck.leaveStarted = performance.now();
        game.truck.until = performance.now();
      }
      game.truckTimer = null;
      synth.points();
      addMessage('CARRIER ORDER ACCEPTED  +500', '#ff7700', 2500);
      updateBest();
      return true;
    }
    return false;
  }
  function resolveLoot(item, now) {
    switch (item) {
      case 'offline': game.score += 100; game.stats.offlineStock++; synth.points(); addMessage('OFFLINE STOCK  +100', '#ffd054', 1700); break;
      case 'order': game.score += 200; game.stats.customerOrders++; synth.points(); addMessage('UNSHIPPED CUSTOMER ORDER  +200', '#ffd054', 1850); break;
      case 'shares': game.score += 300; game.stats.sharesFound++; synth.points(); addMessage('ZALANDO SHARES  +300', '#ff7700', 1900); break;
      case 'heart':
        game.stats.heartsFound++;
        if (game.health < MAX_HEARTS) { game.health++; synth.pickup(); addMessage('HEART RESTORED!', '#ed4959', 1600); }
        else { game.score += 100; synth.points(); addMessage('FULL HEALTH  +100', '#ed4959', 1600); }
        break;
      case 'coffee': collectCoffee(); return;
      case 'return': game.score += 150; game.stats.returnsProcessed++; teleportTo(game.zones.dock, 'RETURN — SENT TO DOCK  +150', null); break;
      case 'mixed': game.stats.mixedStock++; teleportTo(game.zones.inventory, 'MIXED STOCK — INVENTORY CHECK', 'inventory'); startInventoryBriefing(); break;
      case 'mould': game.stats.mouldyClothes++; teleportTo(game.zones.quarantine, 'MOULDY CLOTHES — QUARANTINE', null); break;
      case 'break': game.stats.lunchBreaks++; teleportTo(choice(game.zones.kitchens), 'COFFEE BREAK — SENT TO KITCHEN', 'kitchen'); break;
      case 'ops':
        game.stats.opsFinds++;
        game.routePath = bfs(worldToTile(game.player.x, game.player.y), { x: game.zones.exit.x, y: game.zones.exit.y });
        game.routeUntil = now + 10000;
        game.score += 250;
        synth.route();
        addMessage('OPERATIONS EXCELLENCE — ROUTE REVEALED  +250', '#ff7700', 2800);
        break;
      default: synth.note(180, .08, 'square', .03); addMessage('EMPTY BOX', '#e9dac2', 1250);
    }
    updateBest();
  }
  function teleportTo(z, message, track) {
    const p = destinationPosition(z);
    game.player.x = p.x;
    game.player.y = p.y;
    game.player.invulnerableUntil = performance.now() + 2600;
    centerCamera();
    synth.teleport();
    shake(8);
    addMessage(message, '#ff7700', 2200);
    burst(p.x, p.y, '#ff7700', 17);
    game.specialMusic = track;
    if (track) music.play(track, true);
    else music.playGameplay();
    saveShift();
  }

  function startInventoryBriefing() {
    if (game.mode !== 'play' || performance.now() < game.inventoryCooldownUntil) return;
    game.stats.inventoryChecks++;
    game.mode = 'inventoryBriefing';
    setGameplayControlsVisible(false);
    game.inventoryBriefUntil = performance.now() + 3400;
    keys.clear();
    game.specialMusic = 'inventory';
    music.play('inventory', true);
  }
  function randomClothingType() { return randInt(0, 11); }
  function createInventoryPuzzle() {
    const cells = Array.from({ length: PUZZLE_SIZE }, () => randomClothingType());
    const emptyIndex = randInt(0, PUZZLE_SIZE - 1);
    cells[emptyIndex] = null;
    game.inventoryPuzzle = {
      cells, emptyIndex, selectedEmpty: false, until: performance.now() + INVENTORY_DURATION,
      scoreEarned: 0, matches: 0, packed: [], flashUntil: 0, flashText: ''
    };
    game.mode = 'inventoryPuzzle';
  }
  function puzzleGridMetrics() {
    return { x: 58, y: 124, cell: 70, gap: 8, cols: PUZZLE_COLS, rows: PUZZLE_ROWS };
  }
  function puzzleCellAt(px, py) {
    const m = puzzleGridMetrics();
    for (let i = 0; i < PUZZLE_SIZE; i++) {
      const col = i % m.cols, row = Math.floor(i / m.cols);
      const x = m.x + col * (m.cell + m.gap), y = m.y + row * (m.cell + m.gap);
      if (px >= x && px <= x + m.cell && py >= y && py <= y + m.cell) return i;
    }
    return -1;
  }
  function handleInventoryClick(x, y) {
    const puzzle = game.inventoryPuzzle;
    if (!puzzle || game.mode !== 'inventoryPuzzle') return;
    const index = puzzleCellAt(x, y);
    if (index < 0) return;
    if (index === puzzle.emptyIndex) { puzzle.selectedEmpty = true; return; }
    if (!puzzle.selectedEmpty) return;
    const movedType = puzzle.cells[index];
    puzzle.cells[puzzle.emptyIndex] = movedType;
    puzzle.cells[index] = null;
    const movedTo = puzzle.emptyIndex;
    puzzle.emptyIndex = index;
    puzzle.selectedEmpty = false;
    checkInventoryMatch(movedTo);
  }
  function checkInventoryMatch(index) {
    const pz = game.inventoryPuzzle;
    const item = pz.cells[index];
    if (item === null) return;
    const row = Math.floor(index / PUZZLE_COLS), col = index % PUZZLE_COLS;
    const neighbours = [];
    if (row > 0) neighbours.push(index - PUZZLE_COLS);
    if (row < PUZZLE_ROWS - 1) neighbours.push(index + PUZZLE_COLS);
    if (col > 0) neighbours.push(index - 1);
    if (col < PUZZLE_COLS - 1) neighbours.push(index + 1);
    const match = neighbours.find(n => pz.cells[n] === item);
    if (match === undefined) return;
    pz.cells[index] = null;
    pz.cells[match] = null;
    pz.cells[index] = randomClothingType();
    pz.cells[match] = randomClothingType();
    pz.scoreEarned += 50;
    pz.matches++;
    pz.packed.push(item);
    game.score += 50;
    game.stats.inventoryMatches++;
    pz.flashText = '+50  PAIR PACKED!';
    pz.flashUntil = performance.now() + 850;
    synth.points();
    updateBest();
  }
  function finishInventoryPuzzle() {
    const pz = game.inventoryPuzzle;
    if (!pz) return;
    let resultText = `INVENTORY CHECK COMPLETE  +${pz.scoreEarned}`;
    if (pz.scoreEarned === 0) {
      game.score = Math.max(0, game.score - 100);
      resultText = 'NO ITEMS MATCHED  -100';
    }
    const exitTile = tileNearZoneEdge(game.zones.inventory);
    const pos = tileCenter(exitTile);
    game.player.x = pos.x; game.player.y = pos.y;
    game.player.invulnerableUntil = performance.now() + 2300;
    game.inventoryCooldownUntil = performance.now() + 30000;
    game.inventoryPuzzle = null;
    game.specialMusic = null;
    game.mode = 'play';
    setGameplayControlsVisible(true);
    centerCamera();
    music.playGameplay();
    addMessage(resultText, '#ff7700', 3000);
    updateBest();
  }

  function triggerLevelWin() {
    if (game.player.action || game.mode !== 'play') return;
    music.play('winner', false);
    startPlayerAction('win', 1040, () => {
      game.score += 750 + game.health * 100;
      game.health = Math.min(MAX_HEARTS, game.health + 1);
      game.stats.warehousesCleared++;
      game.level++;
      updateBest();
      game.mode = 'transition';
      game.transitionUntil = performance.now() + 2400;
    });
  }
  function finishTransition() {
    game.mode = 'play';
    setGameplayControlsVisible(true);
    buildLevel(game.level);
    music.playGameplay(true);
    addMessage(`WAREHOUSE ${game.level} — THREATS INCREASED`, '#ff7700', 3200);
  }
  function triggerDeath() {
    if (game.mode !== 'play') return;
    game.mode = 'dying';
    setGameplayControlsVisible(false);
    music.stop();
    startPlayerAction('death', 1080, () => {
      game.mode = 'gameover';
      updateBest();
      gameoverUI.classList.remove('hidden');
      music.play('gameover', true);
      saveShift();
    });
  }

  function zoneOnScreen(z) {
    const margin = TILE * .3;
    const x = z.left * TILE - game.camera.x;
    const y = z.top * TILE - game.camera.y;
    return x + z.width * TILE > -margin && x < W + margin && y + z.height * TILE > -margin && y < H + margin;
  }
  function updateTruck(now) {
    const dockVisible = zoneOnScreen(game.zones.dock);
    if (game.truck) {
      if (game.truck.phase === 'arriving' && now >= game.truck.arriveStarted + 1250) game.truck.phase = 'waiting';
      if (game.truck.phase === 'leaving' && now >= game.truck.leaveStarted + 1100) {
        game.truck = null;
        game.truckTimer = null;
        return;
      }
      if (game.truck.phase !== 'leaving' && now >= game.truck.until) {
        game.truck.phase = 'leaving';
        game.truck.leaveStarted = now;
        addMessage('CARRIER DEPARTED — ORDER MISSED', '#e8d3ae', 1900);
      }
      return;
    }
    if (dockVisible) game.truckTimer = null;
    else {
      if (!game.truckTimer) game.truckTimer = { due: now + randInt(60000, 180000) };
      if (now >= game.truckTimer.due) {
        game.truck = { until: now + 30000, phase: 'arriving', arriveStarted: now };
        synth.truck();
        addMessage('CARRIER AT DOCK — 30 SECONDS!', '#ff7700', 3500);
      }
    }
  }

  let shakeAmount = 0;
  function shake(amount) { shakeAmount = Math.max(shakeAmount, amount); }
  function burst(x, y, color, count) {
    for (let i = 0; i < count; i++) game.particles.push({ x, y, vx: rand(-140, 140), vy: rand(-140, 140), life: rand(.25, .7), color });
  }
  function updateParticles(dt) {
    game.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
    game.particles = game.particles.filter(p => p.life > 0);
    shakeAmount *= .86;
  }
  function addMessage(text, color, duration) {
    game.messages.unshift({ text, color, until: performance.now() + duration });
    game.messages = game.messages.slice(0, 4);
  }

  function update(dt, now) {
    if (game.mode === 'play') {
      updatePlayer(dt, now);
      game.enemies.forEach(enemy => updateEnemy(enemy, dt, now, false));
      game.forklifts.forEach(forklift => updateEnemy(forklift, dt, now, true));
      updateTruck(now);
      game.messages = game.messages.filter(message => message.until > now);
    } else if (game.mode === 'inventoryBriefing' && now >= game.inventoryBriefUntil) {
      createInventoryPuzzle();
    } else if (game.mode === 'inventoryPuzzle' && game.inventoryPuzzle && now >= game.inventoryPuzzle.until) {
      finishInventoryPuzzle();
    } else if (game.mode === 'dying') {
      updatePlayerAction(now);
      game.messages = game.messages.filter(message => message.until > now);
    } else if (game.mode === 'transition' && now >= game.transitionUntil) finishTransition();
    updateParticles(dt);
  }

  function onScreenRect(x, y, w, h, margin = DRAW_MARGIN) {
    return x + w >= game.camera.x - margin && x <= game.camera.x + W + margin &&
      y + h >= game.camera.y - margin && y <= game.camera.y + H + margin;
  }
  function isZoneVisible(z, margin = DRAW_MARGIN) {
    return onScreenRect(z.left * TILE, z.top * TILE, z.width * TILE, z.height * TILE, margin);
  }
  function drawShadow(x, y, w, h, alpha = .25) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h * .93, Math.max(8, w * .31), Math.max(4, h * .065), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawCoverImage(img, x, y, w, h, alpha = 1) {
    const scale = Math.max(w / img.width, h / img.height);
    const sw = w / scale, sh = h / scale;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
    ctx.restore();
  }
  function drawContain(img, x, y, w, h, alpha = 1, shadow = false, flip = false) {
    if (!img) return;
    const scale = Math.min(w / img.width, h / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    const px = x + (w - dw) / 2, py = y + (h - dh) / 2;
    if (shadow) drawShadow(px, py, dw, dh, .25 * alpha);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (flip) {
      ctx.translate(px + dw, py);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, dw, dh);
    } else ctx.drawImage(img, px, py, dw, dh);
    ctx.restore();
  }
  function spriteFrame(img, cols, rows, col, row, dx, dy, dw, dh, flip = false, alpha = 1, shadow = true) {
    const sw = img.width / cols, sh = img.height / rows;
    if (shadow) drawShadow(dx, dy, dw, dh, .28 * alpha);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (flip) { ctx.translate(dx + dw, dy); ctx.scale(-1, 1); ctx.drawImage(img, col * sw, row * sh, sw, sh, 0, 0, dw, dh); }
    else ctx.drawImage(img, col * sw, row * sh, sw, sh, dx, dy, dw, dh);
    ctx.restore();
  }
  function drawPatternRect(pattern, x, y, w, h, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pattern;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  function currentViewWorldRect(padding = 170) {
    const x = Math.max(0, game.camera.x - padding);
    const y = Math.max(0, game.camera.y - padding);
    const right = Math.min(WORLD_W, game.camera.x + W + padding);
    const bottom = Math.min(WORLD_H, game.camera.y + H + padding);
    return { x, y, width: right - x, height: bottom - y };
  }
  function drawFloors() {
    const view = currentViewWorldRect();
    drawPatternRect(patterns.cement, view.x, view.y, view.width, view.height);
    ctx.save();
    ctx.fillStyle = game.floorTint;
    ctx.fillRect(view.x, view.y, view.width, view.height);
    if (images.zalandologo) {
      game.floorLogos.forEach(logo => {
        const estimatedH = logo.w * .46;
        if (!onScreenRect(logo.x - logo.w / 2, logo.y - estimatedH / 2, logo.w, estimatedH, 90)) return;
        ctx.save();
        ctx.globalAlpha = logo.alpha;
        ctx.translate(logo.x, logo.y);
        ctx.rotate(logo.rotation);
        const scale = Math.min(logo.w / images.zalandologo.width, (logo.w * .46) / images.zalandologo.height);
        const w = images.zalandologo.width * scale, h = images.zalandologo.height * scale;
        ctx.drawImage(images.zalandologo, -w / 2, -h / 2, w, h);
        ctx.restore();
      });
    }
    ctx.restore();
    if (isZoneVisible(game.zones.quarantine, 50)) drawPatternRect(patterns.qs, game.zones.quarantine.left * TILE, game.zones.quarantine.top * TILE, game.zones.quarantine.width * TILE, game.zones.quarantine.height * TILE);
    if (isZoneVisible(game.zones.inventory, 50)) drawPatternRect(patterns.carpet, game.zones.inventory.left * TILE, game.zones.inventory.top * TILE, game.zones.inventory.width * TILE, game.zones.inventory.height * TILE);
    game.zones.kitchens.forEach(k => { if (isZoneVisible(k, 50)) drawPatternRect(patterns.tiles, k.left * TILE, k.top * TILE, k.width * TILE, k.height * TILE); });
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.055)';
    ctx.fillRect(view.x, view.y, view.width, view.height);
    ctx.restore();
  }
  function drawSceneryProp(prop, shadow = true) {
    if (!prop || !images[prop.image]) return;
    if (!onScreenRect(prop.left * TILE, prop.top * TILE, prop.width * TILE, prop.height * TILE, 100)) return;
    const inset = prop.image === 'box5' || prop.image === 'box6' ? 2 : 5;
    let width = prop.width * TILE - inset * 2;
    let height = prop.height * TILE - inset * 2;
    if (prop.image === 'cone') { width *= .78; height *= .86; }
    drawContain(images[prop.image], prop.left * TILE + inset, prop.top * TILE + inset, width, height, 1, shadow, !!prop.flipX);
  }
  function drawObstacles() {
    game.borderProps.forEach(prop => drawSceneryProp(prop, true));
    game.obstacles.forEach(o => drawSceneryProp(o, true));
  }
  function propNeedsForegroundLayer(prop) {
    if (!game.player || !prop || !prop.collisionRect || prop.image === 'cone') return false;
    const left = prop.left * TILE - 48;
    const right = (prop.left + prop.width) * TILE + 48;
    const top = prop.top * TILE - 10;
    const footY = (prop.collisionRect.top + prop.collisionRect.height) * TILE;
    return game.player.x > left && game.player.x < right && game.player.y > top && game.player.y < footY;
  }
  function drawForegroundSceneryOverPlayer() {
    [...game.obstacles, ...game.zoneProps].forEach(prop => {
      if (propNeedsForegroundLayer(prop) && onScreenRect(prop.left * TILE, prop.top * TILE, prop.width * TILE, prop.height * TILE, 30)) {
        drawSceneryProp(prop, false);
      }
    });
  }
  function drawDecorativeClutter() {
    game.decorativeProps.forEach(prop => {
      if (!images[prop.image]) return;
      if (!onScreenRect(prop.left * TILE, prop.top * TILE, prop.width * TILE, prop.height * TILE, 60)) return;
      drawContain(images[prop.image], prop.left * TILE, prop.top * TILE, prop.width * TILE, prop.height * TILE, 1, true, !!prop.flipX);
    });
  }
  function drawZoneSign(text, z, width = 235) {
    const x = z.left * TILE + z.width * TILE / 2 - width / 2;
    const y = z.top * TILE + 10;
    drawShadow(x, y, width, 58, .22);
    ctx.save();
    ctx.drawImage(images.sign, x, y, width, 58);
    ctx.font = 'bold 19px Trebuchet MS';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#29231d';
    ctx.fillText(text, x + width / 2, y + 36);
    ctx.restore();
  }
  function drawDock(z) {
    ctx.save();
    ctx.fillStyle = 'rgba(246,183,53,.2)';
    ctx.fillRect(z.left * TILE + 10, z.top * TILE + TILE * 2.4, z.width * TILE - 20, TILE * 3.5);
    ctx.strokeStyle = '#f0a623';
    ctx.lineWidth = 8;
    ctx.setLineDash([34, 22]);
    ctx.beginPath();
    ctx.moveTo(z.left * TILE + 25, z.top * TILE + TILE * 5.5);
    ctx.lineTo((z.left + z.width) * TILE - 25, z.top * TILE + TILE * 5.5);
    ctx.stroke();
    ctx.restore();
    drawZoneSign('DOCK', z, 230);
    drawContain(images.entrance, z.left * TILE + 18, z.top * TILE + 64, TILE * 8.1, TILE * 3.0, .96, true);
    // Truck is drawn dynamically above the cached warehouse layer when it arrives.
  }
  function drawZones() {
    const q = game.zones.quarantine, inv = game.zones.inventory, ex = game.zones.exit;
    if (isZoneVisible(q, 120)) drawZoneSign('QUARANTINE STORAGE', q, 420);
    if (isZoneVisible(game.zones.dock, 120)) drawDock(game.zones.dock);
    if (isZoneVisible(inv, 120)) drawZoneSign('INVENTORY CHECK', inv, 365);
    game.zones.kitchens.forEach(k => { if (isZoneVisible(k, 120)) drawZoneSign('KITCHEN', k, 220); });
    game.zoneProps.forEach(prop => drawSceneryProp(prop, true));

    if (!isZoneVisible(ex, 120)) return;
    drawZoneSign('EXIT', ex, 190);
    const exitX = ex.left * TILE + TILE * .42, exitY = ex.top * TILE + TILE * .94;
    const exitW = ex.width * TILE - TILE * .84, exitH = ex.height * TILE - TILE * 1.40;
    drawContain(images.exit, exitX, exitY, exitW, exitH, 1, true);
  }

  function rebuildStaticLayer() {
    // Large warehouses are drawn only inside the camera view instead of allocating a canvas for the entire map.
    staticLayer = null;
  }
  function drawStaticWorldView() {
    drawFloors();
    drawObstacles();
    drawZones();
    drawDecorativeClutter();
  }
  function truckDrawX(now) {
    const z = game.zones.dock;
    const targetX = z.left * TILE + TILE * 7.7;
    const startX = z.left * TILE - TILE * 8.5;
    if (!game.truck) return targetX;
    if (game.truck.phase === 'arriving') {
      const progress = clamp((now - game.truck.arriveStarted) / 1250, 0, 1);
      return startX + (targetX - startX) * progress;
    }
    if (game.truck.phase === 'leaving') {
      const endX = z.left * TILE + TILE * 20;
      const progress = clamp((now - game.truck.leaveStarted) / 1100, 0, 1);
      return targetX + (endX - targetX) * progress;
    }
    return targetX;
  }
  function drawLiveTruck(now) {
    if (!game.truck || !isZoneVisible(game.zones.dock, 40)) return;
    const z = game.zones.dock;
    drawContain(images.truck, truckDrawX(now), z.top * TILE + TILE * 4.4, TILE * 9.0, TILE * 3.2, 1, true);
  }

  function drawRoute(now) {
    if (now >= game.routeUntil || !game.routePath.length) return;
    ctx.save();
    game.routePath.forEach((t, index) => {
      const x = t.x * TILE + TILE / 2;
      const y = t.y * TILE + TILE / 2;
      if (!onScreenRect(x - 25, y - 25, 50, 50, 60)) return;
      const pulse = .5 + .27 * Math.sin(now / 140 + index * .55);
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#ff6900';
      ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
      if (index < game.routePath.length - 1) {
        const n = game.routePath[index + 1];
        ctx.strokeStyle = '#ff6900'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(n.x * TILE + TILE / 2, n.y * TILE + TILE / 2); ctx.stroke();
      }
    });
    ctx.restore();
  }
  function drawPickups(now) {
    game.boxes.forEach(box => {
      if (!onScreenRect(box.x - 82, box.y - 68, 164, 126, 40)) return;
      const bob = Math.sin(now / 245 + box.bob) * 4;
      const pulse = .32 + .20 * (1 + Math.sin(now / 170 + box.bob)) / 2;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#ff6900';
      ctx.beginPath(); ctx.ellipse(box.x, box.y + 8, 70, 41, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      drawContain(images.pickup, box.x - 66, box.y - 49 + bob, 132, 94, 1, true);
    });
    game.looseCoffees.forEach(coffee => {
      if (!onScreenRect(coffee.x - 26, coffee.y - 50, 52, 80, 35)) return;
      const bob = Math.sin(now / 245 + coffee.bob) * 5;
      drawContain(images.coffee, coffee.x - 24, coffee.y - 44 + bob, 48, 68, 1, true);
    });
  }
  function drawPlayer(now) {
    const p = game.player;
    if (!p) return;
    if (now < p.invulnerableUntil && Math.floor(now / 100) % 2 === 0 && game.mode === 'play') return;
    if (p.action && p.action.type === 'jump') {
      const progress = clamp((now - p.action.start) / p.action.duration, 0, 1);
      const lift = Math.sin(progress * Math.PI) * 46;
      const row = p.facing === 'down' ? 0 : p.facing === 'up' ? 1 : 2;
      const flip = p.facing === 'left';
      spriteFrame(images.walksprite, 5, 3, Math.min(4, Math.floor(progress * 5)), row, p.x - 54, p.y - 90 - lift, 108, 146, flip, 1, true);
      return;
    }
    if (p.action) {
      const row = p.action.type === 'death' ? 0 : p.action.type === 'win' ? 1 : 2;
      const progress = clamp((now - p.action.start) / p.action.duration, 0, .999);
      const frame = Math.min(4, Math.floor(progress * 5));
      spriteFrame(images.actionssprite, 5, 3, frame, row, p.x - 58, p.y - 93, 116, 150, false, 1, true);
      return;
    }
    const row = p.facing === 'down' ? 0 : p.facing === 'up' ? 1 : 2;
    const flip = p.facing === 'left';
    spriteFrame(images.walksprite, 5, 3, p.frame, row, p.x - 54, p.y - 90, 108, 146, flip, 1, true);
  }
  function drawEnemyPowerDown(enemy, now, width = 128) {
    const remain = Math.ceil((enemy.disabledUntil - now) / 1000);
    if (remain <= 0) return;
    ctx.save();
    ctx.font = 'bold 13px Trebuchet MS';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(20,22,24,.86)';
    ctx.fillRect(enemy.x - width / 2, enemy.y - 82, width, 25);
    ctx.strokeStyle = '#ff6900'; ctx.strokeRect(enemy.x - width / 2, enemy.y - 82, width, 25);
    ctx.fillStyle = '#ffd054'; ctx.fillText(`POWER DOWN ${remain}s`, enemy.x, enemy.y - 65);
    ctx.restore();
  }
  function drawEnemies(now) {
    game.enemies.forEach(enemy => {
      if (!onScreenRect(enemy.x - 54, enemy.y - 90, 108, 145, 75)) return;
      const disabled = now < enemy.disabledUntil;
      const frame = disabled ? 4 : Math.floor(enemy.anim) % 5;
      const alpha = disabled ? .5 : 1;
      const ew = 98 * enemy.scale, eh = 126 * enemy.scale;
      spriteFrame(images.evilguysprite, 5, 2, frame, 0, enemy.x - ew / 2, enemy.y - eh * .63, ew, eh, enemy.facing === 'left', alpha, true);
      if (disabled) drawEnemyPowerDown(enemy, now, 130);
    });
    game.forklifts.forEach(forklift => {
      if (!onScreenRect(forklift.x - 150, forklift.y - 75, 300, 180, 105)) return;
      const disabled = now < forklift.disabledUntil;
      const forkliftAlpha = disabled ? .53 : 1;
      const fw = 296 * forklift.scale, fh = 174 * forklift.scale;
      drawShadow(forklift.x - fw / 2, forklift.y - fh * .42, fw, fh, .3 * forkliftAlpha);
      ctx.save();
      ctx.globalAlpha = forkliftAlpha;
      drawContain(images.evilguy, forklift.x - fw / 2, forklift.y - fh * .42, fw, fh, 1, false, forklift.facing === 'left');
      ctx.restore();
      if (disabled) drawEnemyPowerDown(forklift, now, 156);
    });
  }
  function drawParticles() {
    game.particles.forEach(p => {
      if (!onScreenRect(p.x - 8, p.y - 8, 16, 16, 25)) return;
      ctx.save(); ctx.globalAlpha = clamp(p.life * 2, 0, 1); ctx.fillStyle = p.color; ctx.fillRect(p.x - 5, p.y - 5, 10, 10); ctx.restore();
    });
  }

  function formatScore(value) { return String(Math.round(value)).padStart(5, '0'); }
  function drawCarrierToast(now) {
    if (!game.truck || game.truck.phase === 'leaving') return;
    const seconds = Math.max(0, Math.ceil((game.truck.until - now) / 1000));
    const pulse = .82 + .18 * Math.sin(now / 135);
    const text = `🚚  GO TO DOCK TO ACCEPT DELIVERY  +500   ${seconds}s`;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.font = 'bold 21px Trebuchet MS';
    const width = Math.max(550, ctx.measureText(text).width + 52);
    const x = (W - width) / 2;
    const y = H - 93;
    ctx.fillStyle = 'rgba(16,18,22,.94)';
    ctx.fillRect(x, y, width, 48);
    ctx.strokeStyle = '#ff6900';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, 48);
    ctx.fillStyle = '#ffd054';
    ctx.textAlign = 'center';
    ctx.fillText(text, W / 2, y + 31);
    ctx.restore();
  }
  function drawHUD(now) {
    ctx.save();
    ctx.fillStyle = 'rgba(12,15,18,.88)'; ctx.fillRect(0, 0, W, 70);
    ctx.strokeStyle = '#ff6900'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 70); ctx.lineTo(W, 70); ctx.stroke();
    ctx.font = 'bold 19px Trebuchet MS'; ctx.fillStyle = '#edc17e'; ctx.fillText(game.playerName.toUpperCase(), 20, 27);
    ctx.font = 'bold 23px Trebuchet MS'; ctx.fillStyle = '#fff3e1'; ctx.fillText(`SCORE  ${formatScore(game.score)}`, 20, 55);
    ctx.fillText(`WAREHOUSE  ${game.level}`, 252, 43);
    for (let i = 0; i < MAX_HEARTS; i++) {
      const remainingHeart = i < game.health;
      const opacity = remainingHeart ? 1 : .09;
      drawContain(images.heart, 490 + i * 42, 18, 34, 34, opacity, false);
      if (!remainingHeart) {
        ctx.save();
        ctx.globalAlpha = .42;
        ctx.strokeStyle = '#8d4650';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(496 + i * 42, 47);
        ctx.lineTo(518 + i * 42, 22);
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    ctx.font = 'bold 14px Trebuchet MS'; ctx.fillStyle = '#f0c7a0'; ctx.fillText(`${game.health}/${MAX_HEARTS}`, 610, 43);
    drawContain(images.coffee, 660, 14, 26, 43); ctx.font = 'bold 23px Trebuchet MS'; ctx.fillStyle = '#fff3e1'; ctx.fillText(`${game.coffees}/3`, 696, 44);
    let truckText = 'LEAVE DOCK VIEW FOR CARRIER TIMER';
    if (game.truck) truckText = 'CARRIER WAITING AT DOCK';
    else if (game.truckTimer) truckText = `NEXT CARRIER  ${Math.max(0, Math.ceil((game.truckTimer.due - now) / 1000))}s`;
    ctx.textAlign = 'right'; ctx.fillStyle = game.truck ? '#ff7700' : '#e1c69e'; ctx.font = 'bold 17px Trebuchet MS'; ctx.fillText(truckText, W - 76, 43);
    ctx.textAlign = 'left';
    game.messages.forEach((message, index) => {
      const alpha = clamp((message.until - now) / 420, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 20px Trebuchet MS';
      const mw = ctx.measureText(message.text).width + 38, mx = (W - mw) / 2, my = 94 + index * 39;
      ctx.fillStyle = 'rgba(16,19,23,.9)'; ctx.fillRect(mx, my, mw, 32);
      ctx.strokeStyle = message.color; ctx.strokeRect(mx, my, mw, 32);
      ctx.fillStyle = message.color; ctx.fillText(message.text, mx + 19, my + 23);
    });
    if (game.routeUntil > now) {
      ctx.globalAlpha = 1; ctx.fillStyle = '#ff6900'; ctx.font = 'bold 15px Trebuchet MS';
      ctx.fillText(`ROUTE VISIBLE  ${Math.ceil((game.routeUntil - now) / 1000)}s`, 20, H - 18);
    }
    ctx.restore();
    drawCarrierToast(now);
  }
  function drawTitle() {
    drawCoverImage(images.background, 0, 0, W, H);
    ctx.fillStyle = 'rgba(11,12,14,.46)'; ctx.fillRect(0, 0, W, H);
    drawContain(images.title, 240, 70, 800, 224, 1, true);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 29px Trebuchet MS'; ctx.fillText('WAREHOUSE RUN', W / 2, 328);
    ctx.fillStyle = '#f6e8ce'; ctx.font = '18px Trebuchet MS';
    ctx.fillText('WASD / ARROWS  MOVE     SPACE  ACTION / COFFEE SPRINT     M  MUTE', W / 2, 572);
    ctx.fillText('Reach the exit. Collect points. Survive the warehouse.', W / 2, 610);
    ctx.font = 'bold 19px Trebuchet MS'; ctx.fillStyle = '#ffd054'; ctx.fillText(`BEST SCORE  ${formatScore(game.bestScore)}`, W / 2, 650);
    ctx.restore();
  }
  function drawTransition(now) {
    drawWorld(now, false);
    ctx.fillStyle = 'rgba(10,13,17,.8)'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6900'; ctx.font = 'bold 54px Trebuchet MS'; ctx.fillText('SHIFT COMPLETE', W / 2, 264);
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 30px Trebuchet MS'; ctx.fillText(`SCORE  ${formatScore(game.score)}`, W / 2, 325);
    ctx.font = 'bold 28px Trebuchet MS'; ctx.fillText(`GENERATING WAREHOUSE ${game.level}...`, W / 2, 388);
    ctx.fillStyle = '#edc17e'; ctx.font = '21px Trebuchet MS'; ctx.fillText('Robots are getting more aggressive.', W / 2, 433);
    ctx.restore();
  }
  function drawGameOver() {
    drawCoverImage(images.background, 0, 0, W, H, .3);
    ctx.fillStyle = 'rgba(11,12,15,.79)'; ctx.fillRect(0, 0, W, H);
    drawContain(images.gameover, 390, 30, 500, 202, 1, true);
    ctx.save(); ctx.textAlign = 'center';
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 24px Trebuchet MS'; ctx.fillText(game.playerName.toUpperCase(), W / 2, 259);
    ctx.font = 'bold 37px Trebuchet MS'; ctx.fillStyle = '#ff6900'; ctx.fillText(`TOTAL POINTS  ${formatScore(game.score)}`, W / 2, 304);
    ctx.font = 'bold 17px Trebuchet MS'; ctx.fillStyle = '#ffd054';
    ctx.fillText(`WAREHOUSES CLEARED  ${game.stats.warehousesCleared}     BEST SCORE  ${formatScore(game.bestScore)}`, W / 2, 337);

    const summary = [
      ['DELIVERIES', game.stats.trucksCompleted], ['OFFLINE STOCK', game.stats.offlineStock], ['COFFEES', game.stats.coffeesCollected],
      ['LUNCH BREAKS', game.stats.lunchBreaks], ['RETURNS', game.stats.returnsProcessed], ['INVENTORY PAIRS', game.stats.inventoryMatches],
      ['CUSTOMER ORDERS', game.stats.customerOrders], ['ZALANDO SHARES', game.stats.sharesFound], ['BOXES OPENED', game.stats.boxesOpened]
    ];
    ctx.fillStyle = 'rgba(15,18,21,.76)'; ctx.fillRect(128, 360, 1024, 150);
    ctx.strokeStyle = 'rgba(255,105,0,.74)'; ctx.lineWidth = 2; ctx.strokeRect(128, 360, 1024, 150);
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 19px Trebuchet MS'; ctx.fillText('SHIFT SUMMARY', W / 2, 389);
    ctx.textAlign = 'left';
    summary.forEach(([label, value], i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 166 + col * 327, y = 422 + row * 28;
      ctx.fillStyle = '#edc17e'; ctx.font = 'bold 14px Trebuchet MS'; ctx.fillText(label, x, y);
      ctx.fillStyle = '#fff4df'; ctx.font = 'bold 18px Trebuchet MS'; ctx.fillText(String(value), x + 207, y);
    });
    ctx.textAlign = 'center'; ctx.fillStyle = '#f6e8ce'; ctx.font = '17px Trebuchet MS';
    ctx.fillText('Continue from the Dock, or begin a new shift.', W / 2, 546);
    ctx.restore();
  }

  function drawWorld(now, hud = true) {
    if (!game.player) return;
    ctx.save();
    const sx = shakeAmount > .2 ? rand(-shakeAmount, shakeAmount) : 0;
    const sy = shakeAmount > .2 ? rand(-shakeAmount, shakeAmount) : 0;
    ctx.translate(-game.camera.x + sx, -game.camera.y + sy);
    drawStaticWorldView();
    drawLiveTruck(now);
    drawRoute(now);
    drawPickups(now);
    drawEnemies(now);
    drawPlayer(now);
    drawForegroundSceneryOverPlayer();
    drawParticles();
    ctx.restore();
    if (hud) drawHUD(now);
  }
  function drawClothingItem(type, x, y, w, h, alpha = 1) {
    const cols = 4, rows = 3;
    const sw = images.clothes.width / cols, sh = images.clothes.height / rows;
    const col = type % cols, row = Math.floor(type / cols);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(images.clothes, col * sw, row * sh, sw, sh, x, y, w, h);
    ctx.restore();
  }
  function drawInventoryBriefing() {
    drawCoverImage(images.inventorybg, 0, 0, W, H);
    ctx.fillStyle = 'rgba(10,12,15,.62)'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6900'; ctx.font = 'bold 52px Trebuchet MS'; ctx.fillText('INVENTORY CHECK!', W / 2, 182);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 5; ctx.font = 'bold 25px Trebuchet MS';
    const lines = ['Sort through the items to match similar items together', 'by swapping an article with the empty square.', 'Pairs will get packed in the box.'];
    lines.forEach((line, i) => { ctx.strokeText(line, W / 2, 280 + i * 43); ctx.fillText(line, W / 2, 280 + i * 43); });
    const seconds = Math.max(1, Math.ceil((game.inventoryBriefUntil - performance.now()) / 1000));
    ctx.fillStyle = '#ffd054'; ctx.font = 'bold 28px Trebuchet MS'; ctx.fillText(`STARTING IN ${seconds}...`, W / 2, 449);
    ctx.restore();
  }
  function drawInventoryPuzzle(now) {
    drawCoverImage(images.inventorybg, 0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,.26)'; ctx.fillRect(0, 0, W, H);
    const pz = game.inventoryPuzzle;
    if (!pz) return;
    const m = puzzleGridMetrics();
    ctx.save();
    ctx.fillStyle = 'rgba(16,18,22,.88)'; ctx.fillRect(35, 24, W - 70, 74);
    ctx.strokeStyle = '#ff6900'; ctx.lineWidth = 3; ctx.strokeRect(35, 24, W - 70, 74);
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 30px Trebuchet MS'; ctx.fillText('INVENTORY CHECK', 62, 70);
    ctx.fillStyle = '#ffd054'; ctx.textAlign = 'right'; ctx.fillText(`TIME  ${Math.max(0, Math.ceil((pz.until - now) / 1000))}s`, W - 58, 70);
    ctx.textAlign = 'left'; ctx.fillStyle = '#fff4df'; ctx.font = 'bold 22px Trebuchet MS'; ctx.fillText(`BONUS  +${pz.scoreEarned}`, 63, 112);
    for (let i = 0; i < PUZZLE_SIZE; i++) {
      const col = i % m.cols, row = Math.floor(i / m.cols);
      const x = m.x + col * (m.cell + m.gap), y = m.y + row * (m.cell + m.gap);
      ctx.fillStyle = pz.cells[i] === null ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.08)';
      ctx.fillRect(x, y, m.cell, m.cell);
      ctx.lineWidth = pz.cells[i] === null && pz.selectedEmpty ? 5 : 3;
      ctx.strokeStyle = pz.cells[i] === null ? '#27a9ff' : 'rgba(255,255,255,.28)';
      ctx.strokeRect(x, y, m.cell, m.cell);
      if (pz.cells[i] !== null) drawClothingItem(pz.cells[i], x + 5, y + 4, m.cell - 10, m.cell - 8);
    }
    const bx = 1023, by = 540;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 18px Trebuchet MS'; ctx.fillText('PACKED PAIRS', bx - 6, by - 16);
    pz.packed.slice(-12).forEach((type, i) => drawClothingItem(type, bx + (i % 4) * 43, by + Math.floor(i / 4) * 39, 34, 34));
    if (now < pz.flashUntil) {
      ctx.fillStyle = '#ff6900'; ctx.font = 'bold 34px Trebuchet MS'; ctx.fillText(pz.flashText, 720, 350);
    }
    ctx.restore();
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    if (game.mode === 'title' || game.mode === 'intro') drawTitle();
    else if (game.mode === 'play' || game.mode === 'dying') drawWorld(now);
    else if (game.mode === 'inventoryBriefing') drawInventoryBriefing();
    else if (game.mode === 'inventoryPuzzle') drawInventoryPuzzle(now);
    else if (game.mode === 'transition') drawTransition(now);
    else if (game.mode === 'gameover') drawGameOver();
  }

  function downloadScoreCard() {
    const report = document.createElement('canvas');
    report.width = 1200; report.height = 675;
    const rc = report.getContext('2d');
    const cover = images.background;
    const scale = Math.max(report.width / cover.width, report.height / cover.height);
    const sw = report.width / scale, sh = report.height / scale;
    rc.drawImage(cover, (cover.width - sw) / 2, (cover.height - sh) / 2, sw, sh, 0, 0, report.width, report.height);
    rc.fillStyle = 'rgba(12,15,18,.78)'; rc.fillRect(0, 0, report.width, report.height);
    const titleScale = Math.min(640 / images.title.width, 160 / images.title.height);
    const tw = images.title.width * titleScale, th = images.title.height * titleScale;
    rc.drawImage(images.title, (report.width - tw) / 2, 35, tw, th);
    rc.textAlign = 'center'; rc.fillStyle = '#fff4df'; rc.font = 'bold 35px Trebuchet MS';
    rc.fillText(`${game.playerName.toUpperCase()}'S SHIFT REPORT`, report.width / 2, 238);
    rc.fillStyle = '#ff6900'; rc.font = 'bold 68px Trebuchet MS'; rc.fillText(formatScore(game.score), report.width / 2, 328);
    rc.fillStyle = '#ffd054'; rc.font = 'bold 23px Trebuchet MS'; rc.fillText(`WAREHOUSES CLEARED  ${game.stats.warehousesCleared}`, report.width / 2, 366);
    const lines = [
      [`Deliveries`, game.stats.trucksCompleted], [`Offline stock`, game.stats.offlineStock],
      [`Coffees`, game.stats.coffeesCollected], [`Lunch breaks`, game.stats.lunchBreaks],
      [`Returns`, game.stats.returnsProcessed], [`Inventory pairs`, game.stats.inventoryMatches],
      [`Customer orders`, game.stats.customerOrders], [`Zalando shares`, game.stats.sharesFound],
      [`Boxes opened`, game.stats.boxesOpened], [`Highest score`, formatScore(game.bestScore)]
    ];
    rc.font = 'bold 18px Trebuchet MS'; rc.textAlign = 'left';
    lines.forEach(([label, value], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 195 + col * 435, y = 405 + row * 43;
      rc.fillStyle = '#edc17e'; rc.fillText(label.toUpperCase(), x, y);
      rc.fillStyle = '#fff4df'; rc.textAlign = 'right'; rc.fillText(String(value), x + 325, y); rc.textAlign = 'left';
    });
    rc.fillStyle = '#ff6900'; rc.fillRect(0, 646, report.width, 29);
    rc.fillStyle = '#fff'; rc.textAlign = 'center'; rc.font = 'bold 15px Trebuchet MS'; rc.fillText('ZALANDO SCOUT — WAREHOUSE RUN', report.width / 2, 667);
    const safeName = (game.playerName || 'scout').replace(/[^a-z0-9_-]+/gi, '_');
    const link = document.createElement('a');
    link.download = `zalando-scout-score-${safeName}.jpg`;
    link.href = report.toDataURL('image/jpeg', .93);
    link.click();
  }

  function loop(time) {
    const dt = Math.min(.035, (time - (game.lastTime || time)) / 1000);
    game.lastTime = time;
    update(dt, time);
    draw(time);
    requestAnimationFrame(loop);
  }

  newShiftButton.addEventListener('click', startNewShift);
  continueSavedButton.addEventListener('click', continueSavedShift);
  continueShiftButton.addEventListener('click', continueAfterDeath);
  restartShiftButton.addEventListener('click', () => {
    gameoverUI.classList.add('hidden');
    startNewShift();
  });
  downloadScoreButton.addEventListener('click', downloadScoreCard);
  muteToggleButton.addEventListener('click', () => { synth.init(); if (game.mode === 'title') startTitleMusic(); volumePanel.classList.toggle('hidden'); });
  displayToggleButton.addEventListener('click', () => { toggleDisplayMode(); });
  volumeSlider.addEventListener('input', event => { synth.init(); setVolume(event.target.value); if (game.mode === 'title') startTitleMusic(); });
  unstuckButton.addEventListener('click', () => { synth.init(); emergencyMove(); });
  directionControls.forEach(button => {
    const code = button.dataset.key;
    const press = event => {
      event.preventDefault();
      if (game.mode !== 'play') return;
      synth.init();
      keys.add(code);
      button.classList.add('active');
    };
    const release = event => {
      event.preventDefault();
      keys.delete(code);
      button.classList.remove('active');
    };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
  });
  actionControl.addEventListener('pointerdown', event => {
    event.preventDefault();
    if (game.mode !== 'play') return;
    synth.init();
    if (!keys.has('Space')) handleActionPress(performance.now());
    keys.add('Space');
    actionControl.classList.add('active');
  });
  const releaseActionControl = event => {
    event.preventDefault();
    keys.delete('Space');
    stopSprint();
    actionControl.classList.remove('active');
  };
  actionControl.addEventListener('pointerup', releaseActionControl);
  actionControl.addEventListener('pointercancel', releaseActionControl);
  actionControl.addEventListener('pointerleave', releaseActionControl);

  titleUI.addEventListener('pointerdown', () => { synth.init(); startTitleMusic(); });
  nameInput.addEventListener('focus', () => { synth.init(); startTitleMusic(); });
  canvas.addEventListener('click', event => {
    if (game.mode !== 'inventoryPuzzle') return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    handleInventoryClick(x, y);
  });
  introNextButton.addEventListener('click', nextIntroSlide);
  introSkipButton.addEventListener('click', skipIntro);
  nameInput.addEventListener('input', () => nameWarning.classList.add('hidden'));
  nameInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') startNewShift();
  });

  document.addEventListener('click', event => { if (!volumePanel.contains(event.target) && !muteToggleButton.contains(event.target)) volumePanel.classList.add('hidden'); });

  document.addEventListener('keydown', event => {
    const prevent = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code);
    if (prevent && game.mode === 'play') event.preventDefault();
    if (document.activeElement === nameInput) return;
    synth.init();
    const directionButton = controlButtonForCode(event.code);
    if (directionButton) directionButton.classList.add('active');
    if (event.code === 'KeyM') {
      toggleAudio();
      return;
    }
    if (event.code === 'Escape' && game.mode === 'intro') {
      skipIntro();
      return;
    }
    if (event.code === 'Escape') {
      game.mode = 'title';
      pendingShiftStart = null;
      stopIntroTyping();
      introUI.classList.add('hidden');
      introImage.classList.remove('is-visible');
      keys.clear();
      music.stop();
      setGameplayControlsVisible(false);
      titleUI.classList.remove('hidden');
      gameoverUI.classList.add('hidden');
      refreshSavedButton();
      startTitleMusic();
      return;
    }
    if (event.code === 'Space' && game.mode === 'play' && !keys.has('Space')) {
      const now = performance.now();
      handleActionPress(now);
      actionControl.classList.add('active');
    }
    keys.add(event.code);
  });
  document.addEventListener('keyup', event => {
    keys.delete(event.code);
    if (event.code === 'Space') { stopSprint(); actionControl.classList.remove('active'); }
    const button = controlButtonForCode(event.code);
    if (button) button.classList.remove('active');
  });
  window.addEventListener('blur', () => {
    keys.clear();
    stopSprint();
    directionControls.forEach(button => button.classList.remove('active'));
    actionControl.classList.remove('active');
  });

  loadAssets().catch(error => {
    loading.textContent = `Asset loading failed: ${error.message}`;
    console.error(error);
  });
})();
