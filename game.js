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
  const profilesPanel = document.getElementById('profiles-panel');
  const profileSlots = document.getElementById('profile-slots');
  const profileWarning = document.getElementById('profile-warning');
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
  const introCaptionTop = document.getElementById('intro-caption-top');
  const cockpitHelpUI = document.getElementById('cockpit-help');
  const closeCockpitHelpButton = document.getElementById('close-cockpit-help');
  const introNextButton = document.getElementById('intro-next');
  const introSkipButton = document.getElementById('intro-skip');
  const fireAnimationOverlay = document.getElementById('fire-animation-overlay');
  const adminPanel = document.getElementById('admin-panel');
  const adminExitButton = document.getElementById('admin-exit');
  const adminButtons = Array.from(document.querySelectorAll('[data-admin]'));

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
  const VERSION = 'V2.34';
  const ACTIVE_BOXES = 40;
  const ACTIVE_COFFEES = 18;
  const ASSET_PATH = 'assets/';
  const SAVE_KEY = 'zalandoScoutSavedShiftV2';
  const NAME_KEY = 'zalandoScoutPlayerName';
  const PROFILES_KEY = 'zalandoScoutProfilesV1';
  const ACTIVE_PROFILE_KEY = 'zalandoScoutActiveProfileV1';
  const MAX_PROFILES = 3;
  const BEST_KEY = 'zalandoScoutBest';
  const MUTE_KEY = 'zalandoScoutAudioMuted';
  const VOLUME_KEY = 'zalandoScoutAudioVolume';
  const DISPLAY_MODE_KEY = 'zalandoScoutDisplayMode';
  const INVENTORY_DURATION = 60000;
  const QS_DURATION = 60000;
  const PALLET_JACK_DURATION = 30000;
  const PUZZLE_COLS = 6;
  const PUZZLE_ROWS = 5;
  const PUZZLE_SIZE = PUZZLE_COLS * PUZZLE_ROWS;
  const FLOOR_TINTS = ['rgba(255,118,36,.055)', 'rgba(41,117,154,.045)', 'rgba(120,94,48,.05)', 'rgba(74,124,89,.045)', 'rgba(128,70,110,.04)'];
  const TASK_TYPES = ['alm', 'sl', 'email', 'workday'];
  const TASK_LABELS = { alm: 'ALM', sl: 'SL', email: 'EMAIL', workday: 'WORKDAY' };
  const QS_SPAWN_PHASES = [2000, 1500, 1200, 1000, 800, 500];
  const OFFICE_MENU_MONITOR = { x: 99, y: 48, width: 581, height: 372 };
  const OFFICE_APP_MONITOR = { x: 130, y: 92, width: 498, height: 302 };
  const HINT_COST = 100;
  const keys = new Set();

  const TASK_PUZZLES = {
    alm: { app: 'JIRA — ALM TICKET', bank: ['🧵','✂️','🔄','📈','📋','🛠️','🛑','🏷️'], puzzles: [
      { clue: 'Log the new ALM fabric issue, check off the item on your task list, and sync the system with a sprint.', answer: ['🧵','📋','🔄'] },
      { clue: 'The production line is blocked, so grab your tools and inspect the fabric defect.', answer: ['🛑','🛠️','✂️'] },
      { clue: 'Print out the incorrect barcode label, update the team task list, and track progress on the growth chart.', answer: ['🏷️','📋','📈'] },
      { clue: 'Run a system sprint, use the tools to debug, and report the ALM fabric issue to engineering.', answer: ['🔄','🛠️','🧵'] },
      { clue: 'Isolate the material with the fabric defect, mark the ticket as blocked, and update the growth chart.', answer: ['✂️','🛑','📈'] }
    ] },
    sl: { app: 'JIRA — SL TICKET', bank: ['📦','🚫','☣️','🚛','🏭','🛡️','⛽','🗺️'], puzzles: [
      { clue: 'Review the incoming shipping notice package, flag the pallet with no EAN, and move it to quarantine storage.', answer: ['📦','🚫','☣️'] },
      { clue: 'Confirm the arriving delivery truck, check it into the warehouse, and review the route map.', answer: ['🚛','🏭','🗺️'] },
      { clue: 'Run a logistics safety check, stop the item with no EAN, and hold it in the warehouse.', answer: ['🛡️','🚫','🏭'] },
      { clue: 'Calculate the transit fuel, update the inbound delivery truck status, and sign off on the shipping notice package.', answer: ['⛽','🚛','📦'] },
      { clue: 'Send the restricted load to quarantine storage, plot the next drop on the route map, and complete the safety check.', answer: ['☣️','🗺️','🛡️'] }
    ] },
    email: { app: 'GMAIL — EMAIL TASK', bank: ['✉️','📎','🖊️','📥','📢','🗣️','🗂️','✍️'], puzzles: [
      { clue: 'Open your unread envelope, check for a file paperclip, and clear out your inbox.', answer: ['✉️','📎','📥'] },
      { clue: 'Take a pen, draft the company announcement, and send it to the speaking head contact.', answer: ['🖊️','📢','🗣️'] },
      { clue: 'Start writing the team update, organize your inbox, and file it in the folders.', answer: ['✍️','📥','🗂️'] },
      { clue: 'Click the paperclip to attach the file, grab your pen, and finish writing the email.', answer: ['📎','🖊️','✍️'] },
      { clue: 'Check the incoming envelope pile, look through your folders, and make a loud announcement.', answer: ['✉️','🗂️','📢'] }
    ] },
    workday: { app: 'WORKDAY — ADMIN TASK', bank: ['📅','⏰','💵','🪪','🏖️','🏢','✍️','🩺'], puzzles: [
      { clue: 'Update your profile ID card, check your calendar schedule, and request your vacation time.', answer: ['🪪','📅','🏖️'] },
      { clue: 'Log your alarm clock hours, submit your expense dollar bill, and register your new office building location.', answer: ['⏰','💵','🏢'] },
      { clue: 'Log your medical sick leave, sign your new employment contract, and review your calendar schedule.', answer: ['🩺','✍️','📅'] },
      { clue: 'Check your monthly payroll cash, update your profile ID card, and input your worked alarm clock hours.', answer: ['💵','🪪','⏰'] },
      { clue: 'Book your summer vacation days, submit a medical note for sick leave, and sign the contract policy.', answer: ['🏖️','🩺','✍️'] }
    ] }
  };

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
    smallbox: ['smallbox.png'], smallbox2: ['smallbox2.png'], smallbox3: ['smallbox3.png'],
    shoe: ['shoe.png'], shoe1: ['shoe1.png'], shoe2: ['shoe2.png'], shoe3: ['shoe3.png'],
    title: ['title.png'], truck: ['truck.png'], walksprite: ['walksprite.png'],
    officeBase: ['baseoffice.jpg'], officeFrame: ['officeframe.webp'], officeMenu: ['pcmenu.jpg'],
    palletjack: ['palletjack.png'], clothesDamaged: ['clothesdamaged.png'], slbox: ['slbox.png'],
    qsBg: ['qs2.jpg', 'qs2.png'], fireExtinguisher: ['fire.png'], fireAnim: ['fire.webp'],
    elevator: ['elevator.png'], conveyor: ['conveyor.png'], conveyorBox: ['box.png'],
    jiraScreen: ['jira.jpg'], errorScreen: ['error.jpg'], scoutIcon: ['scoticon.png']
  };
  const optionalAssets = new Set(['cone', 'qsObj1', 'qsObj2', 'table', 'table2', 'table3', 'zalandologo', 'smallbox', 'smallbox2', 'smallbox3', 'shoe', 'shoe1', 'shoe2', 'shoe3', 'officeBase', 'officeFrame', 'officeMenu', 'jiraScreen', 'errorScreen', 'scoutIcon', 'palletjack', 'clothesDamaged', 'slbox', 'qsBg', 'fireExtinguisher', 'fireAnim', 'elevator', 'conveyor', 'conveyorBox']);
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
    { images: ['warehouse.jpg'], music: 'factory', topText: 'We need to send you to the warehouse to investigate and help with the tasks which are not getting done.', bottomText: 'You need to help complete ALM tickets, SL tickets and the tasks in your Email and Workday.' },
    { images: ['danger.jpg'], music: 'evilrobot', text: 'Beware of the evil automated robots. They do not want you taking their jobs.' },
    { images: ['inventorycheck.jpg'], music: 'inventory', text: 'You will also need to help complete inventory checks.' },
    { images: ['qs2.jpg'], music: 'kitchen', text: 'And help out with Quarantine Storage.' },
    { images: ['exit.jpg'], music: 'winner', text: 'Complete your tasks and make your way to the exit, so we can send you to the next warehouse!' },
    { images: ['background1.jpg'], music: 'gameplay', text: 'Your shift begins now!' }
  ];
  const INTRO_TYPE_INTERVAL = 19;
  let introToken = 0;
  let introTypeTimers = [];
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
    adminMode: false,
    adminEscapeCount: 0,
    adminEscapeUntil: 0,
    lastPuzzleIndex: { alm: -1, sl: -1, email: -1, workday: -1 },
    playerName: localStorage.getItem(NAME_KEY) || '',
    selectedProfileId: localStorage.getItem(ACTIVE_PROFILE_KEY) || '',
    shoeCycleIndex: 0,
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
    conveyors: [],
    movingConveyorItems: [],
    colliders: [],
    zones: {},
    boxes: [],
    looseCoffees: [],
    kitchenCoffees: [],
    palletJacks: [],
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
    tasks: freshTasks(),
    office: null,
    qsPuzzle: null,
    qsCooldownUntil: 0,
    fire: null,
    nextFireAt: 0,
    tokenFlashUntil: 0,
    exitWarnUntil: 0,
    stats: freshStats()
  };

  function freshStats() {
    return { boxesOpened: 0, smallBoxesOpened: 0, shoesCollected: 0, coffeesCollected: 0, returnsProcessed: 0, trucksCompleted: 0, heartsFound: 0, warehousesCleared: 0, inventoryMatches: 0, offlineStock: 0, customerOrders: 0, sharesFound: 0, lunchBreaks: 0, mixedStock: 0, mouldyClothes: 0, opsFinds: 0, inventoryChecks: 0, quarantineSorts: 0, coffeeSprints: 0, palletJackRides: 0, firesExtinguished: 0, firePoints: 0, jumps: 0, robotHits: 0, forkliftHits: 0, almTasksCompleted: 0, slTasksCompleted: 0, emailTasksCompleted: 0, workdayTasksCompleted: 0, sopTokensFound: 0, sopTokensUsed: 0, hintsBought: 0, taskFailures: 0 };
  }
  function freshTasks() { return { alm: 0, sl: 0, email: 0, workday: 0, tokens: 0, completed: { alm: false, sl: false, email: false, workday: false } }; }
  function taskJobsReady(type) { return Math.floor((game.tasks[type] || 0) / 5); }
  function anyTaskReady() { return TASK_TYPES.some(type => taskJobsReady(type) > 0); }
  function requiredTasksComplete() { return TASK_TYPES.every(type => game.tasks.completed[type]); }
  function completionChecklist() { return TASK_TYPES.map(type => `${TASK_LABELS[type]} ${game.tasks.completed[type] ? '✓' : '✗'}`).join('   '); }
  function addTaskProgress(type, amount, source) {
    const before = taskJobsReady(type);
    game.tasks[type] += amount;
    const after = taskJobsReady(type);
    synth.pickup();
    addMessage(`${source} — ${TASK_LABELS[type]} +${amount}  (${game.tasks[type]}/5)`, '#ffd054', 1950);
    if (after > before) addMessage(`${TASK_LABELS[type]} TASK READY — GO TO THE DOCK OFFICE`, '#ff7700', 3000);
    updateBest();
  }
  function completeTaskUnit(type, viaToken, success = true) {
    if (taskJobsReady(type) < 1) return false;
    game.tasks[type] = Math.max(0, game.tasks[type] - 5);
    if (success) {
      game.score += 50;
      game.tasks.completed[type] = true;
      const key = `${type}TasksCompleted`;
      game.stats[key] = (game.stats[key] || 0) + 1;
      if (viaToken) game.stats.sopTokensUsed++;
      synth.points();
      if (requiredTasksComplete()) addMessage('YOU FINISHED YOUR WORK! FIND THE EXIT AND LEAVE THIS WAREHOUSE.', '#71dd8d', 3800);
    } else game.stats.taskFailures++;
    updateBest();
    return true;
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
    spray(duration = .85) {
      if (game.muted || game.volume <= 0 || !game.soundReady || !this.audio) return;
      const t = this.audio.currentTime;
      const bufferSize = Math.max(1, Math.floor(this.audio.sampleRate * duration));
      const buffer = this.audio.createBuffer(1, bufferSize, this.audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      const source = this.audio.createBufferSource();
      const filter = this.audio.createBiquadFilter();
      const gain = this.audio.createGain();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(850, t);
      gain.gain.setValueAtTime(.0001, t);
      gain.gain.linearRampToValueAtTime(.11 * game.volume, t + .04);
      gain.gain.exponentialRampToValueAtTime(.001, t + duration);
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.audio.destination);
      source.start(t);
      source.stop(t + duration);
    }
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
      } else if (game.mode === 'inventoryBriefing' || game.mode === 'inventoryPuzzle' || game.mode === 'qsPuzzle') this.play('inventory', true);
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
    // V2.30: around 25% smaller than the oversized v2.29 maps, while keeping level 5+ as the larger challenge tier.
    const scale = level >= 5 ? 3 : 1.5;
    MAP_W = Math.round(BASE_MAP_W * scale);
    MAP_H = Math.round(BASE_MAP_H * scale);
    WORLD_W = MAP_W * TILE;
    WORLD_H = MAP_H * TILE;
  }
  function activeBoxCount() { return game.level >= 5 ? 260 : 140; }
  function activeCoffeeCount() { return game.level >= 5 ? 95 : 54; }
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
    const zones = [game.zones.quarantine, game.zones.dock, game.zones.inventory, game.zones.exit, game.zones.elevator, ...game.zones.kitchens].filter(Boolean);
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
  function shoeImageKeys() {
    return ['shoe', 'shoe1', 'shoe2', 'shoe3'].filter(key => images[key]);
  }
  function nextShoeImage() {
    const pool = shoeImageKeys();
    if (!pool.length) return null;
    game.shoeCycleIndex = (game.shoeCycleIndex || 0) % pool.length;
    const key = pool[game.shoeCycleIndex];
    game.shoeCycleIndex = (game.shoeCycleIndex + 1) % pool.length;
    return key;
  }
  function isShoeImage(image) { return /^shoe\d*$/.test(image); }
  function addDecorativeProp(image, rect, flipX = false) {
    if (!images[image]) return false;
    const candidate = { ...rect, image, flipX, collisionRect: null, decorative: true, collectible: isShoeImage(image), interactive: /^smallbox/.test(image), bob: rand(0, Math.PI * 2) };
    const centre = decorativeCenter(candidate);
    const tile = worldToTile(centre.x, centre.y);
    if (!isFloorTile(tile.x, tile.y) || tileInAnyZone(tile, 0) || tileInsideVisibleScenery(tile)) return false;
    if (game.decorativeProps.some(prop => dist(centre, decorativeCenter(prop)) < TILE * 1.20)) return false;
    game.decorativeProps.push(candidate);
    return true;
  }
  function spawnShelfFrontProp(image) {
    if (!images[image]) return;
    const shelfProps = game.obstacles.filter(prop => /^box[2-7]$/.test(prop.image));
    if (!shelfProps.length) return;
    const shelf = choice(shelfProps), scale = choice([1, .5, .3]);
    const actualImage = image === 'shoe' ? (nextShoeImage() || 'shoe') : image;
    if (!images[actualImage]) return;
    const width = (isShoeImage(actualImage) ? .98 : 1.0) * scale, height = (isShoeImage(actualImage) ? .62 : .88) * scale;
    const floorTop = shelf.collisionRect ? shelf.collisionRect.top : shelf.top + shelf.height * .72;
    const left = clamp(shelf.left + rand(.08, Math.max(.14, shelf.width - width - .08)), 1.1, MAP_W - width - 1.1);
    const top = clamp(floorTop + rand(.05, .48), 1.1, MAP_H - height - 1.1);
    addDecorativeProp(actualImage, { left, top, width, height }, Math.random() < .5);
  }
  function decorativeCenter(prop) { return { x: (prop.left + prop.width / 2) * TILE, y: (prop.top + prop.height / 2) * TILE }; }
  function scatterDecorativeClutter() {
    game.decorativeProps = [];
    const choices = ['smallbox', 'smallbox2', 'smallbox3'].filter(key => images[key]);
    const shoePool = shoeImageKeys();
    if (!choices.length && !shoePool.length) return;
    const shelfProps = game.obstacles.filter(prop => /^box[2-7]$/.test(prop.image));
    const scaleChoices = [1, .5, .3];
    const maxDecor = Math.min(game.level >= 5 ? 720 : 360, Math.max(90, Math.round(shelfProps.length * .42)));
    let placed = 0;

    // Denser decorative clutter: keep it attached to shelf fronts and gaps, not stranded in open aisles.
    for (const shelf of shuffle(shelfProps)) {
      if (placed >= maxDecor) break;
      if (Math.random() < .07) continue;
      const itemsHere = Math.random() < .32 ? 3 : (Math.random() < .72 ? 2 : 1);
      for (let i = 0; i < itemsHere && placed < maxDecor; i++) {
        let image;
        if (shoePool.length && (!choices.length || Math.random() < .50)) image = nextShoeImage();
        else image = choice(choices);
        if (!image || !images[image]) continue;
        const scale = choice(scaleChoices);
        const baseW = isShoeImage(image) ? .98 : 1.0;
        const baseH = isShoeImage(image) ? .62 : .88;
        const width = baseW * scale;
        const height = baseH * scale;
        const floorTop = shelf.collisionRect ? shelf.collisionRect.top : shelf.top + shelf.height * .72;
        const left = clamp(shelf.left + rand(.08, Math.max(.14, shelf.width - width - .08)), 1.1, MAP_W - width - 1.1);
        const top = clamp(floorTop + rand(.05, .48), 1.1, MAP_H - height - 1.1);
        if (addDecorativeProp(image, { left, top, width, height }, Math.random() < .5)) placed++;
      }
    }
  }
  function scatterConeHazards() {
    if (!images.cone) return;
    const groupsTarget = game.level >= 5 ? 64 : 34;
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
    const elevatorLeft = Math.max(24, Math.floor(MAP_W / 2) - 5);
    const elevatorTop = Math.max(14, Math.floor(MAP_H / 2) - 3);
    game.zones = {
      dock: zone(2, 2, 20, 12, 'DOCK', 8, 9),
      quarantine: zone(2, MAP_H - 13, 12, 9, 'QUARANTINE', 6, 7),
      inventory: zone(MAP_W - 18, MAP_H - 15, 14, 12, 'INVENTORY CHECK', 6, 6),
      exit: zone(MAP_W - 14, 3, 10, 7, 'EXIT', 8, 5),
      elevator: zone(elevatorLeft, elevatorTop, 10, 6, 'ELEVATOR', 5, 5),
      kitchens: [zone(MAP_W - 13, MAP_H - 10, 8, 5, 'KITCHEN', 7, 4), zone(26, 3, 8, 5, 'KITCHEN', 7, 4)]
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
    // Dock office is collidable again, but with a forgiving inset footprint so the scout can still reach the door.
    addCollider({ left: d.left + .28, top: d.top + 1.0, width: 8.1, height: 3.0 }, 'dock-office', .20);
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
    // A warehouse maze made from shelf-wall aisles. Each horizontal band is visible shelving,
    // broken by regular one-square crossings; no shelf wall runs for more than six rack units
    // without a clear passage. The gaps move between rows so crossing the building takes navigation.
    const rackW = 2.42;
    const rackH = 2.30;
    const pieceStep = 2.32;
    const crossingGap = 1.25;
    const rowStep = 4.02;
    const rows = [];
    for (let y = 3.05; y <= MAP_H - 4.2; y += rowStep) rows.push(y);

    rows.forEach((top, rowIndex) => {
      let x = 1.40;
      let groupIndex = 0;
      while (x < MAP_W - rackW - 1.35) {
        const runLength = 3 + ((rowIndex * 5 + groupIndex * 3) % 4); // 3 to 6 units per wall run.
        for (let piece = 0; piece < runLength && x < MAP_W - rackW - 1.35; piece++) {
          let image;
          if ((groupIndex + rowIndex) % 8 === 5 && piece >= Math.max(0, runLength - 3)) image = 'box7';
          else if ((groupIndex + rowIndex) % 9 === 6 && piece >= Math.max(0, runLength - 3)) image = 'box3';
          else image = (rowIndex + Math.floor(piece / 2) + groupIndex) % 2 === 0 ? 'box5' : 'box6';
          occupyObstacle({ left: x, top, width: rackW, height: rackH }, image, { floorBand: .24, sideInset: .08 });
          x += pieceStep;
        }
        // The player gets a visible crossing between every rack run.
        x += crossingGap;
        groupIndex++;
      }
    });

    // Vertical partial shelf dividers interrupt long straight aisles while keeping open turns.
    // Their alternating position makes the route feel like warehouse corridors, not a blank grid.
    for (let sectionX = 10.2, section = 0; sectionX < MAP_W - 7; sectionX += 12.5, section++) {
      for (let row = 0; row < rows.length - 1; row++) {
        if ((row + section) % 3 === 1) continue;
        const corridorTop = rows[row] + rackH + .22;
        const available = rows[row + 1] - corridorTop - .24;
        if (available < 1.12) continue;
        const x = sectionX + (((row + section) % 2) ? 1.75 : -1.10);
        const image = (row + section) % 2 === 0 ? 'box7' : 'box3';
        occupyObstacle({ left: x, top: corridorTop, width: 1.55, height: Math.min(1.38, available) }, image, { floorBand: .26, sideInset: .11 });
      }
    }
  }

  function viewportHasShelfCoverage(left, top, width, height) {
    const view = { left, top, width, height };
    return game.obstacles.filter(o => /^box[2-7]$/.test(o.image) && overlaps(view, o)).length >= 6;
  }

  function addConveyorRun(left, top, count, options = {}) {
    if (!images.conveyor || count <= 0) return false;
    const width = 3.05, height = 1.04, gap = 0.08;
    const totalW = count * width + Math.max(0, count - 1) * gap;
    const rect = { left, top, width: totalW, height };
    if (!withinMap(rect) || (!options.allowZoneOverlap && isZoneBlocked(rect, .25)) || (!options.allowPropOverlap && game.obstacles.some(o => overlaps(rect, o))) || (!options.allowPropOverlap && game.zoneProps.some(o => overlaps(rect, o))) || (!options.allowElevatorOverlap && game.zones.elevator && overlaps(rect, paddedRect(game.zones.elevator, 1)))) return false;
    markBlocked({ left, top: top + .35, width: totalW, height: .52 });
    addCollider({ left, top: top + .35, width: totalW, height: .52 }, 'conveyor', .02);
    const conveyor = { left, top, width: totalW, height, pieces: count, moving: [] };
    const itemCount = clamp(Math.floor(count * 1.35), 2, 7);
    for (let i = 0; i < itemCount; i++) {
      const collectible = shoeImageKeys().length && Math.random() < .18;
      const image = collectible ? (nextShoeImage() || 'shoe') : 'conveyorBox';
      const size = collectible ? rand(.62, .88) : rand(.42, .78);
      const item = {
        conveyor, image, collectible, size,
        minX: (left + .45) * TILE, maxX: (left + totalW - .45) * TILE,
        x: (left + .7 + Math.random() * Math.max(.4, totalW - 1.4)) * TILE,
        y: (top + .42 + Math.random() * .12) * TILE,
        dir: Math.random() < .5 ? -1 : 1, speed: rand(28, 68)
      };
      conveyor.moving.push(item);
      game.movingConveyorItems.push(item);
    }
    game.conveyors.push(conveyor);
    return true;
  }

  function installConveyors() {
    if (!images.conveyor) return;
    const q = game.zones.quarantine;
    const inv = game.zones.inventory;
    const d = game.zones.dock;

    // Enclose QS and Inventory from top/bottom so they read as work zones with side entry.
    addConveyorRun(q.left + 1.05, q.top + .35, 3, { allowZoneOverlap: true, allowPropOverlap: true, allowElevatorOverlap: false });
    addConveyorRun(q.left + 1.05, q.top + q.height - 1.25, 3, { allowZoneOverlap: true, allowPropOverlap: true, allowElevatorOverlap: false });
    addConveyorRun(inv.left + .75, inv.top + .35, 4, { allowZoneOverlap: true, allowPropOverlap: true, allowElevatorOverlap: false });
    addConveyorRun(inv.left + .75, inv.top + inv.height - 1.25, 4, { allowZoneOverlap: true, allowPropOverlap: true, allowElevatorOverlap: false });

    // Dock conveyor divider, plus a few normal lane dividers.
    addConveyorRun(d.left + 2.0, d.top + 8.75, 3, { allowZoneOverlap: true, allowPropOverlap: true });

    const target = game.level >= 5 ? 18 : 10;
    let attempts = 0;
    while (game.conveyors.length < target && attempts++ < target * 40) {
      const count = randInt(2, 5);
      const x = randInt(3, Math.max(4, MAP_W - count * 3 - 4));
      const y = randInt(5, Math.max(6, MAP_H - 6));
      addConveyorRun(x, y, count);
    }
  }

  function elevatorDestinations() {
    const dests = [
      { label: 'DOCK / OFFICE', zone: game.zones.dock },
      { label: 'INVENTORY', zone: game.zones.inventory },
      { label: 'QUARANTINE', zone: game.zones.quarantine },
      { label: 'KITCHEN', zone: game.zones.kitchens[0] }
    ];
    if (requiredTasksComplete()) dests.push({ label: 'EXIT', zone: game.zones.exit });
    return dests;
  }
  function currentElevatorDestinations(now = performance.now()) {
    const dests = elevatorDestinations();
    if (!dests.length) return [];
    const rotation = Math.floor(now / 30000);
    return [0, 1, 2].map(i => dests[(rotation + i) % dests.length]);
  }
  function elevatorChangeFlashing(now = performance.now()) { return now % 30000 >= 25000; }
  function elevatorDoorIndexFromPlayer() {
    if (!game.player || !game.zones.elevator) return -1;
    const e = game.zones.elevator;
    const px = game.player.x / TILE;
    const py = game.player.y / TILE;
    if (px < e.left - .5 || px > e.left + e.width + .5 || py < e.top - .4 || py > e.top + e.height + 1.2) return -1;
    const rel = clamp((px - e.left) / e.width, 0, .999);
    return clamp(Math.floor(rel * 3), 0, 2);
  }
  function tryUseElevator(now) {
    const index = elevatorDoorIndexFromPlayer();
    if (index < 0) return false;
    const dest = currentElevatorDestinations(now)[index];
    if (!dest || !dest.zone) return false;
    teleportTo(dest.zone, `ELEVATOR → ${dest.label}`, null);
    synth.teleport();
    return true;
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
        const y = top + Math.floor(patchH / 2) - .7;
        const centreGap = left + Math.floor(patchW / 2);
        for (let x = left; x < left + patchW - 2; x += 2.42) {
          if (x < centreGap + .85 && x + 2.42 > centreGap - .25) continue;
          occupyObstacle({ left: x, top: y, width: 2.42, height: 2.30 }, ((Math.floor(x) + Math.floor(y)) % 2 === 0 ? 'box5' : 'box6'), { floorBand: .24, sideInset: .08 });
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
    game.conveyors = [];
    game.movingConveyorItems = [];
    game.colliders = [];
    setZones();

    // Expanded warehouses must contain expanded storage, not empty concrete.
    installDenseShelfWalls();
    installExitApproachMaze();
    installSpecialAreaProps();
    sealUnexpectedOpenPatches();
    scatterConeHazards();
    installConveyors();
    installWarehouseBorder();
    scatterDecorativeClutter();
    game.floorLogos = generateFloorLogos();
  }

  function isFloorTile(x, y) { return x >= 0 && x < MAP_W && y >= 0 && y < MAP_H && game.map[y][x] === 0; }
  function allZones() { return [game.zones.quarantine, game.zones.dock, game.zones.inventory, game.zones.exit, game.zones.elevator, ...game.zones.kitchens].filter(Boolean); }
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
    const decor = game.decorativeProps
      .filter(prop => prop.collectible || prop.interactive)
      .map(prop => decorativeCenter(prop));
    const movingShoes = (game.movingConveyorItems || [])
      .filter(item => item.collectible)
      .map(item => ({ x: item.x, y: item.y }));
    const objects = [
      ...game.boxes, ...game.looseCoffees, ...game.kitchenCoffees.filter(coffee => coffee.available),
      ...game.palletJacks.filter(jack => jack.active !== false), ...decor, ...movingShoes,
      ...(includeEnemies ? game.enemies : [])
    ];
    if (includeEnemies && game.forklifts.length) objects.push(...game.forklifts);
    return objects.some(o => dist(p, o) < TILE * 1.35);
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
  function placeKitchenCoffees() {
    // Fixed coffee point beside the right-hand side of each kitchen refrigerator.
    // It reappears once the player leaves the pickup spot, so it cannot be collected continuously while standing still.
    game.kitchenCoffees = game.zones.kitchens.map(k => ({
      x: (k.left + 6.56) * TILE,
      y: (k.top + 2.55) * TILE,
      bob: rand(0, Math.PI * 2),
      available: true
    }));
  }
  function createPalletJackAtTile(t, nearDock = false) {
    const p = tileCenter(t);
    return { x: p.x, y: p.y, bob: rand(0, Math.PI * 2), nearDock, active: true };
  }
  function placePalletJacks() {
    game.palletJacks = [];
    const used = new Set();
    const addJack = (t, nearDock = false) => {
      if (!t) return;
      const key = cellKey(t.x, t.y);
      if (used.has(key)) return;
      used.add(key);
      game.palletJacks.push(createPalletJackAtTile(t, nearDock));
    };
    addJack(tileNearZoneEdge(game.zones.dock), true);
    let attempts = 0;
    while (game.palletJacks.length < 5 && attempts < 120) {
      attempts++;
      addJack(randomFloorTile(340, true), false);
    }
  }
  function playerRidingPalletJack(now = performance.now()) {
    return !!(game.player && game.player.palletJackUntil && now < game.player.palletJackUntil);
  }
  function nearestAvailablePalletJack(maxDistance = TILE * 0.95) {
    let nearest = null;
    let best = maxDistance;
    game.palletJacks.forEach(jack => {
      if (jack.active === false) return;
      const d = dist(game.player, jack);
      if (d < best) { best = d; nearest = jack; }
    });
    return nearest;
  }
  function activateNearbyPalletJack(now) {
    if (game.mode !== 'play' || !game.player || playerRidingPalletJack(now)) return false;
    const jack = nearestAvailablePalletJack();
    if (!jack) return false;
    jack.active = false;
    game.player.palletJackUntil = now + PALLET_JACK_DURATION;
    game.player.invulnerableUntil = Math.max(game.player.invulnerableUntil || 0, now + PALLET_JACK_DURATION);
    game.stats.palletJackRides++;
    synth.route();
    addMessage('PALLET JACK — 30s SPEED + SHIELD', '#ffd054', 2200);
    saveShift();
    return true;
  }
  function disableEnemyFromPalletJack(attacker, now, forklift = false) {
    if (!attacker) return;
    attacker.disabledUntil = now + 30000;
    attacker.path = [];
    const exile = tileCenter(randomFloorTile(0, true));
    attacker.x = exile.x;
    attacker.y = exile.y;
    burst(attacker.x, attacker.y, forklift ? '#ffd054' : '#ff7700', forklift ? 15 : 10);
    addMessage(forklift ? 'PALLET JACK HIT — FORKLIFT DISABLED' : 'PALLET JACK HIT — ROBOT DISABLED', '#ffd054', 1700);
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
      game.zones.quarantine, game.zones.quarantine, game.zones.quarantine, game.zones.quarantine,
      game.zones.quarantine, game.zones.quarantine, game.zones.quarantine, game.zones.quarantine,
      game.zones.dock, game.zones.dock, game.zones.dock, game.zones.dock, game.zones.dock, game.zones.dock,
      game.zones.dock, game.zones.dock, game.zones.dock, game.zones.dock, game.zones.dock, game.zones.dock,
      game.zones.dock, game.zones.dock, game.zones.dock, game.zones.dock, game.zones.dock, game.zones.dock
    ].forEach(z => {
      const t = tileNearZoneEdge(z);
      if (t) game.enemies.push(makeRobotAtTile(t, true, index++));
    });
    const roamingCount = (2 + Math.floor((game.level - 1) * 0.72)) * 6;
    for (let i = 0; i < roamingCount; i++) game.enemies.push(makeRobotAtTile(randomFloorTile(700, true), false, index++));

    // Four forklift threats patrol every warehouse.
    game.forklifts = [];
    for (let i = 0; i < 4; i++) {
      const ft = i === 0 ? tileNearZoneEdge(game.zones.dock) : randomFloorTile(900, true);
      const fp = tileCenter(ft);
      game.forklifts.push({
        x: fp.x, y: fp.y, path: [], nextPathAt: 0, speed: 137 + game.level * 11 + i * 8,
        detection: 570 + game.level * 22 + i * 28, facing: 'right', wanderingUntil: 0, disabledUntil: 0,
        scale: rand(0.91, 1.12)
      });
    }
  }

  function buildLevel(level, preserveTasks = false) {
    if (!preserveTasks) game.tasks = freshTasks();
    game.office = null;
    game.exitWarnUntil = 0;
    configureMapSize(level);
    game.floorTint = FLOOR_TINTS[(level - 1) % FLOOR_TINTS.length];
    buildWarehouseLayout();
    const start = destinationPosition(game.zones.dock);
    game.player = {
      x: start.x, y: start.y, r: 23, speed: 315, facing: 'down', frame: 0, anim: 0,
      moving: false, sprinting: false, invulnerableUntil: performance.now() + 2500, action: null, palletJackUntil: 0
    };
    game.boxes = [];
    game.looseCoffees = [];
    game.kitchenCoffees = [];
    game.palletJacks = [];
    game.movingConveyorItems = game.movingConveyorItems || [];
    game.qsPuzzle = null;
    game.qsCooldownUntil = 0;
    game.fire = null;
    game.nextFireAt = performance.now() + randInt(45000, 90000);
    for (let i = 0; i < activeBoxCount(); i++) spawnBox();
    for (let i = 0; i < activeCoffeeCount(); i++) spawnLooseCoffee();
    placeKitchenCoffees();
    placePalletJacks();
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
    game.tasks = freshTasks();
    game.stats = freshStats();
    game.messages = [];
    game.particles = [];
    game.specialMusic = null;
  }
  function profileId() { return `shift-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
  function profileAvatarFor(name) {
    const avatars = ['😀','🤖','📦','🧡','🚚','☕'];
    const total = String(name || '').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return avatars[total % avatars.length];
  }
  function readProfiles() {
    let profiles = [];
    try { profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]'); } catch (_) { profiles = []; }
    if (!Array.isArray(profiles)) profiles = [];
    if (!profiles.length) {
      let legacy = null;
      try { legacy = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (_) { legacy = null; }
      if (legacy && legacy.playerName) {
        const migrated = { id: profileId(), name: legacy.playerName, avatar: profileAvatarFor(legacy.playerName), save: legacy };
        profiles = [migrated];
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
        localStorage.setItem(ACTIVE_PROFILE_KEY, migrated.id);
        game.selectedProfileId = migrated.id;
      }
    }
    return profiles.slice(0, MAX_PROFILES);
  }
  function writeProfiles(profiles) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles.slice(0, MAX_PROFILES)));
  }
  function selectedProfile() {
    const profiles = readProfiles();
    return profiles.find(profile => profile.id === game.selectedProfileId) || null;
  }
  function showProfileWarning(message = '') {
    if (!message) { profileWarning.classList.add('hidden'); profileWarning.textContent = ''; return; }
    profileWarning.textContent = message;
    profileWarning.classList.remove('hidden');
  }
  function selectProfile(id, autoContinue = false) {
    const profile = readProfiles().find(item => item.id === id);
    if (!profile) return;
    game.selectedProfileId = profile.id;
    game.playerName = profile.name;
    localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
    localStorage.setItem(NAME_KEY, profile.name);
    nameInput.value = profile.name;
    showProfileWarning();
    refreshSavedButton();
    if (autoContinue && profile.save) {
      synth.init();
      performContinueSavedShift();
    }
  }
  function deleteProfile(id) {
    const profiles = readProfiles();
    const profile = profiles.find(item => item.id === id);
    if (!profile || !window.confirm(`Delete the saved shift for ${profile.name}?`)) return;
    const updated = profiles.filter(item => item.id !== id);
    writeProfiles(updated);
    if (game.selectedProfileId === id) {
      game.selectedProfileId = updated[0] ? updated[0].id : '';
      localStorage.setItem(ACTIVE_PROFILE_KEY, game.selectedProfileId);
      game.playerName = updated[0] ? updated[0].name : '';
      nameInput.value = game.playerName;
    }
    showProfileWarning();
    refreshSavedButton();
  }
  function renderProfiles() {
    const profiles = readProfiles();
    profileSlots.innerHTML = '';
    for (let i = 0; i < MAX_PROFILES; i++) {
      const profile = profiles[i];
      if (!profile) {
        const empty = document.createElement('div');
        empty.className = 'profile-empty';
        empty.textContent = String(i + 1);
        profileSlots.appendChild(empty);
        continue;
      }
      const card = document.createElement('div');
      card.className = `profile-slot${profile.id === game.selectedProfileId ? ' is-selected' : ''}`;
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'profile-select'; button.setAttribute('aria-label', `Continue saved shift for ${profile.name}`);
      const avatar = document.createElement('span'); avatar.className = 'profile-avatar'; avatar.textContent = profile.avatar || profileAvatarFor(profile.name);
      const copy = document.createElement('span'); copy.className = 'profile-copy';
      const name = document.createElement('strong'); name.className = 'profile-name'; name.textContent = profile.name;
      const progress = document.createElement('small'); progress.className = 'profile-progress';
      progress.textContent = profile.save ? `Warehouse ${profile.save.level || 1}  ·  ${formatScore(profile.save.score || 0)} pts` : 'New shift';
      copy.append(name, progress); button.append(avatar, copy); button.addEventListener('click', () => selectProfile(profile.id, true));
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'profile-delete'; remove.textContent = '✕'; remove.title = `Delete ${profile.name}`; remove.addEventListener('click', event => { event.stopPropagation(); deleteProfile(profile.id); });
      card.append(button, remove); profileSlots.appendChild(card);
    }
  }
  function requireName() {
    const value = nameInput.value.trim();
    if (!value) { nameWarning.classList.remove('hidden'); nameInput.focus(); return null; }
    nameWarning.classList.add('hidden');
    game.playerName = value;
    localStorage.setItem(NAME_KEY, value);
    return value;
  }
  function prepareProfileForNewShift(name) {
    const profiles = readProfiles();
    let profile = profiles.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (!profile && profiles.length >= MAX_PROFILES) {
      showProfileWarning('You already have 3 saved games. Delete one of your old games before creating a new one.');
      return false;
    }
    if (!profile) {
      profile = { id: profileId(), name, avatar: profileAvatarFor(name), save: null };
      profiles.push(profile);
      writeProfiles(profiles);
    }
    game.selectedProfileId = profile.id;
    game.playerName = profile.name;
    localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
    localStorage.setItem(NAME_KEY, profile.name);
    renderProfiles();
    return true;
  }
  function performNewShift() {
    game.adminMode = false;
    showAdminPanel(false);
    resetRun();
    game.mode = 'play';
    titleUI.classList.add('hidden');
    gameoverUI.classList.add('hidden');
    setGameplayControlsVisible(true);
    buildLevel(game.level);
    music.playGameplay(true);
    addMessage(`WELCOME, ${game.playerName.toUpperCase()} — FIND THE EXIT`, '#ff7700', 3000);
    saveShift();
  }
  function loadSavedShift() {
    const profile = selectedProfile();
    return profile && profile.save ? profile.save : null;
  }
  function performContinueSavedShift() {
    game.adminMode = false;
    showAdminPanel(false);
    const save = loadSavedShift();
    if (!save) { performNewShift(); return; }
    game.playerName = save.playerName || game.playerName;
    game.level = Number(save.level) || 1;
    game.score = Number(save.score) || 0;
    game.health = clamp(Number(save.health) || MAX_HEARTS, 1, MAX_HEARTS);
    game.coffees = clamp(Number(save.coffees) || 0, 0, 2);
    game.stats = { ...freshStats(), ...(save.stats || {}) };
    game.tasks = { ...freshTasks(), ...(save.tasks || {}), completed: { ...freshTasks().completed, ...((save.tasks && save.tasks.completed) || {}) } };
    game.mode = 'play';
    titleUI.classList.add('hidden');
    gameoverUI.classList.add('hidden');
    setGameplayControlsVisible(true);
    buildLevel(game.level, true);
    music.playGameplay(true);
    addMessage('SAVED SHIFT CONTINUED — BACK AT DOCK', '#ff7700', 3000);
  }
  function introIsReady() {
    return introSlides.length > 0 && introSlides.every(slide => String(slide.text || slide.topText || slide.bottomText || '').trim().length > 0);
  }
  function startNewShift() {
    const name = requireName();
    if (!name || !prepareProfileForNewShift(name)) return;
    synth.init();
    pendingShiftStart = 'new';
    if (introIsReady()) startIntro();
    else completePendingShiftStart();
  }
  function continueSavedShift() {
    const name = requireName();
    if (!name) return;
    const profiles = readProfiles();
    const matched = profiles.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (!matched) { showProfileWarning('Select a saved shift above, or choose New Shift to create this scout.'); return; }
    selectProfile(matched.id, false);
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
    introTypeTimers.forEach(timer => window.clearTimeout(timer));
    introTypeTimers = [];
  }
  function typeIntroText(element, text, token, startDelay = 0) {
    element.textContent = '';
    const wrap = element.parentElement;
    const content = String(text || '');
    wrap.classList.toggle('is-empty', !content);
    if (!content) return;
    let index = 0;
    const step = () => {
      if (token !== introToken || game.mode !== 'intro') return;
      element.textContent = content.slice(0, index);
      if (index < content.length) {
        index += 1;
        introTypeTimers.push(window.setTimeout(step, INTRO_TYPE_INTERVAL));
      }
    };
    introTypeTimers.push(window.setTimeout(step, startDelay));
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
    introCaptionTop.textContent = '';
    introImage.classList.remove('is-visible');
    tryIntroImage(slide.images, token);
    music.play(slide.music, true);
    const topText = slide.topText || '';
    const bottomText = slide.bottomText || slide.text || '';
    typeIntroText(introCaptionTop, topText, token, 0);
    typeIntroText(introCaption, bottomText, token, topText ? 420 : 0);
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
    game.player = { x: p.x, y: p.y, r: 23, speed: 315, facing: 'down', frame: 0, anim: 0, moving: false, sprinting: false, invulnerableUntil: performance.now() + 3000, action: null, palletJackUntil: 0 };
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
    if (game.adminMode || !game.playerName || game.mode === 'title') return;
    const save = { playerName: game.playerName, level: game.level, score: game.score, health: game.health, coffees: game.coffees, tasks: game.tasks, stats: game.stats };
    const profiles = readProfiles();
    let profile = profiles.find(item => item.id === game.selectedProfileId);
    if (!profile) {
      profile = profiles.find(item => item.name.toLowerCase() === game.playerName.toLowerCase());
      if (!profile && profiles.length < MAX_PROFILES) { profile = { id: profileId(), name: game.playerName, avatar: profileAvatarFor(game.playerName), save: null }; profiles.push(profile); }
    }
    if (!profile) return;
    profile.name = game.playerName;
    profile.avatar = profile.avatar || profileAvatarFor(profile.name);
    profile.save = save;
    game.selectedProfileId = profile.id;
    localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
    writeProfiles(profiles);
    refreshSavedButton();
  }
  function refreshSavedButton() {
    const profiles = readProfiles();
    if (!game.selectedProfileId && profiles[0]) { game.selectedProfileId = profiles[0].id; localStorage.setItem(ACTIVE_PROFILE_KEY, game.selectedProfileId); }
    const profile = profiles.find(item => item.id === game.selectedProfileId) || null;
    if (profile && (document.activeElement !== nameInput || !nameInput.value.trim())) { game.playerName = profile.name; nameInput.value = profile.name; }
    renderProfiles();
    continueSavedButton.classList.add('hidden');
  }
  function updateBest() {
    if (game.adminMode) return;
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
  function tileInsideZone(t, z) {
    return t.x >= z.left && t.x < z.left + z.width && t.y >= z.top && t.y < z.top + z.height;
  }
  function pointInsideZone(p, z) {
    return tileInsideZone(worldToTile(p.x, p.y), z);
  }
  function tileInsideSafeZone(t) {
    return tileInsideZone(t, game.zones.dock) || game.zones.kitchens.some(k => tileInsideZone(t, k));
  }
  function playerInsideSafeZone() {
    return !!game.player && (pointInsideZone(game.player, game.zones.dock) || game.zones.kitchens.some(k => pointInsideZone(game.player, k)));
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
    if (game.mode !== 'play' || !p || p.action || p.sprinting || game.fire || playerRidingPalletJack(performance.now()) || !p.moving || game.coffees <= 0) return false;
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
  function playerNearDockOffice() {
    if (!game.player) return false;
    const z = game.zones.dock;
    const office = tileCenter({ x: z.left + 4, y: z.top + 4 });
    return dist(game.player, office) < TILE * 4.5 || pointInsideZone(game.player, z);
  }
  function enterDockOffice() {
    if (game.mode !== 'play' || !playerNearDockOffice()) return false;
    game.mode = 'office';
    game.office = { page: 'menu', selectedType: null, puzzle: null, hotspots: [] };
    keys.clear(); stopSprint(); setGameplayControlsVisible(false);
    return true;
  }
  function handleActionPress(now) {
    if (game.mode !== 'play' || !game.player || game.player.action) return false;
    if (tryFireAction(now)) return true;
    if (tryUseElevator(now)) return true;
    if (openNearbyBox(now)) return true;
    if (activateNearbyPalletJack(now)) return true;
    if (playerNearDockOffice() && enterDockOffice()) return true;
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
      const responseSpeed = game.fire ? 2 : 1;
      const step = p.speed * (playerRidingPalletJack(now) ? 2 : (p.sprinting ? 1.72 : responseSpeed)) * dt;
      const moveRadius = playerRidingPalletJack(now) ? 18 : p.r;
      if (canMove(p.x + dx * step, p.y, moveRadius)) p.x += dx * step;
      if (canMove(p.x, p.y + dy * step, moveRadius)) p.y += dy * step;
      p.anim += dt * (playerRidingPalletJack(now) || game.fire ? 15 : (p.sprinting ? 17 : 10));
      p.frame = Math.floor(p.anim) % 5;
    } else p.frame = 0;

    for (let i = game.looseCoffees.length - 1; i >= 0; i--) {
      if (dist(p, game.looseCoffees[i]) < 48) {
        collectCoffee();
        game.looseCoffees.splice(i, 1);
        spawnLooseCoffee();
      }
    }
    game.kitchenCoffees.forEach(coffee => {
      const nearCoffee = dist(p, coffee) < 48;
      if (coffee.available && nearCoffee) {
        collectCoffee();
        coffee.available = false;
      } else if (!coffee.available && dist(p, coffee) > TILE * 0.90) {
        coffee.available = true;
      }
    });
    for (let i = game.decorativeProps.length - 1; i >= 0; i--) {
      const prop = game.decorativeProps[i];
      if (isShoeImage(prop.image) && dist(p, decorativeCenter(prop)) < TILE * .48) {
        game.decorativeProps.splice(i, 1);
        game.stats.shoesCollected++;
        addTaskProgress(Math.random() < .5 ? 'alm' : 'sl', 1, 'SHOE FOUND');
        spawnShelfFrontProp('shoe');
      }
    }
    for (let i = game.movingConveyorItems.length - 1; i >= 0; i--) {
      const item = game.movingConveyorItems[i];
      if (item.collectible && dist(p, item) < TILE * .52) {
        game.movingConveyorItems.splice(i, 1);
        if (item.conveyor && item.conveyor.moving) item.conveyor.moving = item.conveyor.moving.filter(m => m !== item);
        game.stats.shoesCollected++;
        addTaskProgress(Math.random() < .5 ? 'alm' : 'sl', 1, 'CONVEYOR SHOE');
      }
    }
    // Exit does not require Action, but it is locked until all four task categories have been completed.
    if (pointInsideZone(p, game.zones.exit)) triggerLevelWin();
    if (!game.fire && pointInsideZone(p, game.zones.inventory) && now >= game.inventoryCooldownUntil) startInventoryBriefing();
    if (!game.fire && pointInsideZone(p, game.zones.quarantine) && now >= game.qsCooldownUntil) startQSPuzzle();
    updateSpecialMusic();
    centerCamera();
  }
  function centerCamera() {
    if (!game.player) return;
    game.camera.x = clamp(game.player.x - W / 2, 0, Math.max(0, WORLD_W - W));
    game.camera.y = clamp(game.player.y - H / 2, 0, Math.max(0, WORLD_H - H));
  }

  function bfs(start, goal, avoidSafeZones = false) {
    const q = [start];
    const seen = new Set([cellKey(start.x, start.y)]);
    const prev = new Map();
    while (q.length) {
      const c = q.shift();
      if (c.x === goal.x && c.y === goal.y) break;
      for (const d of directions) {
        const n = { x: c.x + d.x, y: c.y + d.y };
        const key = cellKey(n.x, n.y);
        if (isFloorTile(n.x, n.y) && (!avoidSafeZones || !tileInsideSafeZone(n)) && !seen.has(key)) {
          seen.add(key); prev.set(key, c); q.push(n);
        }
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
    if (tileInsideSafeZone(et)) {
      const safeZone = tileInsideZone(et, game.zones.dock) ? game.zones.dock : game.zones.kitchens.find(k => tileInsideZone(et, k));
      const outside = safeZone ? tileNearZoneEdge(safeZone) : randomFloorTile(0, true);
      const reset = tileCenter(outside);
      enemy.x = reset.x; enemy.y = reset.y; enemy.path = [];
      return;
    }
    enemy.path = (enemy.path || []).filter(tile => !tileInsideSafeZone(tile));
    const chasing = !playerInsideSafeZone() && dist(enemy, game.player) < enemy.detection;
    if (now >= enemy.nextPathAt) {
      if (chasing) {
        enemy.path = bfs(et, pt, true).slice(0, forklift ? 18 : 13);
        enemy.nextPathAt = now + (forklift ? 300 : 430);
      } else if (!enemy.path.length || now > enemy.wanderingUntil) {
        const target = enemy.guard && Math.random() < .7 ? tileNearZoneEdge(Math.random() < .5 ? game.zones.dock : game.zones.quarantine) : randomFloorTile(0, true);
        enemy.path = bfs(et, target, true).slice(0, randInt(3, forklift ? 13 : 9));
        enemy.wanderingUntil = now + randInt(1800, 4500);
        enemy.nextPathAt = now + 1000;
      }
    }
    moveAlongPath(enemy, dt);
    enemy.anim = (enemy.anim || 0) + dt * 7;
    if (!playerInsideSafeZone() && dist(enemy, game.player) < (forklift ? 73 * enemy.scale : 43 * enemy.scale)) {
      if (playerRidingPalletJack(now)) disableEnemyFromPalletJack(enemy, now, forklift);
      else damagePlayer(forklift ? 2 : 1, now, forklift ? 'FORKLIFT COLLISION!' : 'ROBOT COLLISION!', enemy);
    }
  }
  function damagePlayer(amount, now, label, attacker) {
    if (game.mode !== 'play' || game.player.action || now < game.player.invulnerableUntil || playerInsideSafeZone()) return;
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
    { id: 'heart', weight: 8 }, { id: 'coffee', weight: 13 },
    { id: 'emailTask', weight: 30 }, { id: 'workdayTask', weight: 30 }, { id: 'sopToken', weight: 2 },
    { id: 'return', weight: 8 }, { id: 'mixed', weight: 7 }, { id: 'mould', weight: 8 }, { id: 'break', weight: 6 },
    { id: 'ops', weight: 3 }, { id: 'empty', weight: 5 }
  ];
  const smallBoxLoot = [
    { id: 'empty', weight: 38 }, { id: 'heart', weight: 8 }, { id: 'coffee', weight: 10 },
    { id: 'emailTask', weight: 20 }, { id: 'workdayTask', weight: 20 }, { id: 'sopToken', weight: 2 }
  ];
  function weightedFrom(table) {
    const total = table.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of table) { roll -= item.weight; if (roll <= 0) return item.id; }
    return 'empty';
  }
  function weightedLoot() { return weightedFrom(lootTable); }
  function weightedSmallBoxLoot() { return weightedFrom(smallBoxLoot); }
  function openNearbyBox(now) {
    if (game.player.action || game.mode !== 'play') return false;
    let smallIndex = -1, smallDistance = TILE * 1.05;
    game.decorativeProps.forEach((prop, i) => {
      if (!prop.interactive) return;
      const d = dist(game.player, decorativeCenter(prop));
      if (d < smallDistance) { smallDistance = d; smallIndex = i; }
    });
    if (smallIndex >= 0) {
      const prop = game.decorativeProps.splice(smallIndex, 1)[0];
      spawnShelfFrontProp(prop.image);
      game.stats.smallBoxesOpened++;
      const centre = decorativeCenter(prop);
      burst(centre.x, centre.y, '#ff6900', 7);
      startPlayerAction('pickup', 520, () => resolveLoot(weightedSmallBoxLoot(), performance.now()));
      saveShift();
      return true;
    }
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
      case 'heart':
        game.stats.heartsFound++;
        if (game.health < MAX_HEARTS) { game.health++; synth.pickup(); addMessage('HEART RESTORED!', '#ed4959', 1600); }
        else { game.score += 100; synth.points(); addMessage('FULL HEALTH  +100', '#ed4959', 1600); }
        break;
      case 'coffee': collectCoffee(); return;
      case 'emailTask': addTaskProgress('email', 1, 'EMAIL TASK FOUND'); return;
      case 'workdayTask': addTaskProgress('workday', 1, 'WORKDAY TASK FOUND'); return;
      case 'sopToken':
        game.tasks.tokens++;
        game.stats.sopTokensFound++;
        game.tokenFlashUntil = performance.now() + 900;
        synth.route();
        addMessage('SOP SCOUT TOKEN FOUND!', '#ff7700', 2500);
        updateBest();
        return;
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
    return { x: 50, y: 124, cell: 80, gap: 8, cols: PUZZLE_COLS, rows: PUZZLE_ROWS };
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
    if (index < 0 || index === puzzle.emptyIndex) return;
    const empty = puzzle.emptyIndex;
    const indexRow = Math.floor(index / PUZZLE_COLS), indexCol = index % PUZZLE_COLS;
    const emptyRow = Math.floor(empty / PUZZLE_COLS), emptyCol = empty % PUZZLE_COLS;
    const isNeighbour = Math.abs(indexRow - emptyRow) + Math.abs(indexCol - emptyCol) === 1;
    if (!isNeighbour) {
      puzzle.flashText = 'ONLY NEIGHBOUR ITEMS CAN MOVE';
      puzzle.flashUntil = performance.now() + 850;
      synth.note(190, .08, 'square', .03);
      return;
    }
    const movedType = puzzle.cells[index];
    puzzle.cells[empty] = movedType;
    puzzle.cells[index] = null;
    puzzle.emptyIndex = index;
    puzzle.selectedEmpty = false;
    checkInventoryMatch(empty);
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

  function qsSpawnInterval(elapsed) {
    return QS_SPAWN_PHASES[Math.min(QS_SPAWN_PHASES.length - 1, Math.floor(elapsed / 5000))];
  }
  function createQSItem(now) {
    const mouldy = Math.random() < 0.5;
    return {
      kind: mouldy ? 'mouldy' : 'damaged',
      frame: randInt(0, 11),
      baseX: rand(70, W - 70),
      x: 0,
      y: -72,
      w: randInt(112, 148),
      h: randInt(124, 168),
      speed: rand(178, 224),
      phase: rand(0, Math.PI * 2),
      drift: rand(14, 33),
      driftSpeed: rand(1.3, 2.2),
      spawnedAt: now
    };
  }
  function createQSPuzzle() {
    const now = performance.now();
    game.qsPuzzle = {
      startedAt: now,
      until: now + QS_DURATION,
      nextSpawnAt: now + 500,
      items: [],
      scoreEarned: 0,
      disposeCount: 0,
      destroyCount: 0,
      failedCount: 0,
      missedCount: 0,
      flashUntil: 0,
      flashText: '',
      basket: { x: W / 2, y: H - 111, w: 596, h: 210, speed: 720, dragging: false, pointerId: null, offsetX: 0 }
    };
    game.mode = 'qsPuzzle';
  }
  function startQSPuzzle() {
    if (game.mode !== 'play' || performance.now() < game.qsCooldownUntil) return;
    setGameplayControlsVisible(false);
    keys.clear();
    stopSprint();
    game.specialMusic = 'inventory';
    music.play('inventory', true);
    createQSPuzzle();
  }
  function updateQSPuzzle(dt, now) {
    const pz = game.qsPuzzle;
    if (!pz) return;
    const b = pz.basket;
    if (!b.dragging) {
      let dx = 0;
      if (keys.has('ArrowLeft') || keys.has('KeyA')) dx--;
      if (keys.has('ArrowRight') || keys.has('KeyD')) dx++;
      b.x = clamp(b.x + dx * b.speed * dt, 0, W);
    }
    const elapsed = now - pz.startedAt;
    while (now >= pz.nextSpawnAt && now < pz.until) {
      pz.items.push(createQSItem(now));
      pz.nextSpawnAt += qsSpawnInterval(elapsed);
    }
    const basketTop = b.y - b.h / 2 + 34;
    for (let i = pz.items.length - 1; i >= 0; i--) {
      const item = pz.items[i];
      item.y += item.speed * dt;
      item.x = item.baseX + Math.sin((now - item.spawnedAt) / 1000 * item.driftSpeed + item.phase) * item.drift;
      const withinBox = item.x >= b.x - b.w / 2 && item.x <= b.x + b.w / 2;
      if (withinBox && item.y + item.h / 2 >= basketTop && item.y < b.y + b.h / 2) {
        const side = item.x < b.x ? 'dispose' : 'destroy';
        const correct = (item.kind === 'damaged' && side === 'dispose') || (item.kind === 'mouldy' && side === 'destroy');
        if (correct) {
          pz.scoreEarned += 5;
          game.score += 5;
          if (side === 'dispose') pz.disposeCount++; else pz.destroyCount++;
          game.stats.quarantineSorts++;
          pz.flashText = '+5  CORRECT';
          synth.points();
          updateBest();
        } else {
          pz.failedCount++;
          pz.flashText = 'WRONG SORT  +0';
          synth.note(180, .08, 'square', .03);
        }
        pz.flashUntil = now + 700;
        pz.items.splice(i, 1);
      } else if (item.y - item.h / 2 > H) {
        pz.missedCount++;
        pz.items.splice(i, 1);
      }
    }
  }
  function finishQSPuzzle() {
    const pz = game.qsPuzzle;
    if (!pz) return;
    const exitTile = tileNearZoneEdge(game.zones.quarantine);
    const pos = tileCenter(exitTile);
    game.player.x = pos.x;
    game.player.y = pos.y;
    game.player.invulnerableUntil = performance.now() + 2300;
    game.qsCooldownUntil = performance.now() + 30000;
    game.qsPuzzle = null;
    game.specialMusic = null;
    game.mode = 'play';
    keys.clear();
    setGameplayControlsVisible(true);
    centerCamera();
    music.playGameplay();
    addMessage(`QUARANTINE SORT COMPLETE  +${pz.scoreEarned}  DISPOSE ${pz.disposeCount}  DESTROY ${pz.destroyCount}`, '#ff7700', 3400);
    updateBest();
  }
  function handleQSPointerDown(x, y, pointerId = null) {
    const pz = game.qsPuzzle;
    if (!pz) return false;
    const b = pz.basket;
    if (x < b.x - b.w / 2 || x > b.x + b.w / 2 || y < b.y - b.h / 2 || y > b.y + b.h / 2) return false;
    b.dragging = true;
    b.pointerId = pointerId;
    b.offsetX = x - b.x;
    return true;
  }
  function handleQSPointerMove(x, y, pointerId = null) {
    const pz = game.qsPuzzle;
    if (!pz || !pz.basket.dragging) return false;
    const b = pz.basket;
    if (b.pointerId !== null && pointerId !== null && b.pointerId !== pointerId) return false;
    b.x = clamp(x - b.offsetX, 0, W);
    return true;
  }
  function handleQSPointerUp(x, y, pointerId = null) {
    const pz = game.qsPuzzle;
    if (!pz || !pz.basket.dragging) return false;
    if (pz.basket.pointerId !== null && pointerId !== null && pz.basket.pointerId !== pointerId) return false;
    pz.basket.dragging = false;
    pz.basket.pointerId = null;
    return true;
  }

  function extinguisherStations() {
    const stations = [
      { label: 'DOCK OFFICE', pos: taskTargetPosition() },
      { label: 'INVENTORY CHECK', pos: destinationPosition(game.zones.inventory) },
      { label: 'QUARANTINE STORAGE', pos: destinationPosition(game.zones.quarantine) }
    ];
    game.zones.kitchens.forEach((zone, index) => stations.push({ label: `KITCHEN ${index + 1}`, pos: destinationPosition(zone) }));
    return stations;
  }
  function scheduleNextFire(now) { game.nextFireAt = now + randInt(50000, 115000); }
  function startFireEvent(now) {
    if (game.fire || game.mode !== 'play') return;
    let tile = randomFloorTile(TILE * 6, true);
    let attempts = 0;
    while ((tileInsideSafeZone(tile) || tileInsideZone(tile, game.zones.inventory) || tileInsideZone(tile, game.zones.quarantine)) && attempts++ < 40) tile = randomFloorTile(TILE * 6, true);
    const pos = tileCenter(tile);
    const station = extinguisherStations().sort((a, b) => dist(game.player, a.pos) - dist(game.player, b.pos))[0];
    game.fire = { x: pos.x, y: pos.y, startedAt: now, hasExtinguisher: false, station, warningUntil: now + 7000 };
    addMessage('🔥 WARNING FIRE! GET AN EXTINGUISHER — FOLLOW THE ARROW!', '#ee394d', 7000);
    synth.hurt();
  }
  function tryFireAction(now) {
    if (!game.fire || game.mode !== 'play' || game.fire.extinguishing) return false;
    if (!game.fire.hasExtinguisher && dist(game.player, game.fire.station.pos) < TILE * 3.0) {
      game.fire.hasExtinguisher = true;
      synth.pickup();
      addMessage('EXTINGUISHER COLLECTED — GET TO THE FIRE!', '#ffd054', 3500);
      return true;
    }
    if (game.fire.hasExtinguisher && dist(game.player, game.fire) < TILE * 1.9) {
      const seconds = (now - game.fire.startedAt) / 1000;
      const reward = seconds <= 60 ? 200 : seconds <= 90 ? 150 : seconds <= 120 ? 100 : seconds <= 150 ? 50 : 0;
      game.fire.extinguishing = true;
      game.fire.extinguishStartedAt = now;
      game.fire.extinguishUntil = now + 1450;
      game.fire.reward = reward;
      game.player.facing = game.fire.x < game.player.x ? 'left' : 'right';
      synth.spray();
      burst(game.fire.x, game.fire.y, '#d9ecff', 34);
      return true;
    }
    return false;
  }
  function finishFireExtinguish(now) {
    if (!game.fire) return;
    const reward = game.fire.reward || 0;
    game.score += reward;
    game.stats.firesExtinguished++;
    game.stats.firePoints += reward;
    burst(game.fire.x, game.fire.y, '#ffd054', 28);
    game.fire = null;
    hideFireOverlay();
    scheduleNextFire(now);
    synth.points();
    addMessage(`FIRE EXTINGUISHED!  +${reward}`, '#71dd8d', 3800);
    updateBest();
  }
  function updateFireEvent(now) {
    if (game.fire && game.fire.extinguishing && now >= game.fire.extinguishUntil) {
      finishFireExtinguish(now);
      return;
    }
    if (!game.fire && now >= game.nextFireAt) startFireEvent(now);
  }

  function triggerLevelWin() {
    if (game.player.action || game.mode !== 'play') return;
    if (!requiredTasksComplete()) {
      if (performance.now() >= game.exitWarnUntil) {
        game.exitWarnUntil = performance.now() + 3300;
        addMessage('YOU HAVE UNFINISHED WORK! GO TO THE OFFICE BEFORE YOU CAN LEAVE.', '#ff7700', 3100);
        addMessage(completionChecklist(), '#ffd054', 3100);
      }
      return;
    }
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

  function showAdminPanel(show) {
    adminPanel.classList.toggle('hidden', !show);
  }
  function adminReturnToWarehouse() {
    game.mode = 'play';
    game.office = null;
    game.inventoryPuzzle = null;
    game.qsPuzzle = null;
    game.fire = null;
    hideFireOverlay();
    game.nextFireAt = performance.now() + 9999999;
    game.specialMusic = null;
    keys.clear();
    setGameplayControlsVisible(true);
    cockpitHelpUI.classList.add('hidden');
    gameoverUI.classList.add('hidden');
    music.playGameplay();
  }
  function enterAdminMode() {
    if (game.mode !== 'title') return;
    game.adminMode = true;
    game.adminEscapeCount = 0;
    game.playerName = 'ADMIN TESTER';
    resetRun();
    game.score = 2000;
    game.tasks.tokens = 3;
    game.mode = 'play';
    titleUI.classList.add('hidden');
    gameoverUI.classList.add('hidden');
    setGameplayControlsVisible(true);
    buildLevel(1);
    game.score = 2000;
    game.tasks.tokens = 3;
    showAdminPanel(true);
    music.playGameplay(true);
    addMessage('ADMIN TEST MODE — SCORES NOT SAVED', '#ffd054', 3200);
  }
  function exitAdminMode() {
    game.adminMode = false;
    showAdminPanel(false);
    hideFireOverlay();
    game.fire = null;
    game.mode = 'title';
    pendingShiftStart = null;
    keys.clear();
    music.stop();
    setGameplayControlsVisible(false);
    titleUI.classList.remove('hidden');
    gameoverUI.classList.add('hidden');
    refreshSavedButton();
    startTitleMusic();
  }
  function adminDirectPuzzle(type) {
    adminReturnToWarehouse();
    game.tasks[type] = Math.max(game.tasks[type], 5);
    game.mode = 'office';
    game.office = { page: 'menu', selectedType: null, puzzle: null, hotspots: [], result: null };
    setGameplayControlsVisible(false);
    startOfficePuzzle(type);
  }
  function handleAdminAction(action) {
    if (!game.adminMode) return;
    const now = performance.now();
    if (action === 'points') { game.score += 500; addMessage('ADMIN +500 POINTS', '#ffd054', 1400); return; }
    if (action === 'token') { game.tasks.tokens++; addMessage('ADMIN +1 SOP TOKEN', '#ffd054', 1400); return; }
    if (action === 'hearts') { game.health = MAX_HEARTS; addMessage('ADMIN HEARTS RESTORED', '#ffd054', 1400); return; }
    if (action === 'inventory') { adminReturnToWarehouse(); game.inventoryCooldownUntil = 0; startInventoryBriefing(); return; }
    if (action === 'qs') { adminReturnToWarehouse(); game.qsCooldownUntil = 0; startQSPuzzle(); return; }
    if (action === 'fire') { adminReturnToWarehouse(); game.fire = null; startFireEvent(now); return; }
    if (action === 'office') { adminReturnToWarehouse(); game.tasks.alm = Math.max(game.tasks.alm, 5); game.tasks.sl = Math.max(game.tasks.sl, 5); game.tasks.email = Math.max(game.tasks.email, 5); game.tasks.workday = Math.max(game.tasks.workday, 5); game.mode = 'office'; game.office = { page: 'menu', selectedType: null, puzzle: null, hotspots: [], result: null }; setGameplayControlsVisible(false); return; }
    if (action === 'alm' || action === 'sl' || action === 'email' || action === 'workday') { adminDirectPuzzle(action); return; }
    if (action === 'sop') { adminReturnToWarehouse(); game.tasks.email = Math.max(game.tasks.email, 5); game.tasks.tokens = Math.max(game.tasks.tokens, 1); game.mode = 'office'; game.office = { page: 'sop', selectedType: null, puzzle: null, hotspots: [], result: null }; setGameplayControlsVisible(false); return; }
    if (action === 'truck') { adminReturnToWarehouse(); game.truck = { until: now + 30000, phase: 'waiting', arriveStarted: now }; addMessage('ADMIN: CARRIER AT DOCK — 30 SECONDS!', '#ff7700', 3000); return; }
    if (action === 'pallet') { adminReturnToWarehouse(); game.player.palletJackUntil = now + PALLET_JACK_DURATION; addMessage('ADMIN: PALLET JACK ACTIVE — 30s', '#ffd054', 2200); return; }
    if (action === 'exitLocked') { adminReturnToWarehouse(); game.tasks = freshTasks(); const pos = destinationPosition(game.zones.exit); game.player.x = pos.x; game.player.y = pos.y; centerCamera(); triggerLevelWin(); return; }
    if (action === 'exitOpen') { adminReturnToWarehouse(); TASK_TYPES.forEach(type => game.tasks.completed[type] = true); const pos = destinationPosition(game.zones.exit); game.player.x = pos.x; game.player.y = pos.y; centerCamera(); triggerLevelWin(); return; }
    if (action === 'gameover') { adminReturnToWarehouse(); game.health = 0; triggerDeath(); return; }
    if (action === 'next') { adminReturnToWarehouse(); game.level++; buildLevel(game.level); addMessage(`ADMIN: WAREHOUSE ${game.level}`, '#ffd054', 2300); return; }
  }

  function updateConveyorItems(dt) {
    if (!game.movingConveyorItems || !game.movingConveyorItems.length) return;
    game.movingConveyorItems.forEach(item => {
      item.x += item.dir * item.speed * dt;
      if (item.x < item.minX) { item.x = item.minX; item.dir = 1; }
      if (item.x > item.maxX) { item.x = item.maxX; item.dir = -1; }
    });
  }

  function update(dt, now) {
    if (game.mode === 'play') {
      updatePlayer(dt, now);
      if (game.mode !== 'play') {
        game.messages = game.messages.filter(message => message.until > now);
        updateParticles(dt);
        return;
      }
      game.enemies.forEach(enemy => updateEnemy(enemy, dt, now, false));
      game.forklifts.forEach(forklift => updateEnemy(forklift, dt, now, true));
      updateTruck(now);
      updateFireEvent(now);
      updateConveyorItems(dt);
      game.messages = game.messages.filter(message => message.until > now);
    } else if (game.mode === 'inventoryBriefing' && now >= game.inventoryBriefUntil) {
      createInventoryPuzzle();
    } else if (game.mode === 'inventoryPuzzle' && game.inventoryPuzzle && now >= game.inventoryPuzzle.until) {
      finishInventoryPuzzle();
    } else if (game.mode === 'qsPuzzle' && game.qsPuzzle) {
      updateQSPuzzle(dt, now);
      if (now >= game.qsPuzzle.until) finishQSPuzzle();
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
    // Subtle walkable-lane overlay: light aisles, darker shelf/blocked cells.
    const left = Math.max(0, Math.floor(view.x / TILE));
    const top = Math.max(0, Math.floor(view.y / TILE));
    const right = Math.min(MAP_W, Math.ceil((view.x + view.width) / TILE));
    const bottom = Math.min(MAP_H, Math.ceil((view.y + view.height) / TILE));
    ctx.save();
    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        ctx.fillStyle = game.map[y] && game.map[y][x] === 1 ? 'rgba(0,0,0,.045)' : 'rgba(255,255,255,.030)';
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
    ctx.restore();
  }
  function drawSceneryProp(prop, shadow = true) {
    if (!prop || !images[prop.image]) return;
    if (!onScreenRect(prop.left * TILE, prop.top * TILE, prop.width * TILE, prop.height * TILE, 100)) return;
    const inset = prop.image === 'conveyor' ? 0 : (prop.image === 'box5' || prop.image === 'box6' ? 2 : 5);
    let width = prop.width * TILE - inset * 2;
    let height = prop.height * TILE - inset * 2;
    if (prop.image === 'cone') { width *= .78; height *= .86; }
    drawContain(images[prop.image], prop.left * TILE + inset, prop.top * TILE + inset, width, height, 1, shadow, !!prop.flipX);
  }
  function drawConveyors(now = performance.now()) {
    game.conveyors.forEach(conveyor => {
      if (!images.conveyor || !onScreenRect(conveyor.left * TILE, conveyor.top * TILE, conveyor.width * TILE, conveyor.height * TILE, 80)) return;
      for (let i = 0; i < conveyor.pieces; i++) {
        drawContain(images.conveyor, (conveyor.left + i * 3.13) * TILE, conveyor.top * TILE, 3.05 * TILE, conveyor.height * TILE, 1, false);
      }
    });
    game.movingConveyorItems.forEach(item => {
      if (!images[item.image] || !onScreenRect(item.x - 90, item.y - 70, 180, 120, 80)) return;
      const w = (item.collectible ? 126 : 170) * item.size;
      const h = (item.collectible ? 80 : 100) * item.size;
      drawContain(images[item.image], item.x - w / 2, item.y - h * .62, w, h, 1, true);
    });
  }
  function drawObstacles() {
    game.borderProps.forEach(prop => drawSceneryProp(prop, true));
    game.obstacles.forEach(o => drawSceneryProp(o, true));
    drawConveyors(performance.now());
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
  function drawDecorativeClutter(now = performance.now()) {
    game.decorativeProps.forEach(prop => {
      if (!images[prop.image]) return;
      if (!onScreenRect(prop.left * TILE, prop.top * TILE, prop.width * TILE, prop.height * TILE, 60)) return;
      const hover = (prop.collectible || prop.interactive) ? Math.sin(now / 245 + prop.bob) * 6 : 0;
      if (prop.collectible || prop.interactive) {
        ctx.save(); ctx.globalAlpha = .18; ctx.fillStyle = '#ff6900'; ctx.beginPath();
        ctx.ellipse((prop.left + prop.width / 2) * TILE, (prop.top + prop.height) * TILE + 5, prop.width * TILE * .45, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      drawContain(images[prop.image], prop.left * TILE, prop.top * TILE + hover, prop.width * TILE, prop.height * TILE, 1, true, !!prop.flipX);
    });
  }
  function drawZoneSign(text, z, width = 300, height = 78) {
    const cx = z.left * TILE + z.width * TILE / 2;
    const top = z.top * TILE + 6;
    const left = cx - width / 2;
    ctx.save();
    if (images.sign) {
      drawContain(images.sign, left, top, width, height, 1, true);
    } else {
      ctx.fillStyle = 'rgba(255,183,82,.82)';
      ctx.fillRect(left, top, width, height);
    }
    ctx.font = 'bold 25px Trebuchet MS';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1d2228';
    ctx.fillText(text, cx, top + height * .60);
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
    drawZoneSign('DOCK', z, 330, 82);
    drawContain(images.entrance, z.left * TILE + 18, z.top * TILE + 64, TILE * 8.1, TILE * 3.0, .96, true);
    // Truck is drawn dynamically above the cached warehouse layer when it arrives.
  }
  function drawElevator(now = performance.now()) {
    const e = game.zones.elevator;
    if (!e || !isZoneVisible(e, 140)) return;
    const x = e.left * TILE, y = e.top * TILE;
    if (images.elevator) drawContain(images.elevator, x, y, e.width * TILE, e.height * TILE, .98, true);
    else { ctx.save(); ctx.fillStyle = '#b7c0cb'; ctx.fillRect(x, y, e.width * TILE, e.height * TILE); ctx.restore(); }
    const labels = currentElevatorDestinations(now);
    const flash = elevatorChangeFlashing(now) && Math.floor(now / 250) % 2 === 0;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px Trebuchet MS';
    labels.forEach((dest, i) => {
      if (!dest) return;
      const tx = x + (i + .5) * (e.width * TILE / 3);
      const ty = y + TILE * .52;
      ctx.fillStyle = flash ? '#d3ffb5' : '#58d34c';
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(0,0,0,.82)';
      ctx.strokeText(dest.label, tx, ty);
      ctx.fillText(dest.label, tx, ty);
    });
    ctx.restore();
  }
  function drawZones() {
    const q = game.zones.quarantine, inv = game.zones.inventory, ex = game.zones.exit;
    if (isZoneVisible(q, 120)) drawZoneSign('QUARANTINE STORAGE', q, 560, 84);
    if (isZoneVisible(game.zones.dock, 120)) drawDock(game.zones.dock);
    if (isZoneVisible(inv, 120)) drawZoneSign('INVENTORY CHECK', inv, 490, 84);
    game.zones.kitchens.forEach(k => { if (isZoneVisible(k, 120)) drawZoneSign('KITCHEN', k, 300, 80); });
    drawElevator(performance.now());
    game.zoneProps.forEach(prop => drawSceneryProp(prop, true));

    if (!isZoneVisible(ex, 120)) return;
    drawZoneSign('EXIT', ex, 270, 78);
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
    drawDecorativeClutter(performance.now());
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
  function hideFireOverlay() {
    if (fireAnimationOverlay) fireAnimationOverlay.classList.add('hidden');
  }
  function positionFireOverlay(now) {
    if (!fireAnimationOverlay || !game.fire || fireAnimationOverlay.dataset.failed === '1') return false;
    const pulse = 1 + Math.sin(now / 130) * .05;
    const fireW = 496 * pulse, fireH = 640 * pulse;
    if (!onScreenRect(game.fire.x - fireW / 2, game.fire.y - fireH * .78, fireW, fireH, 90)) {
      hideFireOverlay();
      return true;
    }
    const screenX = game.fire.x - game.camera.x - fireW / 2;
    const screenY = game.fire.y - game.camera.y - fireH * .78;
    fireAnimationOverlay.style.left = `${screenX / W * 100}%`;
    fireAnimationOverlay.style.top = `${screenY / H * 100}%`;
    fireAnimationOverlay.style.width = `${fireW / W * 100}%`;
    fireAnimationOverlay.style.height = `${fireH / H * 100}%`;
    fireAnimationOverlay.classList.remove('hidden');
    return true;
  }
  function drawExtinguisherStation(now) {
    if (!game.fire || game.fire.hasExtinguisher || !game.fire.station) return;
    const station = game.fire.station.pos;
    if (!onScreenRect(station.x - 54, station.y - 108, 108, 126, 90)) return;
    const bob = Math.sin(now / 220) * 5;
    ctx.save();
    ctx.globalAlpha = .28 + .12 * (1 + Math.sin(now / 150)) / 2;
    ctx.fillStyle = '#ffd054';
    ctx.beginPath(); ctx.ellipse(station.x, station.y + 14, 45, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (images.fireExtinguisher) drawContain(images.fireExtinguisher, station.x - 39, station.y - 101 + bob, 78, 112, 1, true);
    else { ctx.save(); ctx.font = '65px Arial'; ctx.textAlign = 'center'; ctx.fillText('🧯', station.x, station.y - 30 + bob); ctx.restore(); }
    ctx.save();
    ctx.font = 'bold 13px Trebuchet MS'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd054';
    ctx.fillText('PRESS ACTION', station.x, station.y + 37);
    ctx.restore();
  }
  function drawFireSpray(now) {
    if (!game.fire || !game.fire.extinguishing || !game.player) return;
    const t = clamp((now - game.fire.extinguishStartedAt) / Math.max(1, game.fire.extinguishUntil - game.fire.extinguishStartedAt), 0, 1);
    const sx = game.player.x + (game.fire.x < game.player.x ? -26 : 26);
    const sy = game.player.y - 40;
    const ex = game.fire.x;
    const ey = game.fire.y - 150;
    ctx.save();
    ctx.globalAlpha = .82 * (1 - t * .45);
    ctx.strokeStyle = '#e9f6ff';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    for (let i = 0; i < 18; i++) {
      const wobble = Math.sin(now / 45 + i) * 18;
      const endX = ex + rand(-42, 42) + wobble * .18;
      const endY = ey + rand(-58, 48);
      ctx.beginPath();
      ctx.moveTo(sx, sy + rand(-6, 6));
      ctx.quadraticCurveTo((sx + endX) / 2, (sy + endY) / 2 - 22 + rand(-12, 12), endX, endY);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(240,248,255,.72)';
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.arc(ex + rand(-95, 95), ey + rand(-82, 72), rand(2, 7), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function drawFireWorld(now) {
    if (!game.fire) { hideFireOverlay(); return; }
    const extinguishing = !!game.fire.extinguishing;
    const fade = extinguishing ? clamp((game.fire.extinguishUntil - now) / Math.max(1, game.fire.extinguishUntil - game.fire.extinguishStartedAt), 0, 1) : 1;
    const pulse = 1 + Math.sin(now / 130) * .05;
    const fireW = 496 * pulse, fireH = 640 * pulse;
    if (onScreenRect(game.fire.x - fireW / 2, game.fire.y - fireH * .78, fireW, fireH, 90)) {
      if (images.fireAnim) drawContain(images.fireAnim, game.fire.x - fireW / 2, game.fire.y - fireH * .78, fireW, fireH, .75 * fade, true);
      else { ctx.save(); ctx.globalAlpha = .75 * fade; ctx.font = '300px Arial'; ctx.textAlign = 'center'; ctx.fillText('🔥', game.fire.x, game.fire.y); ctx.restore(); }
    }
    if (!extinguishing) positionFireOverlay(now); else hideFireOverlay();
    drawFireSpray(now);
    drawExtinguisherStation(now);
  }
  function drawFireAlarm(now) {
    if (!game.fire || game.fire.extinguishing) return;
    const pulse = .14 + .15 * (1 + Math.sin(now / 175)) / 2;
    const grad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .28, W / 2, H / 2, Math.max(W, H) * .70);
    grad.addColorStop(0, 'rgba(255,0,0,0)');
    grad.addColorStop(1, `rgba(210,20,30,${pulse})`);
    ctx.save(); ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H); ctx.restore();
    if (performance.now() < game.fire.warningUntil) {
      ctx.save(); ctx.fillStyle = 'rgba(65,5,8,.92)'; ctx.fillRect(135, 86, W - 270, 52); ctx.strokeStyle = '#ee394d'; ctx.lineWidth = 3; ctx.strokeRect(135, 86, W - 270, 52);
      ctx.font = 'bold 22px Trebuchet MS'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff4df'; ctx.fillText('🔥 WARNING FIRE! GET AN EXTINGUISHER AND PUT OUT THE FIRE! 🔥', W / 2, 120); ctx.restore();
    }
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
    game.kitchenCoffees.forEach(coffee => {
      if (!coffee.available || !onScreenRect(coffee.x - 30, coffee.y - 54, 60, 86, 35)) return;
      const bob = Math.sin(now / 245 + coffee.bob) * 5;
      ctx.save();
      ctx.globalAlpha = .24;
      ctx.fillStyle = '#e59c47';
      ctx.beginPath();
      ctx.ellipse(coffee.x, coffee.y + 16, 29, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      drawContain(images.coffee, coffee.x - 27, coffee.y - 48 + bob, 54, 76, 1, true);
    });    game.palletJacks.forEach(jack => {
      if (jack.active === false || !onScreenRect(jack.x - 80, jack.y - 62, 160, 110, 35)) return;
      const bob = Math.sin(now / 260 + jack.bob) * 3;
      drawPalletJack(jack.x, jack.y + bob, 1);
    });
  }
  function drawPalletJack(x, y, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    if (images.palletjack) {
      drawContain(images.palletjack, x - 86, y - 54, 172, 108, alpha, true);
      ctx.restore();
      return;
    }
    drawShadow(x - 56, y - 8, 112, 42, .20 * alpha);
    ctx.fillStyle = '#ff6900';
    ctx.fillRect(x - 54, y + 8, 66, 8);
    ctx.fillRect(x - 54, y - 4, 12, 24);
    ctx.fillRect(x - 22, y - 4, 12, 24);
    ctx.fillStyle = '#2f3137';
    ctx.fillRect(x - 2, y - 32, 10, 43);
    ctx.strokeStyle = '#2f3137';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x + 4, y - 30);
    ctx.lineTo(x + 35, y - 48);
    ctx.lineTo(x + 42, y - 42);
    ctx.lineTo(x + 11, y - 22);
    ctx.stroke();
    ctx.fillStyle = '#555a63';
    ctx.beginPath(); ctx.arc(x - 44, y + 16, 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x - 14, y + 16, 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 8, y + 16, 10, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawPlayer(now) {
    const p = game.player;
    if (!p) return;
    const carryingExtinguisher = game.fire && game.fire.hasExtinguisher;
    if (playerRidingPalletJack(now)) drawPalletJack(p.x - 2, p.y + 28, .95);
    if (now < p.invulnerableUntil && (!p.action || p.action.type !== 'jump') && Math.floor(now / 100) % 2 === 0 && game.mode === 'play') return;
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
    if (carryingExtinguisher) {
      if (images.fireExtinguisher) drawContain(images.fireExtinguisher, p.x + (p.facing === 'left' ? -44 : 14), p.y - 56, 38, 76, 1, true);
      else { ctx.save(); ctx.font = '38px Arial'; ctx.fillText('🧯', p.x + 12, p.y - 18); ctx.restore(); }
    }
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
  function taskTargetPosition() { return tileCenter({ x: game.zones.dock.left + 4, y: game.zones.dock.top + 4 }); }
  function drawGuidanceArrow(now) {
    if (!game.player || game.mode !== 'play') return;
    const guideFire = !!game.fire;
    const guideOffice = anyTaskReady();
    const guideDelivery = game.truck && game.truck.phase !== 'leaving';
    if (!guideFire && !guideOffice && !guideDelivery) return;
    const target = guideFire ? (game.fire.hasExtinguisher ? game.fire : game.fire.station.pos) : taskTargetPosition();
    const label = guideFire ? (game.fire.hasExtinguisher ? 'FIRE' : 'EXTINGUISHER') : (guideDelivery ? 'DELIVERY' : 'OFFICE');
    const dx = target.x - game.player.x, dy = target.y - game.player.y;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const arrow = horizontal ? (dx < 0 ? '◀' : '▶') : (dy < 0 ? '▲' : '▼');
    const screenX = game.player.x - game.camera.x + (horizontal ? (dx < 0 ? -94 : 78) : 0);
    const screenY = game.player.y - game.camera.y + (horizontal ? -30 : (dy < 0 ? -116 : 55));
    const pulse = .42 + .34 * (1 + Math.sin(now / 150)) / 2;
    ctx.save(); ctx.globalAlpha = pulse; ctx.font = 'bold 58px Trebuchet MS'; ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6900'; ctx.shadowColor = '#ff6900'; ctx.shadowBlur = 22; ctx.fillText(arrow, screenX, screenY);
    ctx.globalAlpha = .95; ctx.shadowBlur = 0; ctx.font = 'bold 13px Trebuchet MS'; ctx.fillStyle = '#ffd054';
    ctx.fillText(label, screenX, screenY + 22); ctx.restore();
  }
  function cockpitRect() { return { x: 16, y: 80, w: 232, h: 169 }; }
  function drawTaskBoard() {
    ctx.save(); const { x, y, w, h } = cockpitRect();
    ctx.fillStyle = 'rgba(12,15,18,.88)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#ff6900'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
    ctx.font = 'bold 16px Trebuchet MS'; ctx.fillStyle = '#ffd054'; ctx.fillText('COCKPIT', x + 13, y + 23);
    ctx.font = 'bold 11px Trebuchet MS'; ctx.textAlign = 'right'; ctx.fillStyle = '#ff9a3b'; ctx.fillText('CLICK FOR HELP  ?', x + w - 12, y + 22); ctx.textAlign = 'left';
    TASK_TYPES.forEach((type, i) => { const py = y + 51 + i * 21, jobs = taskJobsReady(type); ctx.font = 'bold 13px Trebuchet MS'; ctx.fillStyle = game.tasks.completed[type] ? '#71dd8d' : '#fff4df'; ctx.fillText(`${TASK_LABELS[type]} ${game.tasks[type]}/5`, x + 13, py); ctx.textAlign = 'right'; ctx.fillStyle = jobs ? '#ff9a3b' : '#cdbd9e'; ctx.fillText(jobs ? `${jobs} READY` : (game.tasks.completed[type] ? 'DONE ✓' : '—'), x + w - 12, py); ctx.textAlign = 'left'; });
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 13px Trebuchet MS'; ctx.fillText(`SOP TOKENS  ${game.tasks.tokens}`, x + 13, y + h - 11);
    ctx.restore();
  }
  function openCockpitHelp() {
    if (game.mode !== 'play') return;
    game.mode = 'cockpitHelp';
    keys.clear(); stopSprint(); setGameplayControlsVisible(false);
    cockpitHelpUI.classList.remove('hidden');
  }
  function closeCockpitHelp() {
    if (game.mode !== 'cockpitHelp') return;
    cockpitHelpUI.classList.add('hidden');
    game.mode = 'play';
    setGameplayControlsVisible(true);
  }
  function drawTokenCelebration(now) { if (now >= game.tokenFlashUntil) return; const alpha = clamp((game.tokenFlashUntil - now) / 900, 0, 1) * .36; ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#ff6900'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
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
    if (playerRidingPalletJack(now)) {
      ctx.fillStyle = '#ffd054';
      ctx.font = 'bold 16px Trebuchet MS';
      ctx.fillText(`PALLET JACK  ${Math.ceil((game.player.palletJackUntil - now) / 1000)}s`, 782, 43);
    }
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
    drawTaskBoard();
    drawGuidanceArrow(now);
    drawCarrierToast(now);
    drawTokenCelebration(now);
    drawFireAlarm(now);
  }
  function drawTitle() {
    drawCoverImage(images.background, 0, 0, W, H);
    ctx.fillStyle = 'rgba(11,12,14,.46)'; ctx.fillRect(0, 0, W, H);
    drawContain(images.title, 240, 70, 800, 224, 1, true);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 29px Trebuchet MS'; ctx.fillText(`WAREHOUSE RUN  •  ${VERSION}`, W / 2, 328);
    ctx.fillStyle = '#f6e8ce'; ctx.font = '18px Trebuchet MS';
    ctx.fillText('WASD / ARROWS  MOVE     SPACE  ACTION / COFFEE SPRINT     M  MUTE', W / 2, 598);
    ctx.font = 'bold 19px Trebuchet MS'; ctx.fillStyle = '#ffd054'; ctx.fillText(`BEST SCORE  ${formatScore(game.bestScore)}`, W / 2, 652);
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
      ['DELIVERIES', game.stats.trucksCompleted], ['COFFEES', game.stats.coffeesCollected], ['LUNCH BREAKS', game.stats.lunchBreaks],
      ['ARTICLES IN BAD CONDITION', game.stats.quarantineSorts], ['FIRES OUT', game.stats.firesExtinguished], ['CNR RETURN', game.stats.returnsProcessed],
      ['INVENTORY PAIRS', game.stats.inventoryMatches], ['ALM TICKETS', game.stats.almTasksCompleted], ['SL TICKETS', game.stats.slTasksCompleted],
      ['EMAIL TASKS', game.stats.emailTasksCompleted], ['WORKDAY TASKS', game.stats.workdayTasksCompleted], ['SOP USED', game.stats.sopTokensUsed],
      ['TASKS FAILED', game.stats.taskFailures]
    ];
    ctx.fillStyle = 'rgba(15,18,21,.76)'; ctx.fillRect(128, 350, 1024, 205);
    ctx.strokeStyle = 'rgba(255,105,0,.74)'; ctx.lineWidth = 2; ctx.strokeRect(128, 350, 1024, 205);
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 19px Trebuchet MS'; ctx.fillText('SHIFT SUMMARY', W / 2, 378);
    ctx.textAlign = 'left';
    summary.forEach(([label, value], i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 166 + col * 327, y = 410 + row * 27;
      ctx.fillStyle = '#edc17e'; ctx.font = 'bold 14px Trebuchet MS'; ctx.fillText(label, x, y);
      ctx.fillStyle = '#fff4df'; ctx.font = 'bold 18px Trebuchet MS'; ctx.fillText(String(value), x + 207, y);
    });
    ctx.textAlign = 'center'; ctx.fillStyle = '#f6e8ce'; ctx.font = '17px Trebuchet MS';
    ctx.fillText('Continue from the Dock, or begin a new shift.', W / 2, 579);
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
    drawFireWorld(now);
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
      ctx.lineWidth = pz.cells[i] === null ? 4 : 3;
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

  function drawQSSprite(item) {
    const sheet = item.kind === 'mouldy' && images.clothesDamaged ? images.clothesDamaged : images.clothes;
    if (!sheet) return;
    const cols = 4, rows = 3, sw = sheet.width / cols, sh = sheet.height / rows;
    const col = item.frame % cols, row = Math.floor(item.frame / cols);
    ctx.drawImage(sheet, col * sw, row * sh, sw, sh, item.x - item.w / 2, item.y - item.h / 2, item.w, item.h);
  }
  function drawQSPuzzle(now) {
    const pz = game.qsPuzzle;
    if (!pz) return;
    if (images.qsBg) drawCoverImage(images.qsBg, 0, 0, W, H);
    else { ctx.fillStyle = '#4d5052'; ctx.fillRect(0, 0, W, H); }
    ctx.fillStyle = 'rgba(0,0,0,.26)'; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.fillStyle = 'rgba(12,15,18,.91)'; ctx.fillRect(36, 20, W - 72, 74);
    ctx.strokeStyle = '#ff6900'; ctx.lineWidth = 3; ctx.strokeRect(36, 20, W - 72, 74);
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 30px Trebuchet MS'; ctx.fillText('QUARANTINE CHAOS', 62, 65);
    ctx.textAlign = 'right'; ctx.fillStyle = '#ffd054'; ctx.fillText(`TIME  ${Math.max(0, Math.ceil((pz.until - now) / 1000))}s`, W - 60, 65);
    ctx.textAlign = 'left'; ctx.font = 'bold 18px Trebuchet MS';
    ctx.fillStyle = '#fff4df'; ctx.fillText(`DISPOSED  ${pz.disposeCount}    DESTROYED  ${pz.destroyCount}    BONUS  +${pz.scoreEarned}`, 62, 118);
    pz.items.forEach(item => drawQSSprite(item));
    const b = pz.basket;
    if (images.slbox) drawContain(images.slbox, b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 1, true);
    else {
      ctx.fillStyle = '#b58652'; ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
      ctx.strokeStyle = '#ff6900'; ctx.strokeRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
    }
    if (now < pz.flashUntil) {
      ctx.fillStyle = pz.flashText.startsWith('+5') ? '#71dd8d' : '#ee394d';
      ctx.font = 'bold 30px Trebuchet MS'; ctx.fillText(pz.flashText, W / 2, 174);
    }
    ctx.restore();
  }

  function officeScreenRect() { return game.office && game.office.page === 'menu' ? OFFICE_MENU_MONITOR : OFFICE_APP_MONITOR; }
  function drawOfficeBase() {
    if (images.officeBase) drawCoverImage(images.officeBase, 0, 0, W, H);
    else { drawCoverImage(images.background, 0, 0, W, H); ctx.fillStyle = 'rgba(22,15,34,.62)'; ctx.fillRect(0, 0, W, H); }
  }
  function drawMonitorImage(img) { const r = OFFICE_MENU_MONITOR; if (img) drawCoverImage(img, r.x, r.y - 13, r.width, r.height + 13); }
  function officeRoundRect(x, y, w, h, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y); ctx.lineTo(x + w - radius, y); ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius); ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius); ctx.quadraticCurveTo(x, y, x + radius, y); ctx.closePath();
  }
  function officeButton(x, y, w, h, label, id, active = true, style = 'default') {
    const jira = style === 'jira';
    game.office.hotspots.push({ x: x - 8, y: y - 8, w: w + 16, h: h + 16, id, active });
    ctx.save();
    const fill = active ? (jira ? '#1268d6' : '#ff6900') : '#d6d6d6';
    const stroke = active ? (jira ? '#084baf' : '#d95600') : '#a7a7a7';
    officeRoundRect(x, y, w, h, jira ? 10 : 5);
    ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = active ? '#fff' : '#f7f7f7'; ctx.font = 'bold 15px Trebuchet MS'; ctx.textAlign = 'center'; ctx.fillText(label, x + w / 2, y + h / 2 + 5); ctx.restore();
  }
  function drawOfficeMenu() {
    const r = OFFICE_MENU_MONITOR;
    drawMonitorImage(images.officeMenu);
    game.office.hotspots = [
      { x: r.x + r.width * .075, y: r.y + r.height * .27, w: r.width * .18, h: r.height * .27, id: 'app-sop', active: true },
      { x: r.x + r.width * .285, y: r.y + r.height * .27, w: r.width * .18, h: r.height * .27, id: 'app-jira', active: true },
      { x: r.x + r.width * .495, y: r.y + r.height * .27, w: r.width * .18, h: r.height * .27, id: 'app-email', active: true },
      { x: r.x + r.width * .705, y: r.y + r.height * .27, w: r.width * .18, h: r.height * .27, id: 'app-workday', active: true }
    ];
  }
  function drawOfficeHeader(title, subtitle = '') {
    const r = OFFICE_APP_MONITOR;
    ctx.save();
    ctx.fillStyle = '#242832'; ctx.font = 'bold 23px Trebuchet MS'; ctx.fillText(title, r.x + 24, r.y + 41);
    if (subtitle) { ctx.fillStyle = '#5b606b'; ctx.font = '14px Trebuchet MS'; ctx.fillText(subtitle, r.x + 24, r.y + 65); }
    ctx.strokeStyle = '#dfdfdf'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(r.x + 20, r.y + 78); ctx.lineTo(r.x + r.width - 20, r.y + 78); ctx.stroke();
    ctx.restore();
  }
  function drawOfficeChoice(page, types, title, tokenMode = false) {
    const r = OFFICE_APP_MONITOR;
    const buttonStyle = page === 'jira' ? 'jira' : 'default';
    drawOfficeHeader(title, tokenMode ? 'Choose one ready task for SOP Scout to complete instantly.' : 'Choose the backlog category to process.');
    types.forEach((type, i) => officeButton(r.x + 24, r.y + 92 + i * 46, r.width - 48, 36, `${TASK_LABELS[type]} — ${taskJobsReady(type)} READY`, `${tokenMode ? 'token-' : 'puzzle-'}${type}`, taskJobsReady(type) > 0 && (!tokenMode || game.tasks.tokens > 0), buttonStyle));
    officeButton(r.x + r.width - 125, r.y + r.height - 39, 101, 27, 'BACK', 'office-menu', true, buttonStyle);
  }
  function startOfficePuzzle(type) {
    if (taskJobsReady(type) < 1) return;
    const data = TASK_PUZZLES[type];
    let index = randInt(0, data.puzzles.length - 1);
    if (data.puzzles.length > 1) {
      while (index === game.lastPuzzleIndex[type]) index = randInt(0, data.puzzles.length - 1);
    }
    game.lastPuzzleIndex[type] = index;
    const challenge = data.puzzles[index];
    game.office.page = 'puzzle';
    game.office.selectedType = type;
    game.office.puzzle = { type, data, challenge, selected: [], locked: [], hintText: '', hintColor: '#1268d6', hintUntil: 0 };
    game.office.result = null;
  }
  function buyOfficeHint() {
    const pz = game.office && game.office.puzzle;
    if (!pz) return;
    if (game.score < HINT_COST) {
      pz.hintText = 'NOT ENOUGH POINTS — A HINT COSTS 100.';
      pz.hintColor = '#bd2837';
      pz.hintUntil = performance.now() + 2600;
      return;
    }
    game.score -= HINT_COST;
    game.stats.hintsBought++;
    const wrong = pz.selected.filter(emoji => !pz.challenge.answer.includes(emoji));
    if (wrong.length) {
      const display = wrong.join(' · ');
      const verb = wrong.length === 1 ? 'IS' : 'ARE';
      pz.hintText = `HINT: ${display} ${verb} NOT USED IN THIS TASK.`;
      pz.hintColor = '#bd2837';
    } else {
      const missing = pz.challenge.answer.filter(emoji => !pz.selected.includes(emoji));
      if (missing.length) {
        const reveal = missing[0];
        pz.selected.push(reveal);
        pz.locked.push(reveal);
        pz.hintText = `HINT: ${reveal} IS USED AND HAS BEEN LOCKED IN.`;
        pz.hintColor = '#1268d6';
      } else {
        pz.hintText = 'HINT: ALL YOUR SELECTIONS ARE USED — SUBMIT.';
        pz.hintColor = '#1268d6';
      }
    }
    pz.hintUntil = performance.now() + 3300;
    synth.pickup();
    updateBest();
  }
  function submitOfficePuzzle() {
    const pz = game.office && game.office.puzzle;
    if (!pz || pz.selected.length !== 3) return;
    const ok = pz.selected.slice().sort().join('|') === pz.challenge.answer.slice().sort().join('|');
    completeTaskUnit(pz.type, false, ok);
    const now = performance.now();
    game.office.result = { ok, type: pz.type, flashUntil: ok ? now : now + 2000, until: ok ? now + 1600 : now + 3600 };
    game.office.puzzle = null;
    game.office.page = 'result';
  }
  function drawOfficeResult(now) {
    const r = OFFICE_APP_MONITOR, result = game.office.result;
    if (!result) { game.office.page = 'menu'; return; }
    if (!result.ok && images.errorScreen && now < result.flashUntil) {
      drawCoverImage(images.errorScreen, r.x, r.y, r.width, r.height);
      return;
    }
    drawOfficeHeader(TASK_LABELS[result.type] + ' TASK RESULT');
    ctx.save(); ctx.textAlign = 'center';
    ctx.fillStyle = result.ok ? '#1b8b4c' : '#bd2837';
    ctx.font = 'bold 39px Trebuchet MS';
    ctx.fillText(result.ok ? 'CORRECT!' : 'WRONG!', r.x + r.width / 2, r.y + 164);
    ctx.fillStyle = '#242832'; ctx.font = 'bold 24px Trebuchet MS';
    ctx.fillText(result.ok ? 'TASK COMPLETE  +50' : 'TASK FAILED  +0', r.x + r.width / 2, r.y + 205);
    ctx.restore();
    if (now >= result.until) {
      const type = result.type;
      game.office.result = null;
      if (taskJobsReady(type) > 0) startOfficePuzzle(type); else game.office.page = 'menu';
    }
  }
  function drawOfficePuzzle() {
    const r = OFFICE_APP_MONITOR, pz = game.office.puzzle;
    const jira = pz.type === 'alm' || pz.type === 'sl';
    const accent = jira ? '#1268d6' : '#ff6900';
    drawOfficeHeader(pz.data.app, 'SELECT THE THREE MATCHING EMOJIS — ORDER DOES NOT MATTER');
    const slotsX = r.x + 143, slotsY = r.y + 80;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const sx = slotsX + i * 60;
      officeRoundRect(sx, slotsY, 49, 38, jira ? 8 : 4);
      ctx.fillStyle = '#f2f3f5'; ctx.fill(); ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.stroke();
      ctx.font = '25px Arial';
      if (pz.selected[i]) {
        ctx.fillText(pz.selected[i], sx + 9, slotsY + 28);
        if (pz.locked.includes(pz.selected[i])) { ctx.font = '12px Arial'; ctx.fillText('🔒', sx + 31, slotsY + 12); }
      }
    }
    ctx.fillStyle = '#242832'; ctx.font = 'bold 11px Trebuchet MS';
    const words = pz.challenge.clue.split(' '); let line = '', yy = r.y + 137;
    words.forEach(word => { const test = line ? `${line} ${word}` : word; if (ctx.measureText(test).width > r.width - 42) { ctx.fillText(line, r.x + 20, yy); yy += 15; line = word; } else line = test; });
    if (line) ctx.fillText(line, r.x + 20, yy);
    if (pz.hintText && performance.now() < pz.hintUntil) {
      ctx.fillStyle = pz.hintColor; ctx.font = 'bold 11px Trebuchet MS'; ctx.fillText(pz.hintText, r.x + 20, r.y + 194);
    }
    ctx.restore();
    pz.data.bank.forEach((emoji, i) => {
      const x = r.x + 15 + i * 59, y = r.y + 205;
      game.office.hotspots.push({ x: x - 4, y: y - 4, w: 54, h: 47, id: `emoji-${emoji}`, active: true });
      ctx.save();
      const selected = pz.selected.includes(emoji), locked = pz.locked.includes(emoji);
      officeRoundRect(x, y, 46, 38, jira ? 8 : 4);
      ctx.fillStyle = selected ? (jira ? '#dbeafe' : '#ffdfca') : '#f4f4f4'; ctx.fill();
      ctx.strokeStyle = selected ? accent : '#bcbcbc'; ctx.lineWidth = 2; ctx.stroke();
      ctx.font = '24px Arial'; ctx.fillText(emoji, x + 8, y + 27);
      if (locked) { ctx.font = '11px Arial'; ctx.fillText('🔒', x + 28, y + 11); }
      ctx.restore();
    });
    const actionsRight = r.x + r.width - 20;
    officeButton(actionsRight - 284, r.y + r.height - 39, 158, 28, 'BUY HINT  -100', 'buy-hint', game.score >= HINT_COST, jira ? 'jira' : 'default');
    officeButton(actionsRight - 112, r.y + r.height - 39, 112, 28, 'SUBMIT', 'submit-puzzle', pz.selected.length === 3, jira ? 'jira' : 'default');
  }
  function drawOffice(now) {
    drawOfficeBase();
    game.office.hotspots = [];
    if (game.office.page === 'menu') drawOfficeMenu();
    else if (game.office.page === 'jira') drawOfficeChoice('jira', ['alm','sl'], 'JIRA TASK BACKLOG');
    else if (game.office.page === 'sop') drawOfficeChoice('sop', TASK_TYPES.filter(type => taskJobsReady(type) > 0), 'SOP SCOUT', true);
    else if (game.office.page === 'puzzle') drawOfficePuzzle();
    else if (game.office.page === 'result') drawOfficeResult(now);
    if (images.officeFrame) drawCoverImage(images.officeFrame, 0, 0, W, H);
    officeButton(W - 178, H - 62, 148, 42, 'LEAVE OFFICE', 'leave-office', true);
    ctx.save(); ctx.fillStyle = '#fff4df'; ctx.font = 'bold 16px Trebuchet MS'; ctx.fillText('ESC — LEAVE OFFICE', 22, H - 23); ctx.restore();
    drawTokenCelebration(now);
  }

  function handleOfficeClick(x, y) { if (game.mode !== 'office' || !game.office) return; const spot = game.office.hotspots.find(h => x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h); if (!spot || !spot.active) return; const id = spot.id; if (id === 'leave-office') { game.mode = 'play'; game.office = null; setGameplayControlsVisible(true); music.playGameplay(); return; } if (id === 'office-menu') { game.office.page = 'menu'; game.office.puzzle = null; return; } if (id === 'app-sop') { if (game.tasks.tokens && anyTaskReady()) game.office.page = 'sop'; else addMessage('NO SOP TOKEN OR NO READY TASKS', '#ffd054', 1800); return; } if (id === 'app-jira') { if (taskJobsReady('alm') || taskJobsReady('sl')) game.office.page = 'jira'; else addMessage('NO JIRA TASKS READY', '#ffd054', 1700); return; } if (id === 'app-email') { if (taskJobsReady('email')) startOfficePuzzle('email'); else addMessage('NO EMAIL TASKS READY', '#ffd054', 1700); return; } if (id === 'app-workday') { if (taskJobsReady('workday')) startOfficePuzzle('workday'); else addMessage('NO WORKDAY TASKS READY', '#ffd054', 1700); return; } if (id.startsWith('puzzle-')) { startOfficePuzzle(id.slice(7)); return; } if (id.startsWith('token-')) { const type = id.slice(6); if (game.tasks.tokens > 0 && taskJobsReady(type) > 0) { game.tasks.tokens--; completeTaskUnit(type, true, true); addMessage(`SOP SCOUT COMPLETED ${TASK_LABELS[type]}  +50`, '#ff7700', 2300); if (!anyTaskReady() || game.tasks.tokens <= 0) game.office.page = 'menu'; } return; } if (id === 'buy-hint') { buyOfficeHint(); return; } if (id.startsWith('emoji-') && game.office.puzzle) { const emoji = id.slice(6), chosen = game.office.puzzle.selected, idx = chosen.indexOf(emoji); if (idx >= 0) { if (!game.office.puzzle.locked.includes(emoji)) chosen.splice(idx, 1); } else if (chosen.length < 3) chosen.push(emoji); return; } if (id === 'submit-puzzle') submitOfficePuzzle(); }
  function draw(now) {
    if (game.mode !== 'play' && game.mode !== 'cockpitHelp') hideFireOverlay();
    ctx.clearRect(0, 0, W, H);
    if (game.mode === 'title' || game.mode === 'intro') drawTitle();
    else if (game.mode === 'play' || game.mode === 'dying' || game.mode === 'cockpitHelp') drawWorld(now);
    else if (game.mode === 'inventoryBriefing') drawInventoryBriefing();
    else if (game.mode === 'inventoryPuzzle') drawInventoryPuzzle(now);
    else if (game.mode === 'office') drawOffice(now);
    else if (game.mode === 'qsPuzzle') drawQSPuzzle(now);
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
      [`Deliveries`, game.stats.trucksCompleted], [`Coffees`, game.stats.coffeesCollected],
      [`Lunch breaks`, game.stats.lunchBreaks], [`CNR Return`, game.stats.returnsProcessed],
      [`Inventory pairs`, game.stats.inventoryMatches], [`Articles in bad condition`, game.stats.quarantineSorts],
      [`Fires extinguished`, game.stats.firesExtinguished], [`SOP tokens used`, game.stats.sopTokensUsed],
      [`Task failures`, game.stats.taskFailures], [`ALM Tickets`, game.stats.almTasksCompleted],
      [`SL Tickets`, game.stats.slTasksCompleted], [`Email tasks`, game.stats.emailTasksCompleted],
      [`Workday tasks`, game.stats.workdayTasksCompleted]
    ];
    rc.font = 'bold 15px Trebuchet MS'; rc.textAlign = 'left';
    lines.forEach(([label, value], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 168 + col * 455, y = 397 + row * 30;
      rc.fillStyle = '#edc17e'; rc.fillText(label.toUpperCase(), x, y);
      rc.fillStyle = '#fff4df'; rc.textAlign = 'right'; rc.fillText(String(value), x + 350, y); rc.textAlign = 'left';
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
  closeCockpitHelpButton.addEventListener('click', closeCockpitHelp);
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

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  }

  fireAnimationOverlay.addEventListener('error', () => { fireAnimationOverlay.dataset.failed = '1'; fireAnimationOverlay.classList.add('hidden'); });
  adminExitButton.addEventListener('click', exitAdminMode);
  adminButtons.forEach(button => button.addEventListener('click', () => handleAdminAction(button.dataset.admin)));

  titleUI.addEventListener('pointerdown', () => { synth.init(); startTitleMusic(); });
  nameInput.addEventListener('focus', () => { synth.init(); startTitleMusic(); });
  canvas.addEventListener('click', event => {
    const { x, y } = canvasPoint(event);
    if (game.mode === 'inventoryPuzzle') handleInventoryClick(x, y);
    else if (game.mode === 'office') handleOfficeClick(x, y);
    else if (game.mode === 'play') { const c = cockpitRect(); if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) openCockpitHelp(); }
  });
  canvas.addEventListener('pointerdown', event => {
    if (game.mode !== 'qsPuzzle') return;
    const { x, y } = canvasPoint(event);
    if (handleQSPointerDown(x, y, event.pointerId)) {
      synth.init();
      canvas.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    }
  });
  canvas.addEventListener('pointermove', event => {
    if (game.mode !== 'qsPuzzle') return;
    const { x, y } = canvasPoint(event);
    if (handleQSPointerMove(x, y, event.pointerId)) event.preventDefault();
  });
  const releaseQSPointer = event => {
    if (game.mode !== 'qsPuzzle') return;
    const { x, y } = canvasPoint(event);
    if (handleQSPointerUp(x, y, event.pointerId)) {
      canvas.releasePointerCapture?.(event.pointerId);
      event.preventDefault();
    }
  };
  canvas.addEventListener('pointerup', releaseQSPointer);
  canvas.addEventListener('pointercancel', releaseQSPointer);
  introNextButton.addEventListener('click', nextIntroSlide);
  introSkipButton.addEventListener('click', skipIntro);
  nameInput.addEventListener('input', () => {
    nameWarning.classList.add('hidden');
    showProfileWarning();
    const value = nameInput.value.trim().toLowerCase();
    const match = readProfiles().find(profile => profile.name.toLowerCase() === value);
    game.selectedProfileId = match ? match.id : '';
    localStorage.setItem(ACTIVE_PROFILE_KEY, game.selectedProfileId);
    renderProfiles();
    continueSavedButton.classList.add('hidden');
  });
  nameInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') startNewShift();
  });

  document.addEventListener('click', event => { if (!volumePanel.contains(event.target) && !muteToggleButton.contains(event.target)) volumePanel.classList.add('hidden'); });

  document.addEventListener('keydown', event => {
    const prevent = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code);
    if (prevent && (game.mode === 'play' || game.mode === 'qsPuzzle')) event.preventDefault();
    if (event.code === 'Escape' && game.mode === 'title') {
      const now = performance.now();
      game.adminEscapeCount = now <= game.adminEscapeUntil ? game.adminEscapeCount + 1 : 1;
      game.adminEscapeUntil = now + 4000;
      if (game.adminEscapeCount >= 5) enterAdminMode();
      return;
    }
    if (document.activeElement === nameInput) return;
    synth.init();
    const directionButton = controlButtonForCode(event.code);
    if (directionButton) directionButton.classList.add('active');
    if (event.code === 'KeyM') {
      toggleAudio();
      return;
    }
    if (event.code === 'Escape' && game.mode === 'cockpitHelp') { closeCockpitHelp(); return; }
    if (event.code === 'Escape' && game.mode === 'intro') {
      skipIntro();
      return;
    }
    if (event.code === 'Escape' && game.mode === 'office') {
      game.mode = 'play'; game.office = null; setGameplayControlsVisible(true); music.playGameplay(); return;
    }
    if (event.code === 'Escape' && game.mode === 'qsPuzzle') {
      finishQSPuzzle();
      return;
    }
    if (event.code === 'Escape') {
      if (game.adminMode) { exitAdminMode(); return; }
      game.mode = 'title';
      pendingShiftStart = null;
      stopIntroTyping();
      introUI.classList.add('hidden');
      cockpitHelpUI.classList.add('hidden');
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
