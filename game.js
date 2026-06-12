(() => {
  'use strict';

  window.addEventListener('error', event => {
    const loadingNode = document.getElementById('loading');
    if (loadingNode && !loadingNode.classList.contains('hidden')) {
      loadingNode.textContent = `Startup error: ${event.message}`;
    }
  });


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
  const fullscreenModeButton = document.getElementById('fullscreen-mode');
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
  const adminCollapseButton = document.getElementById('admin-collapse');
  const adminButtons = Array.from(document.querySelectorAll('[data-admin]'));
  let mapBuilderPanel = null;

  const W = canvas.width;
  const H = canvas.height;
  const DRAW_MARGIN = 150;
  const TILE = 100;
  const BASE_MAP_W = 80;
  const BASE_MAP_H = 50;
  let MAP_W = BASE_MAP_W;
  let MAP_H = BASE_MAP_H;
  let WORLD_W = MAP_W * TILE;
  let WORLD_H = MAP_H * TILE;
  const STARTING_MAX_HEARTS = 3;
  const VERSION = 'V2.71';
  const ACTIVE_BOXES = 40;
  const ACTIVE_COFFEES = 18;
  const ASSET_PATH = 'assets/';
  const ASSET_VERSION = '2.71';
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
  const NOEAN_DURATION = 60000;
  const NOEAN_ANGLES = [40, 60, 80, 90, 100, 120, 140];
  const NOEAN_TARGETS = ['shoes', 'tops', 'pants'];
  const NOEAN_FRAME_BOUNDS = {"pants": [[76, 46, 266, 400], [81, 47, 272, 400], [93, 45, 296, 400], [93, 43, 275, 400], [73, 33, 268, 399], [66, 33, 285, 398], [83, 35, 299, 400], [94, 33, 272, 397], [77, 19, 237, 375], [76, 18, 259, 376], [48, 89, 324, 325], [83, 19, 286, 372]], "shoes": [[17, 168, 342, 374], [32, 118, 350, 374], [17, 90, 317, 381], [23, 187, 349, 375], [18, 119, 340, 400], [22, 90, 350, 310], [5, 95, 317, 301], [25, 47, 340, 313], [11, 0, 310, 256], [22, 40, 346, 257], [3, 38, 334, 248], [25, 47, 344, 256]], "tops": [[22, 87, 342, 388], [14, 70, 335, 368], [12, 57, 338, 400], [26, 44, 357, 400], [8, 52, 348, 398], [4, 24, 336, 385], [19, 46, 329, 386], [25, 0, 358, 340], [58, 36, 297, 311], [58, 18, 271, 317], [4, 46, 333, 339], [28, 21, 353, 334]]};
  const PALLET_JACK_DURATION = 30000;
  const PALLET_JACK_ROBOT_DISABLE = 300000;
  const TASK_COOLDOWN = 300000;
  const FIRE_COOLDOWN = 600000;
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
  const CONVEYOR_DRAW_Y_OFFSET = 0.00;
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
    inventory4: ['inventory4.png'], inventory5: ['inventory5.png'], kitchen: ['kitchen.png'], meeting: ['meeting.jpg'], printers: ['printers.png'], bathroom: ['bathroom.png'],
    pickup: ['pickup.png'], qs: ['qs.jpeg'], qsObj1: ['qs.png'], qsObj2: ['qs2.png'], cone: ['cone.png'], score: ['score.png'],
    screens: ['screens.jpg'], sign: ['sign.png'], tiles: ['tiles.jpeg'], carpet: ['carpet.jpg', 'cement.jpeg'],
    inventorybg: ['inventory.jpg', 'inventorycheck.jpg', 'meeting.jpg'],
    table: ['table.png'], table2: ['table2.png'], table3: ['table3.png'], zalandologo: ['zalandologo.png'],
    smallbox: ['smallbox.png'], smallbox2: ['smallbox2.png'], smallbox3: ['smallbox3.png'],
    shoe: ['shoe.png'], shoe1: ['shoe1.png'], shoe2: ['shoe2.png'], shoe3: ['shoe3.png'],
    title: ['title.png'], truck: ['truck.png'], walksprite: ['walksprite.png'],
    officeBase: ['baseoffice.jpg'], officeFrame: ['officeframe.webp'], officeMenu: ['pcmenu.jpg'],
    palletjack: ['palletjack.png'], clothesDamaged: ['clothesdamaged.png'], slbox: ['slbox.png'],
    qsBg: ['qs2.jpg', 'qs2.png'], fireExtinguisher: ['fire.png'], fireAnim: ['fire.webp'],
    elevator: ['elevator.png'], conveyor: ['conveyor.png'], conveyorEnd: ['conveyor2.png'], conveyorBox: ['box.png'],
    errorScreen: ['error.jpg'], scoutIcon: ['scoticon.png'],
    noEanWelcome: ['welcome3.jpg'], noEanBg: ['conveyor.jpg', 'conveyor.png'],
    scanner: ['scanner.png'], scannerCorrect: ['scanner2.png'], scannerWrong: ['scanner3.png'],
    noEanShoes: ['shoes.webp'], noEanTops: ['tops.webp'], noEanPants: ['pants.webp'],
    minimap: ['minimap.webp'],
    bossIntro: ['it2.jpg'], bossBg: ['bossbg.jpg'], bossBgWin: ['bossbg1.jpg'], bossIvan: ['boss1.webp'], fireball: ['fireball.webp'], bossCar: ['car.webp'], bossCarWin: ['car.png']
  };
  const optionalAssets = new Set(['cone', 'qsObj1', 'qsObj2', 'table', 'table2', 'table3', 'zalandologo', 'smallbox', 'smallbox2', 'smallbox3', 'shoe', 'shoe1', 'shoe2', 'shoe3', 'qsBg']);
  const musicFiles = {
    startup: 'startup.mp3', gameplay: 'gameplay.mp3', gameplay1: 'gameplay1.mp3', gameplay2: 'gameplay2.mp3', gameplay3: 'gameplay3.mp3',
    inventory: 'inventory.mp3', gameover: 'gameover.mp3', winner: 'winner.mp3', kitchen: 'kitchen.mp3',
    welcome: 'welcome.mp3', factory: 'factory.mp3', evilrobot: 'evilrobot.mp3', boss: 'boss.mp3', success: 'success.mp3'
  };
  const gameplayPlaylist = ['gameplay', 'gameplay1', 'gameplay2', 'gameplay3'];

  // Opening story sequence and its soundtrack mapping.
  const introSlides = [
    { images: ['wecome0.jpg'], music: 'welcome', text: 'Welcome to Zalando Scout! I know you are in the Ops team, but we need your help.' },
    { images: ['robot.jpg'], music: 'welcome', text: 'Zalando has invested in automation systems in our warehouses to help make getting customers orders more efficient.' },
    { images: ['welcome2.jpg'], music: 'factory', text: 'Everything has been going well for the last few months, and productivity is up!' },
    { images: ['itguy.jpg'], music: 'evilrobot', text: 'But one day Crazy Ivan from IT decided to enhance the robots with his own special AI algorithm, and something has gone wrong!' },
    { images: ['warehouse.jpg'], music: 'factory', topText: 'We need to send you to the warehouse to investigate and help with the tasks which are not getting done.', bottomText: 'You need to help complete ALM tickets, SL tickets and the tasks in your Email and Workday.' },
    { images: ['danger.jpg'], music: 'evilrobot', text: 'Beware of the evil automated robots. They do not want you taking their jobs.' },
    { images: ['inventorycheck.jpg'], music: 'inventory', text: 'You will also need to help complete inventory checks.' },
    { images: ['qs2.jpg'], music: 'kitchen', text: 'And help out with Quarantine Storage.' },
    { images: ['exit.jpg'], music: 'winner', text: 'Complete the required tasks and make your way to the exit, so we can send you to the next warehouse!' },
    { images: ['background1.jpg'], music: 'gameplay', text: 'Your shift begins now!' }
  ];
  const INTRO_TYPE_INTERVAL = 19;
  let introToken = 0;
  let introTypeTimers = [];
  let pendingShiftStart = null;
  const images = {};
  const assetStatus = { loaded: [], fallback: [], missing: [], optionalMissing: [], timedOut: [] };
  window.SOP_ASSET_STATUS = assetStatus;
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
    mapBuilder: null,
    lastPuzzleIndex: { alm: -1, sl: -1, email: -1, workday: -1 },
    playerName: localStorage.getItem(NAME_KEY) || '',
    selectedProfileId: localStorage.getItem(ACTIVE_PROFILE_KEY) || '',
    shoeCycleIndex: 0,
    level: 1,
    score: 0,
    bestScore: Number(localStorage.getItem(BEST_KEY) || 0),
    health: 3,
    maxHearts: STARTING_MAX_HEARTS,
    boss: null,
    coffees: 0,
    muted: localStorage.getItem(MUTE_KEY) === '1',
    volume: clamp(Number(localStorage.getItem(VOLUME_KEY) || 72) / 100, 0, 1),
    previousVolume: clamp(Number(localStorage.getItem('zalando-scout-prev-volume') || localStorage.getItem(VOLUME_KEY) || 72) / 100, .05, 1),
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
    noEanBriefUntil: 0,
    noEanPuzzle: null,
    noEanCooldownUntil: 0,
    taskCooldowns: {},
    noEanTargetHistory: [],
    debugOverlay: false,
    fire: null,
    nextFireAt: 0,
    tokenFlashUntil: 0,
    exitWarnUntil: 0,
    stats: freshStats()
  };

  function freshStats() {
    return { boxesOpened: 0, smallBoxesOpened: 0, shoesCollected: 0, coffeesCollected: 0, returnsProcessed: 0, trucksCompleted: 0, heartsFound: 0, warehousesCleared: 0, inventoryMatches: 0, offlineStock: 0, customerOrders: 0, sharesFound: 0, lunchBreaks: 0, mixedStock: 0, mouldyClothes: 0, noEanTasks: 0, noEanScans: 0, noEanWrong: 0, noEanMissed: 0, opsFinds: 0, inventoryChecks: 0, quarantineSorts: 0, coffeeSprints: 0, palletJackRides: 0, firesExtinguished: 0, firePoints: 0, jumps: 0, robotHits: 0, forkliftHits: 0, almTasksCompleted: 0, slTasksCompleted: 0, emailTasksCompleted: 0, workdayTasksCompleted: 0, sopTokensFound: 0, sopTokensUsed: 0, hintsBought: 0, taskFailures: 0, bossesDefeated: 0, bossHits: 0, bossShoeHits: 0, bossRams: 0 };
  }
  function freshTasks() { return { alm: 0, sl: 0, email: 0, workday: 0, tokens: 0, opsExit: false, completed: { alm: false, sl: false, email: false, workday: false } }; }
  function taskJobsReady(type) { return Math.floor((game.tasks[type] || 0) / 5); }
  function anyTaskReady() { return TASK_TYPES.some(type => taskJobsReady(type) > 0); }
  function completedTaskCount() { return TASK_TYPES.filter(type => game.tasks.completed[type]).length; }
  function requiredTaskCountForLevel(level = game.level) { return level <= 1 ? 2 : (level === 2 ? 3 : TASK_TYPES.length); }
  function requiredTasksComplete() { return !!(game.tasks && game.tasks.opsExit) || completedTaskCount() >= requiredTaskCountForLevel(); }
  function completionChecklist() { return `TASKS ${completedTaskCount()}/${requiredTaskCountForLevel()} REQUIRED   ` + TASK_TYPES.map(type => `${TASK_LABELS[type]} ${game.tasks.completed[type] ? '✓' : '✗'}`).join('   '); }
  function taskCooldownRemaining(type, now = performance.now()) { return Math.max(0, Math.ceil(((game.taskCooldowns && game.taskCooldowns[type]) || 0) - now)); }
  function taskAvailable(type, now = performance.now()) { return taskJobsReady(type) > 0 && taskCooldownRemaining(type, now) <= 0; }
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
      if (requiredTasksComplete()) addMessage('REQUIRED TASKS COMPLETE! FIND THE EXIT AND LEAVE THIS WAREHOUSE.', '#71dd8d', 3800);
    } else game.stats.taskFailures++;
    if (game.taskCooldowns && type) game.taskCooldowns[type] = performance.now() + TASK_COOLDOWN;
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
      } else if (game.mode === 'inventoryBriefing' || game.mode === 'inventoryPuzzle' || game.mode === 'qsPuzzle' || game.mode === 'noEanBriefing' || game.mode === 'noEanPuzzle') this.play('inventory', true);
      else if (game.mode === 'bossFight') this.play('boss', true);
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
  const activeOneShots = [];
  function stopOneShots() {
    while (activeOneShots.length) {
      const audio = activeOneShots.pop();
      try { audio.pause(); audio.currentTime = 0; } catch (err) {}
    }
  }
  function playOneShot(file, volume = .55) {
    if (game.muted || game.volume <= 0 || !file) return;
    try {
      const audio = new Audio(ASSET_PATH + file);
      audio.volume = volume * game.volume;
      activeOneShots.push(audio);
      audio.onended = () => {
        const index = activeOneShots.indexOf(audio);
        if (index >= 0) activeOneShots.splice(index, 1);
      };
      audio.play().catch(() => {});
    } catch (err) {}
  }

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

  function makeFallbackImage(key) {
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = 96;
    fallbackCanvas.height = 96;
    const fctx = fallbackCanvas.getContext('2d');
    const hash = Array.from(String(key)).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    fctx.fillStyle = `hsl(${hash % 360}, 38%, 32%)`;
    fctx.fillRect(0, 0, 96, 96);
    fctx.fillStyle = 'rgba(255,255,255,.14)';
    for (let y = 0; y < 96; y += 16) for (let x = 0; x < 96; x += 16) if ((x + y) % 32 === 0) fctx.fillRect(x, y, 16, 16);
    fctx.strokeStyle = 'rgba(255,255,255,.55)';
    fctx.lineWidth = 3;
    fctx.strokeRect(3, 3, 90, 90);
    fctx.fillStyle = '#fff4df';
    fctx.font = 'bold 11px sans-serif';
    fctx.textAlign = 'center';
    fctx.fillText(String(key).slice(0, 11), 48, 52);
    const img = new Image();
    img.src = fallbackCanvas.toDataURL('image/png');
    return img;
  }
  async function loadAssets() {
    const entries = Object.entries(assetSources);
    let loaded = 0;
    const updateProgress = () => {
      if (loading) loading.textContent = `Loading warehouse assets... ${loaded}/${entries.length}`;
    };
    updateProgress();

    // GitHub Pages can be much slower than the HDD, especially when the browser asks for 100+ images at once.
    // Keep the request count low so real assets do not hit our own timeout and get replaced by placeholders.
    const concurrency = Math.min(8, entries.length);
    let cursor = 0;
    const worker = async () => {
      while (cursor < entries.length) {
        const [key, files] = entries[cursor++];
        await loadImageWithFallback(key, files).finally(() => {
          loaded++;
          updateProgress();
        });
      }
    };
    await Promise.all(Array.from({ length: concurrency }, worker));

    patterns = {
      cement: images.cement ? ctx.createPattern(images.cement, 'repeat') : null,
      qs: images.qs ? ctx.createPattern(images.qs, 'repeat') : null,
      tiles: images.tiles ? ctx.createPattern(images.tiles, 'repeat') : null,
      carpet: images.carpet ? ctx.createPattern(images.carpet, 'repeat') : null
    };
    loading.classList.add('hidden');
    refreshSavedButton();
    updateMuteButton();
    updateDisplayModeButton();
    console.table(assetStatus);
    requestAnimationFrame(loop);
  }
  function loadImageWithFallback(key, files) {
    const candidates = Array.isArray(files) ? files : [files];
    const maxMsPerCandidate = 22000;
    const maxAttempts = 2;
    return new Promise(resolve => {
      const tryFile = (index, attempt = 1) => {
        if (index >= candidates.length) {
          if (optionalAssets.has(key)) {
            assetStatus.optionalMissing.push(key);
            images[key] = null;
            resolve();
            return;
          }
          console.warn(`[assets] fallback used for ${key}:`, candidates);
          assetStatus.fallback.push(key);
          images[key] = makeFallbackImage(key);
          resolve();
          return;
        }
        const img = new Image();
        let finished = false;
        const file = candidates[index];
        const finish = ok => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          img.onload = null;
          img.onerror = null;
          if (ok) {
            assetStatus.loaded.push(key);
            images[key] = img;
            resolve();
          } else if (attempt < maxAttempts) {
            tryFile(index, attempt + 1);
          } else {
            assetStatus.missing.push(`${key}:${file}`);
            tryFile(index + 1, 1);
          }
        };
        const timer = setTimeout(() => {
          console.warn(`[assets] slow/timeout loading ${ASSET_PATH + file} — retrying before fallback`);
          assetStatus.timedOut.push(`${key}:${file}:attempt${attempt}`);
          finish(false);
        }, maxMsPerCandidate);
        img.onload = () => finish(true);
        img.onerror = () => finish(false);
        img.decoding = 'async';
        const retrySuffix = attempt > 1 ? `&retry=${attempt}` : '';
        img.src = ASSET_PATH + file + `?v=${ASSET_VERSION}${retrySuffix}`;
      };
      tryFile(0, 1);
    });
  }

  function configureMapSize(level) {
    // V2.37 locked map rule: 100px tiles, standard warehouse 80 x 50.
    MAP_W = BASE_MAP_W;
    MAP_H = BASE_MAP_H;
    WORLD_W = MAP_W * TILE;
    WORLD_H = MAP_H * TILE;
  }
  function activeBoxCount() { return game.level >= 5 ? 170 : 120; }
  function activeCoffeeCount() { return game.level >= 5 ? 70 : 48; }
  function makeFloorGrid() { return Array.from({ length: MAP_H }, () => Array(MAP_W).fill(0)); }
  function rectTiles(rect) {
    const tiles = [];
    for (let y = rect.top; y < rect.top + rect.height; y++) for (let x = rect.left; x < rect.left + rect.width; x++) tiles.push({ x, y });
    return tiles;
  }
  function zone(left, top, width, height, name, arrivalX = Math.floor(width / 2), arrivalY = Math.floor(height / 2)) {
    return { left, top, width, height, x: left + arrivalX, y: top + arrivalY, name, tiles: rectTiles({ left, top, width, height }) };
  }
  function templatePathRects() {
    // V2.69: use Chris' saved map as the generation style reference:
    // fewer broad deliberate corridors instead of a cluttered grid of yellow paths.
    return [
      { left: 1, top: 3, width: 78, height: 3 },
      { left: 1, top: 45, width: 78, height: 3 },
      { left: 74, top: 3, width: 3, height: 45 },
      { left: 28, top: 2, width: 4, height: 46 }
    ];
  }
  function templateAreaSlots() {
    // V2.69: approximate the uploaded custom_map_layout 80×50 pod placement.
    return [
      { id: 'topMiddle', left: 33, top: 6, width: 14, height: 8 },
      { id: 'topRight', left: 60, top: 7, width: 14, height: 8 },
      { id: 'middleLeft', left: 3, top: 21, width: 14, height: 8 },
      { id: 'middleRight', left: 60, top: 21, width: 14, height: 8 },
      { id: 'bottomLeft', left: 3, top: 37, width: 14, height: 8 },
      { id: 'bottomMiddle', left: 33, top: 37, width: 14, height: 8 },
      { id: 'bottomRight', left: 60, top: 37, width: 14, height: 8 }
    ];
  }
  function rectTouchesTemplatePath(rect, pad = 0) {
    const test = paddedRect(rect, pad);
    return templatePathRects().some(path => overlaps(test, path));
  }
  function tileInsideTemplatePath(t) {
    return templatePathRects().some(path => t.x >= path.left && t.x < path.left + path.width && t.y >= path.top && t.y < path.top + path.height);
  }
  function randomTemplatePathTile(minDistance = 0) {
    const candidates = [];
    templatePathRects().forEach(path => {
      for (let y = path.top; y < path.top + path.height; y++) {
        for (let x = path.left; x < path.left + path.width; x++) {
          if (isFloorTile(x, y) && !tileInAnyZone({ x, y }, 0) && !tileInsideVisibleScenery({ x, y })) candidates.push({ x, y });
        }
      }
    });
    for (const t of shuffle(candidates)) {
      const p = tileCenter(t);
      if ((!game.player || dist(p, game.player) >= minDistance) && !occupiedAt(p)) return t;
    }
    return null;
  }
  function paddedRect(rect, pad = 0) {
    return { left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 };
  }
  function overlaps(a, b) {
    return a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
  }
  function plannedConveyorRects() {
    if (!game.zones) return [];
    const rects = [];
    const pushRun = (left, top, count, options = {}) => {
      const width = 3.05, gap = 0.08;
      const totalW = count * width + Math.max(0, count - 1) * gap;
      const endW = images.conveyorEnd && options.noEndCap !== true ? width : 0;
      const visualLeft = left - endW;
      const visualRight = left + totalW + endW;
      rects.push({ left: visualLeft - .25, top: top - .55, width: visualRight - visualLeft + .5, height: 2.35 });
    };
    const q = game.zones.quarantine;
    const inv = game.zones.inventory;
    const d = game.zones.dock;
    if (d) {
      pushRun(d.left + .35, d.top + .15, 4);
      pushRun(d.left + .35, d.top + d.height - 1.15, 4);
    }
    if (q) {
      pushRun(q.left + 1.05, q.top + .35, 3);
      pushRun(q.left + 1.05, q.top + q.height - 1.25, 3);
      pushRun(q.left + 4.0, q.top + 4.9, 2);
    }
    if (inv) {
      pushRun(inv.left + .75, inv.top + .35, 4);
      pushRun(inv.left + .75, inv.top + inv.height - 1.25, 4);
    }
    return rects;
  }
  function clutterImage(image) {
    return /^box\d*$/.test(image) || /^smallbox/.test(image) || image === 'conveyorBox' || image === 'cone' || image === 'palletjack';
  }

  function protectedPropRects() {
    const rects = [];
    const add = item => {
      if (!item) return;
      const base = item.collisionRect || item;
      if (base && Number.isFinite(base.left) && Number.isFinite(base.top) && Number.isFinite(base.width) && Number.isFinite(base.height)) {
        const pad = (item.image === 'printers' || item.image === 'bathroom') ? .95 : .30;
        rects.push(paddedRect(base, pad));
      }
    };
    (game.zoneProps || []).forEach(add);
    (game.conveyors || []).forEach(c => rects.push({ left: c.visualLeft ?? c.left, top: (c.top || 0) - .65, width: (c.visualRight ?? (c.left + c.width)) - (c.visualLeft ?? c.left), height: 2.45 }));
    plannedConveyorRects().forEach(r => rects.push(r));
    const d = game.zones && game.zones.dock;
    if (d) rects.push(dockDrivewayRect());
    return rects;
  }
  function rectHitsProtectedProp(rect) { return protectedPropRects().some(protectedRect => overlaps(rect, protectedRect)); }
  function withinMap(rect) {
    return rect.left >= 1 && rect.top >= 1 && rect.left + rect.width <= MAP_W - 1 && rect.top + rect.height <= MAP_H - 1;
  }
  function isZoneBlocked(rect, pad = 1) {
    const zones = [game.zones.quarantine, game.zones.dock, game.zones.inventory, game.zones.exit, game.zones.elevator, ...game.zones.kitchens].filter(Boolean);
    return rectTouchesTemplatePath(rect, .05) || zones.some(z => overlaps(rect, paddedRect(z, pad))) || rectHitsProtectedProp(rect);
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
    const candidate = { ...rect, image, flipX, collisionRect: null, decorative: true, collectible: isShoeImage(image), interactive: /^smallbox(?!3$)/.test(image), pushable: image === 'smallbox3', bob: rand(0, Math.PI * 2) };
    const centre = decorativeCenter(candidate);
    const tile = worldToTile(centre.x, centre.y);
    if (!isFloorTile(tile.x, tile.y) || tileInAnyZone(tile, 0) || tileInsideVisibleScenery(tile) || tileInsideTemplatePath(tile) || rectHitsProtectedProp(rect)) return false;
    if (game.decorativeProps.some(prop => dist(centre, decorativeCenter(prop)) < TILE * .82)) return false;
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
    const maxDecor = Math.min(game.level >= 5 ? 480 : 360, Math.max(150, Math.round(shelfProps.length * .72)));
    let placed = 0;

    // Denser decorative clutter: keep it attached to shelf fronts and gaps, not stranded in open aisles.
    for (const shelf of shuffle(shelfProps)) {
      if (placed >= maxDecor) break;
      if (Math.random() < .02) continue;
      const itemsHere = Math.random() < .48 ? 3 : (Math.random() < .82 ? 2 : 1);
      for (let i = 0; i < itemsHere && placed < maxDecor; i++) {
        let image;
        if (shoePool.length && (!choices.length || Math.random() < .86)) image = nextShoeImage();
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
  function rectNearExistingCone(rect, radius = 1.65) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (game.zoneProps || []).some(prop => {
      if (prop.image !== 'cone') return false;
      const px = prop.left + prop.width / 2;
      const py = prop.top + prop.height / 2;
      return Math.hypot(cx - px, cy - py) < radius;
    });
  }

  function scatterConeHazards() {
    if (!images.cone) return;
    const groupsTarget = game.level >= 5 ? 24 : 14;
    let groupsPlaced = 0;
    let attempts = 0;
    while (groupsPlaced < groupsTarget && attempts < groupsTarget * 70) {
      attempts++;
      const count = randInt(4, 7);
      const horizontal = Math.random() < .55;
      const start = { x: randInt(3, MAP_W - (horizontal ? count + 3 : 4)), y: randInt(4, MAP_H - (horizontal ? 4 : count + 3)) };
      const cells = [];
      let valid = true;
      for (let i = 0; i < count; i++) {
        const t = { x: start.x + (horizontal ? i : 0), y: start.y + (horizontal ? 0 : i) };
        const rect = { left: t.x, top: t.y, width: .82, height: .82 };
        if (!isFloorTile(t.x, t.y) || tileInAnyZone(t, 2) || tileInsideVisibleScenery(t) || rectHitsProtectedProp(rect) || game.zoneProps.some(prop => overlaps(rect, prop))) {
          valid = false;
          break;
        }
        // Keep cone sets as clear lines, not stacked blocks.
        if (rectNearExistingCone(rect, 1.55)) { valid = false; break; }
        cells.push(rect);
      }
      if (!valid) continue;
      cells.forEach((rect, i) => addZoneProp('cone', rect, { block: false, flipX: i % 2 === 0 }));
      groupsPlaced++;
    }
  }

  function setZones() {
    const slots = shuffle(templateAreaSlots());
    const take = () => slots.shift();

    const invSlot = take();
    const qsSlot = take();
    const exitSlot = take();
    const kitchenSlot = take();
    const kitchen2Slot = take();

    game.zones = {
      dock: zone(1, 6, 14, 8, 'DOCK', 7, 6),
      elevator: zone(33, 21, 14, 8, 'ELEVATOR', 7, 5),
      inventory: zone(invSlot.left, invSlot.top, invSlot.width, invSlot.height, 'INVENTORY CHECK', 7, 6),
      quarantine: zone(qsSlot.left, qsSlot.top, qsSlot.width, qsSlot.height, 'QUARANTINE', 7, 6),
      exit: zone(exitSlot.left, exitSlot.top, Math.min(10, exitSlot.width), Math.min(7, exitSlot.height), 'EXIT', 7, 5),
      kitchens: [
        zone(kitchenSlot.left + 1, kitchenSlot.top + 1, 10, 6, 'KITCHEN', 7, 4),
        zone(kitchen2Slot.left + 1, kitchen2Slot.top + 1, 10, 6, 'KITCHEN', 7, 4)
      ],
      areaSlots: slots
    };
  }
  function installSpecialAreaProps() {
    const q = game.zones.quarantine;

    // Quarantine: mouldy/blocked stock mostly around the sides and bottom, with smaller props inside.
    if (images.qsObj1 || images.qsObj2) {
      addZoneProp('qsObj1', { left: q.left + .25, top: q.top + 1.0, width: 3.8, height: 3.0 });
      addZoneProp('qsObj2', { left: q.left + q.width - 4.05, top: q.top + 1.0, width: 3.8, height: 3.0 });
      addZoneProp('qsObj2', { left: q.left + .55, top: q.top + q.height - 3.0, width: 4.6, height: 2.35 });
      addZoneProp('qsObj1', { left: q.left + q.width - 5.15, top: q.top + q.height - 3.0, width: 4.6, height: 2.35 });
    } else {
      addZoneProp('box1', { left: q.left + .2, top: q.top + 1, width: 3.8, height: 3 });
      addZoneProp('box2', { left: q.left + q.width - 4, top: q.top + 1, width: 3.8, height: 3 });
      addZoneProp('box3', { left: q.left + 1, top: q.top + q.height - 2.8, width: 3, height: 2 });
      addZoneProp('box3', { left: q.left + q.width - 4, top: q.top + q.height - 2.8, width: 3, height: 2 });
    }
    ['smallbox', 'smallbox2', 'smallbox3'].forEach((img, i) => {
      if (images[img]) addZoneProp(img, { left: q.left + 4.5 + i * 1.2, top: q.top + 4.0 + (i % 2) * .9, width: .9, height: .75 }, { block: false, flipX: i % 2 === 1 });
    });

    const inv = game.zones.inventory;
    // Inventory: scale the small assets up so they match the rest of the warehouse.
    addZoneProp('inventory1', { left: inv.left + .45, top: inv.top + .55, width: 6.0, height: 7.0 }, { collisionInset: .16 });
    addZoneProp('inventory2', { left: inv.left + 6.8, top: inv.top + .75, width: 3.1, height: 2.2 }, { collisionInset: .16 });
    addZoneProp('inventory3', { left: inv.left + 10.1, top: inv.top + .75, width: 3.1, height: 2.2 }, { collisionInset: .16 });
    addZoneProp('inventory4', { left: inv.left + 10.1, top: inv.top + 3.15, width: 3.1, height: 3.5 }, { collisionInset: .16 });
    if (images.table) addZoneProp('table', { left: inv.left + 6.9, top: inv.top + 3.65, width: 5.4, height: 3.4 }, { collisionInset: .18 });
    else addZoneProp('inventory5', { left: inv.left + 6.9, top: inv.top + 3.65, width: 5.4, height: 3.4 }, { collisionInset: .18 });
    if (images.table2) addZoneProp('table2', { left: inv.left + 1.0, top: inv.top + 5.55, width: 5.2, height: 2.1 }, { collisionInset: .18 });
    // table3.png intentionally no longer used.

    // Kitchen artwork is 25% larger and centred inside the kitchen zone.
    game.zones.kitchens.forEach(k => {
      const kw = 7.5, kh = 3.75;
      addZoneProp('kitchen', {
        left: k.left + (k.width - kw) / 2,
        top: k.top + (k.height - kh) / 2,
        width: kw,
        height: kh
      }, {
        collisionRect: { left: k.left + (k.width - kw) / 2, top: k.top + (k.height - kh) / 2, width: kw, height: kh },
        collisionInset: 0.20,
        flipX: false
      });
    });

    const d = game.zones.dock;

    // Traffic cones guide the top and bottom of the driveway, with deliberate gaps for walking through.
    if (images.cone) {
      const drivewayTop = d.top + 4.15;
      const drivewayBottom = d.top + 7.15;
      const gapXs = [d.left + 3, d.left + 7, d.left + 11];
      for (let x = d.left - 1; x <= d.left + d.width + 1; x += 1.55) {
        const nearGap = gapXs.some(g => Math.abs(x - g) < .85);
        if (!nearGap) {
          addZoneProp('cone', { left: x, top: drivewayTop, width: .85, height: .85 }, { block: false, flipX: Math.floor(x) % 2 === 0 });
          addZoneProp('cone', { left: x, top: drivewayBottom, width: .85, height: .85 }, { block: false, flipX: Math.floor(x) % 2 === 1 });
        }
      }
    }
  }

  function addPushableSmallBox(left, top) {
    if (!images.smallbox3) return false;
    return addDecorativeProp('smallbox3', { left, top, width: .9, height: .75 }, false);
  }
  function installTaskAreaEdgeProps() {
    const areaZones = [game.zones.inventory, game.zones.quarantine, game.zones.exit, ...game.zones.kitchens].filter(Boolean);
    const hardImages = ['box5', 'box6', 'box7', 'box3'].filter(key => images[key]);
    if (!hardImages.length && !images.smallbox3) return;
    areaZones.forEach((z, zi) => {
      const openLeft = Math.round(z.top + z.height / 2);
      const openRight = openLeft + (zi % 2 ? 1 : -1);
      for (let x = Math.floor(z.left); x < Math.ceil(z.left + z.width); x += 2) {
        const topGap = x >= z.left + z.width / 2 - 1 && x <= z.left + z.width / 2 + 1;
        if (!topGap && hardImages.length) addZoneProp(hardImages[(x + zi) % hardImages.length], { left: x + .1, top: z.top - 1.05, width: 2.6, height: 1.65 }, { collisionInset: .08 });
        if (!topGap && hardImages.length) addZoneProp(hardImages[(x + zi + 1) % hardImages.length], { left: x + .1, top: z.top + z.height - .55, width: 2.6, height: 1.65 }, { collisionInset: .08 });
      }
      for (let y = Math.floor(z.top + 1); y < Math.ceil(z.top + z.height - 1); y += 2) {
        if (Math.abs(y - openLeft) <= 1) { addPushableSmallBox(z.left - .95, y + .25); continue; }
        if (hardImages.length) addZoneProp(hardImages[(y + zi) % hardImages.length], { left: z.left - 1.15, top: y, width: 1.65, height: 1.55 }, { collisionInset: .08 });
        if (Math.abs(y - openRight) <= 1) { addPushableSmallBox(z.left + z.width + .05, y + .25); continue; }
        if (hardImages.length) addZoneProp(hardImages[(y + zi + 2) % hardImages.length], { left: z.left + z.width - .55, top: y, width: 1.65, height: 1.55 }, { collisionInset: .08 });
      }
    });
  }
  function installFillerAreaProps() {
    const fillerImages = ['printers', 'bathroom'].filter(key => images[key]);
    const shelfImages = ['box1', 'box2', 'box3', 'box4', 'box5', 'box6', 'box7'].filter(key => images[key]);
    const slots = (game.zones.areaSlots || []).slice();
    slots.forEach((slot, i) => {
      const z = zone(slot.left + .8, slot.top + .8, Math.max(8, slot.width - 1.6), Math.max(5, slot.height - 1.6), i % 2 ? 'BATHROOM / FIRST AID' : 'PRINT ROOM', 5, 3);
      const img = fillerImages.length ? fillerImages[i % fillerImages.length] : null;

      if (img) {
        const scale = img === 'printers' ? 0.50 : 0.60;
        const maxW = z.width - 2.6;
        const maxH = z.height - 2.6;
        const aspect = images[img] ? images[img].height / images[img].width : .45;
        let roomW = Math.max(3.0, maxW * scale);
        let roomH = roomW * aspect;
        if (roomH > maxH * scale) {
          roomH = Math.max(1.8, maxH * scale);
          roomW = roomH / Math.max(.2, aspect);
        }
        addZoneProp(img, {
          left: z.left + (z.width - roomW) / 2,
          top: z.top + (z.height - roomH) / 2,
          width: roomW,
          height: roomH
        }, { collisionInset: .22, floorBand: .20, sideInset: .08 });
      }

      if (!shelfImages.length) return;
      for (let x = z.left - .2; x < z.left + z.width - 1.6; x += 2.25) {
        addZoneProp(shelfImages[(Math.floor(x) + i) % shelfImages.length], { left: x, top: z.top - .95, width: 2.15, height: 1.48 }, { collisionInset: .08 });
        addZoneProp(shelfImages[(Math.floor(x) + i + 1) % shelfImages.length], { left: x, top: z.top + z.height - .50, width: 2.15, height: 1.48 }, { collisionInset: .08 });
      }
      const openY = z.top + z.height / 2;
      for (let y = z.top + .55; y < z.top + z.height - .75; y += 1.55) {
        if (Math.abs(y - openY) < 1.0) { if (images.smallbox3) { addPushableSmallBox(z.left - .95, y); addPushableSmallBox(z.left + z.width + .05, y); } continue; }
        addZoneProp(shelfImages[(Math.floor(y) + i + 2) % shelfImages.length], { left: z.left - 1.05, top: y, width: 1.55, height: 1.34 }, { collisionInset: .08 });
        addZoneProp(shelfImages[(Math.floor(y) + i + 3) % shelfImages.length], { left: z.left + z.width - .50, top: y, width: 1.55, height: 1.34 }, { collisionInset: .08 });
      }
    });
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
      const leftRect = { left: -.77, top: y, width: 2.08, height: 2.75 };
      const road = game.zones && game.zones.dock ? dockDrivewayRect() : null;
      if (!road || !overlaps(leftRect, road)) addBorderProp(leftImage, leftRect, sideIndex % 3 === 0);
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

  function canPlaceObstacleRect(rect, pad = .35) {
    return withinMap(rect) && !isZoneBlocked(rect, pad) && !game.obstacles.some(o => overlaps(rect, o));
  }

  function placeAlignedShelfRun(left, top, count, options = {}) {
    const rackW = options.rackW ?? 2.50;
    const rackH = options.rackH ?? 2.20;
    const rects = [];
    for (let i = 0; i < count; i++) rects.push({ left: left + i * rackW, top, width: rackW, height: rackH });
    if (!rects.every(rect => canPlaceObstacleRect(rect))) return false;
    rects.forEach((rect, i) => {
      const image = options.image || (i % 2 === 0 ? 'box5' : 'box6');
      occupyObstacle(rect, image, { floorBand: .24, sideInset: .08, flipX: false });
    });
    return true;
  }

  function templateMazeRegions() {
    return [
      { left: 4, top: 4, width: 20, height: 11 },
      { left: 28, top: 4, width: 24, height: 11 },
      { left: 56, top: 4, width: 20, height: 11 },
      { left: 4, top: 19, width: 20, height: 12 },
      { left: 28, top: 19, width: 24, height: 12 },
      { left: 56, top: 19, width: 20, height: 12 },
      { left: 4, top: 35, width: 20, height: 11 },
      { left: 28, top: 35, width: 24, height: 11 },
      { left: 56, top: 35, width: 20, height: 11 }
    ];
  }

  function installDenseShelfWalls() {
    // V2.37 locked layout: the walk-lane skeleton stays clear, and each grey block gets aligned maze shelf runs.
    const rackW = 2.50;
    const rackH = 2.20;
    const regions = templateMazeRegions();

    regions.forEach((region, regionIndex) => {
      const yRows = [];
      for (let y = region.top + 1.15; y < region.top + region.height - rackH - .55; y += 3.9) yRows.push(y);
      yRows.forEach((top, rowIndex) => {
        let x = region.left + 1.0 + ((rowIndex + regionIndex) % 2 ? 1.3 : 0);
        let run = 0;
        while (x < region.left + region.width - rackW * 3.2) {
          const runLength = 3 + ((regionIndex + rowIndex + run) % 3); // 3-5 shelves.
          const image = (regionIndex + rowIndex + run) % 2 === 0 ? 'box5' : 'box6';
          placeAlignedShelfRun(x, top, runLength, { rackW, rackH, image });
          x += runLength * rackW + 2.6;
          run++;
        }
      });
    });
  }

  function viewportHasShelfCoverage(left, top, width, height) {
    const view = { left, top, width, height };
    return game.obstacles.filter(o => /^box[2-7]$/.test(o.image) && overlaps(view, o)).length >= 6;
  }

  function addConveyorRun(left, top, count, options = {}) {
    if (!images.conveyor || count <= 0) return false;
    const width = 3.05, height = 1.04, gap = 0.08;
    const totalW = count * width + Math.max(0, count - 1) * gap;
    const hasEnd = !!images.conveyorEnd && options.noEndCap !== true;
    const endW = hasEnd ? width : 0;
    const endH = hasEnd ? width * (437 / 940) : height;
    let feederSide = options.feederSide || (Math.random() < .5 ? 'left' : 'right');
    if (hasEnd && feederSide === 'left' && left - endW < 0) feederSide = 'right';
    if (hasEnd && feederSide === 'right' && left + totalW + endW > MAP_W) feederSide = 'left';

    const visualLeft = hasEnd && feederSide === 'left' ? left - endW : left;
    const visualRight = hasEnd && feederSide === 'right' ? left + totalW + endW : left + totalW;
    const rect = { left: visualLeft, top, width: visualRight - visualLeft, height: Math.max(height, endH) };

    if (!withinMap(rect) || (!options.allowZoneOverlap && isZoneBlocked(rect, .25)) || (!options.allowPropOverlap && game.obstacles.some(o => overlaps(rect, o))) || (!options.allowPropOverlap && game.zoneProps.some(o => overlaps(rect, o))) || (!options.allowElevatorOverlap && game.zones.elevator && overlaps(rect, paddedRect(game.zones.elevator, 1)))) return false;
    markBlocked({ left: visualLeft, top: top + .35, width: visualRight - visualLeft, height: .52 });
    addCollider({ left: visualLeft, top: top + .35, width: visualRight - visualLeft, height: .52 }, 'conveyor', .02);

    const conveyor = { left, top, width: totalW, height, pieces: count, moving: [], feederSide, endW, endH, visualLeft, visualRight };
    const itemCount = clamp(Math.floor(count * 1.35), 2, 7);
    for (let i = 0; i < itemCount; i++) {
      const collectible = shoeImageKeys().length && Math.random() < .55;
      const image = collectible ? (nextShoeImage() || 'shoe') : 'conveyorBox';
      const size = collectible ? rand(.62, .88) : rand(.42, .78);
      // Items travel on the visible belt only and stop at the machine entrance.
      const minX = (left + .45) * TILE;
      const maxX = (left + totalW - .45) * TILE;
      const item = {
        conveyor, image, collectible, size,
        minX, maxX,
        x: minX + Math.random() * Math.max(10, maxX - minX),
        y: (top + .22 + Math.random() * .06) * TILE,
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

    // Dock gets conveyor boundaries on the top and bottom of the whole dock area.
    addConveyorRun(d.left + .35, d.top + .15, 4, { allowZoneOverlap: true, allowPropOverlap: true });
    addConveyorRun(d.left + .35, d.top + d.height - 1.15, 4, { allowZoneOverlap: true, allowPropOverlap: true });

    // Enclose QS and Inventory from top/bottom so they read as work zones with side entry.
    addConveyorRun(q.left + 1.05, q.top + .35, 3, { allowZoneOverlap: true, allowPropOverlap: true, allowElevatorOverlap: false });
    addConveyorRun(q.left + 1.05, q.top + q.height - 1.25, 3, { allowZoneOverlap: true, allowPropOverlap: true, allowElevatorOverlap: false });
    addConveyorRun(q.left + 4.0, q.top + 4.9, 2, { allowZoneOverlap: true, allowPropOverlap: true, allowElevatorOverlap: false });

    addConveyorRun(inv.left + .75, inv.top + .35, 4, { allowZoneOverlap: true, allowPropOverlap: true, allowElevatorOverlap: false });
    addConveyorRun(inv.left + .75, inv.top + inv.height - 1.25, 4, { allowZoneOverlap: true, allowPropOverlap: true, allowElevatorOverlap: false });

    const target = game.level >= 5 ? 16 : 10;
    let attempts = 0;
    while (game.conveyors.length < target && attempts++ < target * 40) {
      const count = randInt(2, 4);
      const x = randInt(3, Math.max(4, MAP_W - count * 3 - 4));
      const y = randInt(5, Math.max(6, MAP_H - 6));
      addConveyorRun(x, y, count);
    }
  }

  function cleanupClutterOverConveyors() {
    const protectedRuns = (game.conveyors || []).map(c => ({
      left: (c.visualLeft ?? c.left) - .18,
      top: (c.top || 0) - .55,
      width: ((c.visualRight ?? (c.left + c.width)) - (c.visualLeft ?? c.left)) + .36,
      height: 2.20
    }));
    if (!protectedRuns.length) return;
    const hits = prop => protectedRuns.some(r => overlaps(prop.collisionRect || prop, r));
    game.obstacles = game.obstacles.filter(prop => !(clutterImage(prop.image) && hits(prop)));
    game.zoneProps = game.zoneProps.filter(prop => !(clutterImage(prop.image) && hits(prop)));
    game.decorativeProps = game.decorativeProps.filter(prop => !(clutterImage(prop.image) && hits(prop)));
    game.colliders = game.colliders.filter(c => !protectedRuns.some(r => overlaps({ left: c.left / TILE, top: c.top / TILE, width: c.width / TILE, height: c.height / TILE }, r)));
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
    const imgW = e.width * .60;
    const imgH = imgW * .50;
    const imgLeft = e.left + (e.width - imgW) / 2;
    const imgTop = e.top + (e.height - imgH) / 2;
    const px = game.player.x / TILE;
    const py = game.player.y / TILE;
    if (px < imgLeft - .5 || px > imgLeft + imgW + .5 || py < imgTop - .4 || py > imgTop + imgH + 1.2) return -1;
    const rel = clamp((px - imgLeft) / imgW, 0, .999);
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
    // V2.37: the template regions already provide the warehouse structure.
    // Do not add random emergency shelves across the corridor skeleton.
  }
  function installWalkwayConeGuides() {
    if (!images.cone) return;
    const guidePoints = [];
    // Subtle one-cell guide lines only; no block clusters.
    [28, 74].forEach(x => {
      for (let y = 8; y <= 41; y += 6) guidePoints.push({ x: x - 1.0, y });
    });
    [3, 45].forEach(y => {
      for (let x = 9; x <= 69; x += 8) guidePoints.push({ x, y: y - 1.0 });
    });
    guidePoints.forEach((p, i) => {
      const rect = { left: p.x, top: p.y, width: .75, height: .75 };
      const tile = { x: Math.floor(p.x), y: Math.floor(p.y) };
      if (withinMap(rect) && !tileInAnyZone(tile, 0) && !rectHitsProtectedProp(rect) && !rectNearExistingCone(rect, 1.55)) {
        addZoneProp('cone', rect, { block: false, flipX: i % 2 === 0 });
      }
    });
  }
  function clearDockDrivewayVisualClutter() {
    if (!game.zones || !game.zones.dock) return;
    const road = dockDrivewayRect();
    const clear = prop => !overlaps(prop.collisionRect || prop, road);
    game.obstacles = game.obstacles.filter(clear);
    game.zoneProps = game.zoneProps.filter(prop => prop.image === 'cone' || clear(prop));
    game.decorativeProps = game.decorativeProps.filter(clear);
    game.colliders = game.colliders.filter(c => !overlaps({ left: c.left / TILE, top: c.top / TILE, width: c.width / TILE, height: c.height / TILE }, road));
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
    installFillerAreaProps();
    installTaskAreaEdgeProps();
    sealUnexpectedOpenPatches();
    installConveyors();
    cleanupClutterOverConveyors();
    scatterConeHazards();
    installWalkwayConeGuides();
    installWarehouseBorder();
    scatterDecorativeClutter();
    clearDockDrivewayVisualClutter();
    const d = game.zones.dock;
    addCollider({ left: d.left + d.width - 10.8, top: d.top + 1.10, width: 10.1, height: 3.75 }, 'dock-office', .20);
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
      .filter(prop => prop.collectible || prop.interactive || prop.pushable)
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
    // Prefer the guaranteed light walking lanes for pickups, so collectables do not hide in shelf blocks.
    const laneTile = randomTemplatePathTile(minDistance);
    if (laneTile) return laneTile;

    for (let attempt = 0; attempt < 160; attempt++) {
      const t = { x: randInt(1, MAP_W - 2), y: randInt(1, MAP_H - 2) };
      if (!isFloorTile(t.x, t.y)) continue;
      if (excludeZones && tileInAnyZone(t, 0)) continue;
      if (avoidScenery && (tileInsideVisibleScenery(t) || tileInsideTemplatePath(t) || rectHitsProtectedProp({ left: t.x, top: t.y, width: 1, height: 1 }))) continue;
      const p = tileCenter(t);
      if ((!game.player || dist(p, game.player) >= minDistance) && !occupiedAt(p)) return t;
    }
    const tiles = shuffle(availableFloorTiles(excludeZones));
    for (const t of tiles) {
      const p = tileCenter(t);
      if (avoidScenery && (tileInsideVisibleScenery(t) || tileInsideTemplatePath(t) || rectHitsProtectedProp({ left: t.x, top: t.y, width: 1, height: 1 }))) continue;
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
      x: (k.left + k.width - .85) * TILE,
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
    attacker.disabledUntil = now + PALLET_JACK_ROBOT_DISABLE;
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
    const targetCount = [15, 20, 30][(game.level - 1) % 3];
    const patrolTiles = shuffle(availableFloorTiles(true).filter(t => !tileInsideSafeZone(t) && !tileInsideVisibleScenery(t)));
    for (let i = 0; i < targetCount && i < patrolTiles.length; i++) {
      game.enemies.push(makeRobotAtTile(patrolTiles[i], i < 2, index++));
    }

    // Forklifts are rarer than robots and also follow the same safe-zone rules.
    game.forklifts = [];
    const forkliftCount = game.level >= 3 ? 2 : 1;
    for (let i = 0; i < forkliftCount; i++) {
      const ft = patrolTiles[targetCount + i] || randomFloorTile(900, true);
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
    game.noEanPuzzle = null;
    game.noEanCooldownUntil = 0;
    game.inventoryCooldownUntil = 0;
    game.qsCooldownUntil = 0;
    game.taskCooldowns = {};
    game.noEanTargetHistory = [];
    game.fire = null;
    game.nextFireAt = performance.now() + randInt(240000, FIRE_COOLDOWN);
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
    game.maxHearts = STARTING_MAX_HEARTS;
    game.health = game.maxHearts;
    game.boss = null;
    game.coffees = 0;
    game.tasks = freshTasks();
    game.stats = freshStats();
    game.messages = [];
    game.particles = [];
    game.specialMusic = null;
    game.noEanPuzzle = null;
    game.noEanCooldownUntil = 0;
    game.inventoryCooldownUntil = 0;
    game.qsCooldownUntil = 0;
    game.taskCooldowns = {};
    game.noEanTargetHistory = [];
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
    nameInput.blur();
    keys.clear();
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
    nameInput.blur();
    keys.clear();
    game.adminMode = false;
    showAdminPanel(false);
    const save = loadSavedShift();
    if (!save) { performNewShift(); return; }
    game.playerName = save.playerName || game.playerName;
    game.level = Number(save.level) || 1;
    game.score = Number(save.score) || 0;
    game.maxHearts = Math.max(STARTING_MAX_HEARTS, Number(save.maxHearts) || game.maxHearts || STARTING_MAX_HEARTS);
    game.health = clamp(Number(save.health) || game.maxHearts, 1, game.maxHearts);
    game.coffees = clamp(Number(save.coffees) || 0, 0, 2);
    game.stats = { ...freshStats(), ...(save.stats || {}) };
    game.tasks = { ...freshTasks(), ...(save.tasks || {}), completed: { ...freshTasks().completed, ...((save.tasks && save.tasks.completed) || {}) } };
    game.inventoryCooldownUntil = Number(save.inventoryCooldownUntil) || 0;
    game.qsCooldownUntil = Number(save.qsCooldownUntil) || 0;
    game.noEanCooldownUntil = Number(save.noEanCooldownUntil) || 0;
    game.fireCooldownUntil = Number(save.fireCooldownUntil) || 0;
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
    nameInput.blur();
    keys.clear();
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
    nameInput.blur();
    keys.clear();
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
  function gameplayZoomFactor() {
    return 1 + clamp(game.viewZoomStep || 0, -2, 2) * 0.15;
  }
  function updateGameplayZoomButtons() {
    const zoomIn = document.getElementById('game-zoom-in');
    const zoomOut = document.getElementById('game-zoom-out');
    if (zoomIn) zoomIn.disabled = (game.viewZoomStep || 0) >= 2;
    if (zoomOut) zoomOut.disabled = (game.viewZoomStep || 0) <= -2;
  }
  function changeGameplayZoom(delta) {
    game.viewZoomStep = clamp((game.viewZoomStep || 0) + delta, -2, 2);
    centerCamera();
    updateGameplayZoomButtons();
    if (game.mode === 'play') addMessage(`ZOOM ${game.viewZoomStep > 0 ? '+' : ''}${game.viewZoomStep}`, '#ffd054', 850);
  }

  function toggleDisplayMode() {
    game.displayMode = game.displayMode === 'mobile' ? 'desktop' : 'mobile';
    localStorage.setItem(DISPLAY_MODE_KEY, game.displayMode);
    updateDisplayModeButton();
    if (game.mode === 'play') addMessage(game.displayMode === 'mobile' ? 'MOBILE CONTROLS ON' : 'DESKTOP CONTROLS ON', '#ffd054', 1200);
  }

  function requestFullscreenMode() {
    const target = document.documentElement;
    const request = target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen;
    if (!request) {
      showProfileWarning('Fullscreen is not supported in this browser. Try Add to Home Screen for the best mobile view.');
      return;
    }
    try {
      const result = request.call(target);
      if (result && typeof result.catch === 'function') {
        result.catch(() => showProfileWarning('Fullscreen was blocked by the browser. Try tapping again, or use Add to Home Screen.'));
      }
    } catch (err) {
      showProfileWarning('Fullscreen was blocked by the browser. Try Add to Home Screen for the best mobile view.');
    }
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
    const next = clamp(Number(value) / 100, 0, 1);
    if (next > 0) game.previousVolume = next;
    game.volume = next;
    game.muted = game.volume <= 0;
    localStorage.setItem(VOLUME_KEY, String(Math.round(game.volume * 100)));
    localStorage.setItem(MUTE_KEY, game.muted ? '1' : '0');
    if (game.previousVolume) localStorage.setItem('zalando-scout-prev-volume', String(Math.round(game.previousVolume * 100)));
    music.setVolume(game.volume);
    music.setMuted(game.muted);
    updateMuteButton();
  }
  function toggleAudio() {
    if (game.muted || game.volume <= 0) {
      const previous = game.previousVolume || clamp(Number(localStorage.getItem('zalando-scout-prev-volume') || 72) / 100, .05, 1);
      setVolume(Math.round(previous * 100));
    } else {
      game.previousVolume = game.volume;
      localStorage.setItem('zalando-scout-prev-volume', String(Math.round(game.previousVolume * 100)));
      setVolume(0);
    }
    if (game.mode === 'play') addMessage(game.muted ? 'SOUND OFF' : `VOLUME ${Math.round(game.volume * 100)}%`, '#eadab8', 1000);
  }

  function continueAfterDeath() {
    game.health = game.maxHearts;
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
    const save = { playerName: game.playerName, level: game.level, score: game.score, health: game.health, maxHearts: game.maxHearts, coffees: game.coffees, tasks: game.tasks, stats: game.stats, inventoryCooldownUntil: game.inventoryCooldownUntil, qsCooldownUntil: game.qsCooldownUntil, noEanCooldownUntil: game.noEanCooldownUntil, fireCooldownUntil: game.fireCooldownUntil };
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
    if (!t || !z) return false;
    return t.x >= z.left && t.x < z.left + z.width && t.y >= z.top && t.y < z.top + z.height;
  }
  function pointInsideZone(p, z) {
    if (!p || !z) return false;
    return tileInsideZone(worldToTile(p.x, p.y), z);
  }
  function dockDrivewayRect() {
    const d = game.zones && game.zones.dock;
    if (!d) return { left: -999, top: -999, width: 0, height: 0 };
    return { left: 0, top: d.top + 4.35, width: d.left + d.width + 3.0, height: 2.95 };
  }
  function tileInsideDockDriveway(t) {
    const r = dockDrivewayRect();
    return t.x >= r.left && t.x < r.left + r.width && t.y >= r.top && t.y < r.top + r.height;
  }
  function pointInsideDockDriveway(p) {
    return tileInsideDockDriveway(worldToTile(p.x, p.y));
  }
  function isSafeZone(t) {
    if (!t) return false;
    return tileInsideZone(t, game.zones.dock) ||
      tileInsideZone(t, game.zones.elevator) ||
      tileInsideDockDriveway(t) ||
      tileInsideTemplatePath(t) ||
      tileInsideZone(t, game.zones.inventory) ||
      tileInsideZone(t, game.zones.quarantine) ||
      game.zones.kitchens.some(k => tileInsideZone(t, k));
  }
  function tileInsideSafeZone(t) { return isSafeZone(t); }
  function playerInsideSafeZone() {
    return !!game.player && (
      pointInsideZone(game.player, game.zones.dock) ||
      pointInsideZone(game.player, game.zones.elevator) ||
      pointInsideDockDriveway(game.player) ||
      game.zones.kitchens.some(k => pointInsideZone(game.player, k))
    );
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
    const door = {
      x: (z.left + z.width - 5.6) * TILE,
      y: (z.top + 4.75) * TILE
    };
    return dist(game.player, door) < TILE * 2.05;
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

  function propFootRect(prop, left = prop.left, top = prop.top) {
    return { left, top, width: prop.width || .9, height: prop.height || .75 };
  }
  function rectBlockedForPush(rect, movingProp) {
    if (!withinMap(rect)) return true;
    const corners = [
      { x: Math.floor(rect.left), y: Math.floor(rect.top) },
      { x: Math.floor(rect.left + rect.width - .05), y: Math.floor(rect.top) },
      { x: Math.floor(rect.left), y: Math.floor(rect.top + rect.height - .05) },
      { x: Math.floor(rect.left + rect.width - .05), y: Math.floor(rect.top + rect.height - .05) }
    ];
    if (corners.some(t => !isFloorTile(t.x, t.y) || tileInsideTemplatePath(t))) return true;
    if (rectHitsProtectedProp(rect)) return true;
    if (game.obstacles.some(o => overlaps(rect, o))) return true;
    if (game.zoneProps.some(p => p.image !== 'cone' && overlaps(rect, p))) return true;
    if (game.decorativeProps.some(p => p !== movingProp && (p.pushable || p.interactive || p.collectible) && overlaps(rect, propFootRect(p)))) return true;
    return false;
  }
  function pushSmallBoxIfNeeded(dx, dy, step) {
    if (!game.player || (!dx && !dy)) return;
    const ahead = { x: game.player.x + dx * (game.player.r + 28), y: game.player.y + dy * (game.player.r + 28) };
    for (const prop of game.decorativeProps) {
      if (!prop.pushable) continue;
      const c = decorativeCenter(prop);
      if (Math.hypot(ahead.x - c.x, ahead.y - c.y) > TILE * .72) continue;
      const moveTiles = Math.max(.04, step / TILE);
      const nextLeft = prop.left + dx * moveTiles;
      const nextTop = prop.top + dy * moveTiles;
      const nextRect = propFootRect(prop, nextLeft, nextTop);
      if (!rectBlockedForPush(nextRect, prop)) {
        prop.left = nextLeft;
        prop.top = nextTop;
        prop.bob = 0;
      }
      break;
    }
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
      pushSmallBoxIfNeeded(dx, dy, step);
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
    if (!game.fire && !playerRidingPalletJack(now) && pointInsideZone(p, game.zones.inventory) && now >= game.inventoryCooldownUntil) startInventoryBriefing();
    if (!game.fire && !playerRidingPalletJack(now) && pointInsideZone(p, game.zones.quarantine) && now >= game.qsCooldownUntil) startQSPuzzle();
    updateSpecialMusic();
    centerCamera();
  }
  function centerCamera() {
    if (!game.player) return;
    const z = gameplayZoomFactor();
    const viewW = W / z;
    const viewH = H / z;
    game.camera.x = clamp(game.player.x - viewW / 2, 0, Math.max(0, WORLD_W - viewW));
    game.camera.y = clamp(game.player.y - viewH / 2, 0, Math.max(0, WORLD_H - viewH));
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
      const safeZone = tileInsideZone(et, game.zones.dock) ? game.zones.dock :
        (tileInsideZone(et, game.zones.elevator) ? game.zones.elevator : game.zones.kitchens.find(k => tileInsideZone(et, k)));
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
      attacker.disabledUntil = now + PALLET_JACK_ROBOT_DISABLE;
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
    const remaining = `${game.health}/${game.maxHearts} HEARTS REMAINING`;
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
      if (game.health < game.maxHearts) { game.health++; addMessage('3 COFFEES — HEART RESTORED!', '#e38537', 1800); }
      else { game.score += 100; addMessage('FULL ENERGY — +100', '#e38537', 1600); }
    } else addMessage(`COFFEE COLLECTED  ${game.coffees}/3`, '#e38537', 1350);
    synth.pickup();
    updateBest();
  }

  const lootTable = [
    { id: 'heart', weight: 8 }, { id: 'coffee', weight: 13 }, { id: 'shoeReward', weight: 18 },
    { id: 'emailTask', weight: 25 }, { id: 'workdayTask', weight: 25 }, { id: 'noean', weight: 16 }, { id: 'sopToken', weight: 2 },
    { id: 'mixed', weight: 7 }, { id: 'mould', weight: 8 }, { id: 'break', weight: 6 },
    { id: 'ops', weight: 3 }, { id: 'empty', weight: 5 }
  ];
  const smallBoxLoot = [
    { id: 'empty', weight: 14 }, { id: 'heart', weight: 8 }, { id: 'coffee', weight: 12 }, { id: 'shoeReward', weight: 20 },
    { id: 'emailTask', weight: 17 }, { id: 'workdayTask', weight: 17 }, { id: 'noean', weight: 10 }, { id: 'sopToken', weight: 2 }
  ];
  function weightedFrom(table) {
    const total = table.reduce((sum, item) => sum + item.weight, 0);
    if (total <= 0) return 'coffee';
    let roll = Math.random() * total;
    for (const item of table) { roll -= item.weight; if (roll <= 0) return item.id; }
    return table[0] ? table[0].id : 'coffee';
  }
  function lootAvailable(id, now = performance.now()) {
    if (id === 'emailTask') return !game.tasks.completed.email && taskCooldownRemaining('email', now) <= 0;
    if (id === 'workdayTask') return !game.tasks.completed.workday && taskCooldownRemaining('workday', now) <= 0;
    if (id === 'noean') return now >= game.noEanCooldownUntil;
    if (id === 'mixed') return now >= game.inventoryCooldownUntil;
    if (id === 'mould') return now >= game.qsCooldownUntil;
    if (id === 'ops') return requiredTasksComplete() && !game.tasks.opsExit;
    return true;
  }
  function filteredLootTable(table, now = performance.now()) {
    return table.filter(item => lootAvailable(item.id, now));
  }
  function weightedLoot() { return weightedFrom(filteredLootTable(lootTable, performance.now())); }
  function weightedSmallBoxLoot() { return weightedFrom(filteredLootTable(smallBoxLoot, performance.now())); }
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
        if (game.health < game.maxHearts) { game.health++; synth.pickup(); addMessage('HEART RESTORED!', '#ed4959', 1600); }
        else { game.score += 100; synth.points(); addMessage('FULL HEALTH  +100', '#ed4959', 1600); }
        break;
      case 'coffee': collectCoffee(); return;
      case 'shoeReward': game.stats.shoesCollected++; addTaskProgress(Math.random() < .5 ? 'alm' : 'sl', 1, 'OFFLINE STOCK FOUND'); return;
      case 'emailTask': addTaskProgress('email', 1, 'EMAIL TASK FOUND'); return;
      case 'workdayTask': addTaskProgress('workday', 1, 'WORKDAY TASK FOUND'); return;
      case 'noean': if (now < game.noEanCooldownUntil) { resolveLoot('coffee', now); return; } game.stats.noEanTasks++; teleportTo(game.zones.dock, 'NO EAN ON SHIPPING NOTICE — SCANNER TASK', null); startNoEanBriefing(); return;
      case 'sopToken':
        game.tasks.tokens++;
        game.stats.sopTokensFound++;
        game.tokenFlashUntil = performance.now() + 2200;
        synth.route();
        addMessage('Use the SOPScout to help you complete a task in the office!', '#ff7700', 3300);
        updateBest();
        return;
      case 'return': game.score += 150; game.stats.returnsProcessed++; teleportTo(game.zones.dock, 'RETURN — SENT TO DOCK  +150', null); break;
      case 'mixed': if (now < game.inventoryCooldownUntil) { resolveLoot('shoeReward', now); return; } game.stats.mixedStock++; teleportTo(game.zones.inventory, 'MIXED STOCK — INVENTORY CHECK', 'inventory'); startInventoryBriefing(); break;
      case 'mould': if (now < game.qsCooldownUntil) { resolveLoot('coffee', now); return; } game.stats.mouldyClothes++; teleportTo(game.zones.quarantine, 'SPERRLAGER: ITEMS IN BAD CONDITION', null); break;
      case 'break': game.stats.lunchBreaks++; teleportTo(choice(game.zones.kitchens), 'COFFEE BREAK — SENT TO KITCHEN', 'kitchen'); break;
      case 'ops':
        game.stats.opsFinds++;
        game.tasks.opsExit = true;
        game.routePath = bfs(worldToTile(game.player.x, game.player.y), { x: game.zones.exit.x, y: game.zones.exit.y });
        game.routeUntil = now + 18000;
        game.score += 250;
        synth.route();
        addMessage('You’ve achieved Operational Excellence!', '#ff7700', 3300);
        addMessage('You can go right to the exit without having to complete any more tasks!', '#ffd054', 4300);
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
    const now = performance.now();
    if (playerRidingPalletJack(now)) { addMessage('GET OFF THE PALLET JACK BEFORE INVENTORY CHECK', '#ffd054', 2200); return false; }
    if (game.mode !== 'play' || now < game.inventoryCooldownUntil) return false;
    game.stats.inventoryChecks++;
    game.mode = 'inventoryBriefing';
    setGameplayControlsVisible(false);
    game.inventoryBriefUntil = now + 3400;
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
    game.inventoryCooldownUntil = performance.now() + TASK_COOLDOWN;
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
      speed: rand(214, 269),
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
    const now = performance.now();
    if (playerRidingPalletJack(now)) { addMessage('GET OFF THE PALLET JACK BEFORE SPERRLAGER', '#ffd054', 2200); return false; }
    if (game.mode !== 'play' || now < game.qsCooldownUntil) return false;
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
    game.qsCooldownUntil = performance.now() + TASK_COOLDOWN;
    game.qsPuzzle = null;
    game.specialMusic = null;
    game.mode = 'play';
    keys.clear();
    setGameplayControlsVisible(true);
    centerCamera();
    music.playGameplay();
    addMessage(`SPERRLAGER COMPLETE  +${pz.scoreEarned}  DISPOSE ${pz.disposeCount}  DESTROY ${pz.destroyCount}`, '#ff7700', 3400);
    updateBest();
  }

  function startNoEanBriefing() {
    const now = performance.now();
    if (game.mode !== 'play' || now < game.noEanCooldownUntil) return false;
    setGameplayControlsVisible(false);
    keys.clear(); stopSprint();
    game.noEanBriefUntil = now + 5200;
    game.mode = 'noEanBriefing';
    game.specialMusic = 'inventory';
    music.play('inventory', true);
    return true;
  }

  function createNoEanPuzzle() {
    const now = performance.now();
    const scannerY = H * (748 / 941);
    const target = nextNoEanTarget();
    game.noEanPuzzle = {
      startedAt: now,
      until: now + NOEAN_DURATION,
      target,
      targetLabel: target === 'shoes' ? 'SHOES' : (target === 'tops' ? 'TOPS' : 'PANTS'),
      toastUntil: now + 2000,
      nextSpawnAt: now + 1000,
      items: [],
      path: makeNoEanPath(),
      scanner: { x: W * (836 / 1672), y: scannerY, minX: W * (104 / 1672), maxX: W * (1311 / 1672), speed: 540, angle: 90, lastAngleStepAt: 0 },
      beam: null,
      feedback: null,
      wrongFlashUntil: 0,
      scoreEarned: 0,
      correctHits: 0,
      wrongHits: 0,
      missedTargets: 0
    };
    game.mode = 'noEanPuzzle';
  }

  function nextNoEanTarget() {
    const recent = game.noEanTargetHistory || [];
    let options = NOEAN_TARGETS.filter(target => !recent.slice(-1).includes(target));
    if (!options.length) options = NOEAN_TARGETS.slice();
    const chosen = choice(options);
    game.noEanTargetHistory = [...recent.slice(-2), chosen];
    return chosen;
  }

  function noEanSpawnInterval(elapsed) {
    if (elapsed < 20000) return rand(1150, 1450);
    if (elapsed < 40000) return rand(850, 1150);
    return rand(620, 900);
  }
  function makeNoEanPath() {
    // V2.43: aligned to conveyor.jpg in its 1672 x 941 design coordinate space.
    // These points are the visual centreline of the baked conveyor belts.
    const DESIGN_W = 1672, DESIGN_H = 941;
    const sx = W / DESIGN_W, sy = H / DESIGN_H;
    const points = [];
    const add = (x, y) => points.push({ x: x * sx, y: y * sy });
    const addLine = (a, b, steps = 32) => {
      for (let i = points.length ? 1 : 0; i <= steps; i++) {
        const t = i / steps;
        add(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
      }
    };
    const addQuad = (a, c, b, steps = 24) => {
      for (let i = 1; i <= steps; i++) {
        const t = i / steps, mt = 1 - t;
        add(mt * mt * a[0] + 2 * mt * t * c[0] + t * t * b[0], mt * mt * a[1] + 2 * mt * t * c[1] + t * t * b[1]);
      }
    };

    // Feeder/top-left -> top belt -> right curve -> middle belt -> left U-turn -> lower belt -> lower-right exit.
    addLine([330, 118], [1268, 118], 42);
    addQuad([1268, 118], [1418, 132], [1362, 301], 28);
    addLine([1362, 301], [312, 301], 48);
    addQuad([312, 301], [118, 390], [258, 510], 34);
    addLine([258, 510], [1268, 510], 44);
    addQuad([1268, 510], [1404, 548], [1342, 675], 28);
    addLine([1342, 675], [1342, 970], 24);

    const lengths = [0];
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      lengths.push(total);
    }
    return { points, lengths, total };
  }
  function pointOnNoEanPath(path, distance) {
    const d = clamp(distance, 0, path.total);
    let i = 1;
    while (i < path.lengths.length && path.lengths[i] < d) i++;
    const a = path.points[i - 1] || path.points[0], b = path.points[i] || a;
    const span = Math.max(1, (path.lengths[i] || 0) - (path.lengths[i - 1] || 0));
    const t = clamp((d - (path.lengths[i - 1] || 0)) / span, 0, 1);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }
  function tangentOnNoEanPath(path, distance) {
    const ahead = pointOnNoEanPath(path, distance + 18);
    const behind = pointOnNoEanPath(path, distance - 18);
    const dx = ahead.x - behind.x, dy = ahead.y - behind.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  }
  function noEanItemVisualOffset(item, path) {
    const tangent = tangentOnNoEanPath(path, item.distance || 0);
    const normal = { x: -tangent.y, y: tangent.x };
    const mostlyVertical = Math.abs(tangent.y) > Math.abs(tangent.x);
    if (mostlyVertical) return { x: 0, y: 0 };
    const amount = item.category === 'shoes' ? -10 : (item.category === 'pants' ? -5 : -7);
    return { x: normal.x * amount, y: normal.y * amount };
  }
  function noEanPathPosition(item, path) {
    const p = pointOnNoEanPath(path, item.distance || 0);
    const offset = noEanItemVisualOffset(item, path);
    return { x: p.x + offset.x, y: p.y + offset.y };
  }
  function noEanClothingFrame(category) {
    const tops = [2, 3, 5, 7, 9, 11];
    const pants = [0, 1, 6, 10];
    return choice(category === 'tops' ? tops : pants);
  }
  function chooseNoEanSpawnCategory() {
    const pz = game.noEanPuzzle;
    if (!pz || !pz.target) return choice(NOEAN_TARGETS);
    // Roughly half target items, half distractors.
    if (Math.random() < .52) return pz.target;
    const nonTargets = NOEAN_TARGETS.filter(cat => cat !== pz.target);
    return choice(nonTargets);
  }

  function createNoEanItem(now) {
    const category = chooseNoEanSpawnCategory();
    const shoeKeys = shoeImageKeys();
    const isShoe = category === 'shoes';
    const frameCount = noEanFrameCount(category);
    return {
      category,
      image: isShoe ? (choice(shoeKeys.length ? shoeKeys : ['shoe'])) : 'clothes',
      frame: randInt(0, Math.max(0, frameCount - 1)),
      distance: 0,
      speed: rand(126, 158),
      w: category === 'shoes' ? rand(82, 108) : (category === 'tops' ? rand(72, 96) : rand(68, 92)),
      h: category === 'shoes' ? rand(50, 68) : (category === 'tops' ? rand(78, 104) : rand(70, 96)),
      x: -999,
      y: -999,
      hitAt: 0,
      removing: false,
      flashUntil: 0
    };
  }
  function noEanAdvanceAngle(pz, direction, now) {
    const scanner = pz.scanner;
    const currentIndex = NOEAN_ANGLES.indexOf(scanner.angle);
    let next;
    if (currentIndex < 0) {
      next = direction > 0 ? NOEAN_ANGLES.find(a => a > scanner.angle) : [...NOEAN_ANGLES].reverse().find(a => a < scanner.angle);
    } else next = NOEAN_ANGLES[clamp(currentIndex + direction, 0, NOEAN_ANGLES.length - 1)];
    if (typeof next === 'number') scanner.angle = next;
    scanner.lastAngleStepAt = now;
  }
  function resetNoEanScanner() {
    const pz = game.noEanPuzzle;
    if (!pz) return;
    pz.scanner.x = W / 2;
    pz.scanner.angle = 90;
    pz.scanner.lastAngleStepAt = performance.now();
  }
  function scannerBeamOrigin(scanner) {
    const rad = scanner.angle * Math.PI / 180;
    const dx = Math.cos(rad), dy = -Math.sin(rad);
    const scannerDrawH = 178;
    return { x: scanner.x + dx * (scannerDrawH / 2), y: scanner.y + dy * (scannerDrawH / 2), dx, dy };
  }
  function distancePointToRay(px, py, ray) {
    const vx = px - ray.x, vy = py - ray.y;
    const along = vx * ray.dx + vy * ray.dy;
    const perp = Math.abs(vx * ray.dy - vy * ray.dx);
    return { along, perp };
  }
  function setNoEanFeedback(type, now) {
    const pz = game.noEanPuzzle;
    if (!pz) return;
    pz.feedback = { type, start: now, until: now + 1500 };
  }
  function applyNoEanPenalty(pz, now, reason) {
    if (game.score >= 30) game.score -= 30;
    else { game.score = 0; game.health = Math.max(0, game.health - 1); }
    if (reason === 'wrong') { pz.wrongHits++; game.stats.noEanWrong++; }
    if (reason === 'missed') { pz.missedTargets++; game.stats.noEanMissed++; }
    synth.note(160, .12, 'sawtooth', .045);
    shake(8);
    updateBest();
    if (game.health <= 0) {
      finishNoEanPuzzle(true);
      game.mode = 'play';
      triggerDeath();
    }
  }
  function fireNoEanScanner(now) {
    const pz = game.noEanPuzzle;
    if (!pz || now < (pz.nextShotAt || 0)) return;
    pz.nextShotAt = now + 100;
    const ray = scannerBeamOrigin(pz.scanner);
    let best = null;
    pz.items.forEach(item => {
      if (item.removing) return;
      const hit = distancePointToRay(item.x, item.y, ray);
      const radius = Math.min(item.w, item.h) * .40;
      if (hit.along > 0 && hit.along < W * 1.35 && hit.perp <= radius && (!best || hit.along < best.along)) best = { item, along: hit.along };
    });
    const beamEnd = best ? { x: ray.x + ray.dx * best.along, y: ray.y + ray.dy * best.along } : { x: ray.x + ray.dx * W * 1.45, y: ray.y + ray.dy * W * 1.45 };
    pz.beam = { x1: ray.x, y1: ray.y, x2: beamEnd.x, y2: beamEnd.y, until: now + 130 };
    synth.note(760, .035, 'square', .025);
    if (!best) return;
    const item = best.item;
    if (item.category === pz.target) {
      item.flashUntil = now + 140;
      item.removing = true;
      item.hitAt = now;
      pz.correctHits++;
      pz.scoreEarned += 15;
      game.stats.noEanScans++;
      game.score += 15;
      setNoEanFeedback('correct', now);
      synth.note(1040, .08, 'sine', .05);
      burst(item.x, item.y, '#ff3b3b', 12);
      updateBest();
    } else {
      setNoEanFeedback('wrong', now);
      pz.wrongFlashUntil = now + 300;
      applyNoEanPenalty(pz, now, 'wrong');
    }
  }
  function updateNoEanPuzzle(dt, now) {
    const pz = game.noEanPuzzle;
    if (!pz) return;
    let move = 0;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) move--;
    if (keys.has('ArrowRight') || keys.has('KeyD')) move++;
    pz.scanner.x = clamp(pz.scanner.x + move * pz.scanner.speed * dt, pz.scanner.minX, pz.scanner.maxX);
    const upHeld = keys.has('ArrowUp') || keys.has('KeyW');
    const downHeld = keys.has('ArrowDown') || keys.has('KeyS');
    if ((upHeld || downHeld) && now - (pz.scanner.lastAngleStepAt || 0) >= 1000) noEanAdvanceAngle(pz, upHeld ? 1 : -1, now);
    const elapsed = now - pz.startedAt;
    if (now >= pz.nextSpawnAt && now < pz.until) {
      const active = pz.items.filter(item => !item.removing);
      const last = active[active.length - 1];
      // No max active cap. Keep only a path-gap rule so late-round speed does not leave big empty conveyor sections.
      if (!last || last.distance > 105) {
        const item = createNoEanItem(now);
        const pos = noEanPathPosition(item, pz.path);
        item.x = pos.x; item.y = pos.y;
        pz.items.push(item);
        pz.nextSpawnAt = now + noEanSpawnInterval(elapsed);
      } else pz.nextSpawnAt = now + 90;
    }
    for (let i = pz.items.length - 1; i >= 0; i--) {
      const item = pz.items[i];
      if (item.removing) {
        if (now - item.hitAt > 260) pz.items.splice(i, 1);
        continue;
      }
      item.distance += item.speed * dt;
      const point = noEanPathPosition(item, pz.path);
      item.x = point.x; item.y = point.y;
      if (item.distance >= pz.path.total) {
        if (item.category === pz.target) applyNoEanPenalty(pz, now, 'missed');
        else synth.note(320, .05, 'triangle', .018);
        pz.items.splice(i, 1);
      }
    }
  }
  function finishNoEanPuzzle(silent = false) {
    const pz = game.noEanPuzzle;
    if (!pz) return;
    const exitTile = tileNearZoneEdge(game.zones.dock);
    const pos = tileCenter(exitTile);
    if (game.player) { game.player.x = pos.x; game.player.y = pos.y; game.player.invulnerableUntil = performance.now() + 2300; }
    game.noEanCooldownUntil = performance.now() + TASK_COOLDOWN;
    game.noEanPuzzle = null;
    game.specialMusic = null;
    game.mode = 'play';
    keys.clear();
    setGameplayControlsVisible(true);
    centerCamera();
    if (!silent) addMessage(`NO EAN SCAN COMPLETE  +${pz.scoreEarned}  SCANNED ${pz.correctHits}`, '#ff7700', 3400);
    music.playGameplay();
    updateBest();
  }

  function roundRect(x, y, w, h, r, fill = true, stroke = false) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function drawNoEanBriefing() {
    if (images.noEanWelcome) drawCoverImage(images.noEanWelcome, 0, 0, W, H);
    else { ctx.fillStyle = '#27313c'; ctx.fillRect(0, 0, W, H); }
    ctx.fillStyle = 'rgba(8,10,13,.62)'; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6900'; ctx.font = 'bold 48px Trebuchet MS'; ctx.fillText('NO EAN ON SHIPPING NOTICE', W / 2, 138);
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 24px Trebuchet MS'; ctx.lineWidth = 5; ctx.strokeStyle = '#000';
    const lines = [
      'In a recent delivery we have many items which had no EAN on the shipping notice.',
      'Scan the items missing the EAN so we can add them to a Jira ticket.'
    ];
    lines.forEach((line, i) => { ctx.strokeText(line, W / 2, 245 + i * 42); ctx.fillText(line, W / 2, 245 + i * 42); });
    ctx.fillStyle = 'rgba(15,18,22,.80)'; ctx.fillRect(W / 2 - 430, 365, 860, 120);
    ctx.strokeStyle = '#ff6900'; ctx.strokeRect(W / 2 - 430, 365, 860, 120);
    ctx.fillStyle = '#ffd054'; ctx.font = 'bold 23px Trebuchet MS'; ctx.fillText('AIM WITH ARROWS / WASD  •  SPACE TO SCAN  •  ENTER TO RESET', W / 2, 412);
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 20px Trebuchet MS'; ctx.fillText('Be careful — you may not need to scan every item.', W / 2, 455);
    const seconds = Math.max(1, Math.ceil((game.noEanBriefUntil - performance.now()) / 1000));
    ctx.fillStyle = '#ffd054'; ctx.font = 'bold 30px Trebuchet MS'; ctx.fillText(`STARTING IN ${seconds}...`, W / 2, 548);
    ctx.restore();
  }
  function noEanSheetForCategory(category) {
    if (category === 'shoes') return images.noEanShoes || null;
    if (category === 'tops') return images.noEanTops || null;
    if (category === 'pants') return images.noEanPants || null;
    return null;
  }
  function noEanSheetGrid(img) {
    // The No EAN cards are 1500x1200 with a fixed 4 x 3 layout.
    return { cols: 4, rows: 3, count: 12 };
  }
  function noEanFrameBounds(category, frame, sw, sh) {
    const list = NOEAN_FRAME_BOUNDS[category];
    if (!list || !list.length) return [0, 0, sw, sh];
    return list[frame % list.length] || [0, 0, sw, sh];
  }
  function noEanFrameCount(category) {
    const img = noEanSheetForCategory(category);
    return noEanSheetGrid(img).count;
  }
  function drawNoEanCardItem(item, x, y, w, h, alpha = 1) {
    const img = noEanSheetForCategory(item.category);
    if (!img) return false;
    const grid = noEanSheetGrid(img);
    const frame = (item.frame || 0) % grid.count;
    const col = frame % grid.cols;
    const row = Math.floor(frame / grid.cols);
    const cellW = img.width / grid.cols;
    const cellH = img.height / grid.rows;
    const crop = noEanFrameBounds(item.category, frame, cellW, cellH);
    const sx = col * cellW + crop[0], sy = row * cellH + crop[1];
    const sw = crop[2] - crop[0], sh = crop[3] - crop[1];
    const scale = Math.min(w / sw, h / sh);
    const dw = sw * scale, dh = sh * scale;
    const dx = x + (w - dw) / 2, dy = y + (h - dh) / 2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = 'rgba(0,0,0,.72)';
    ctx.shadowBlur = 13;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 9;
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.restore();
    return true;
  }
  function drawNoEanItem(item, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const x = item.x - item.w / 2;
    const y = item.y - item.h / 2;
    const usedCard = drawNoEanCardItem(item, x, y, item.w, item.h, alpha);
    if (!usedCard) {
      if (item.category === 'shoes' && images[item.image]) drawContain(images[item.image], x, y, item.w, item.h, alpha, true);
      else if (images.clothes) drawClothingItem(item.frame, x, y, item.w, item.h, alpha);
    }
    if (performance.now() < item.flashUntil) {
      ctx.globalAlpha = .45; ctx.fillStyle = '#ff1f2a'; ctx.beginPath(); ctx.ellipse(item.x, item.y, item.w * .55, item.h * .55, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  function drawNoEanScannerSprite(pz, now) {
    const s = pz.scanner;
    // scanner.png is 229 x 500. Keep that tall aspect ratio; do not squash it horizontally.
    const h = 178, w = h * (229 / 500);
    const rad = (90 - s.angle) * Math.PI / 180;
    let feedbackImg = null, feedbackAlpha = 0;
    if (pz.feedback && now < pz.feedback.until) {
      const progress = (now - pz.feedback.start) / 1500;
      feedbackAlpha = progress < .2 ? progress / .2 : (progress > .8 ? (1 - progress) / .2 : 1);
      feedbackImg = pz.feedback.type === 'correct' ? images.scannerCorrect : images.scannerWrong;
    }
    const baseImg = images.scanner;
    const drawRotated = (img, alpha) => {
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(rad); ctx.globalAlpha = alpha;
      if (img) { drawShadow(-w / 2, -h / 2, w, h, .20 * alpha); ctx.drawImage(img, -w / 2, -h / 2, w, h); }
      else { ctx.fillStyle = '#333'; ctx.fillRect(-w/2, -h/2, w, h); ctx.fillStyle = '#ff3333'; ctx.fillRect(-8, -h/2, 16, 28); }
      ctx.restore();
    };
    drawRotated(baseImg, 1);
    if (feedbackImg && feedbackAlpha > 0) drawRotated(feedbackImg, feedbackAlpha);
  }
  function drawNoEanPuzzle(now) {
    const pz = game.noEanPuzzle;
    if (!pz) return;
    if (images.noEanBg) drawCoverImage(images.noEanBg, 0, 0, W, H);
    else { ctx.fillStyle = '#293037'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#6a6d70'; ctx.fillRect(70, 110, W - 180, 58); ctx.fillRect(220, 300, W - 350, 58); ctx.fillRect(190, 470, W - 270, 58); }
    pz.items.forEach(item => {
      const fade = item.removing ? clamp(1 - (now - item.hitAt) / 260, 0, 1) : 1;
      drawNoEanItem(item, fade);
    });
    if (pz.beam && now < pz.beam.until) {
      ctx.save();
      ctx.globalAlpha = clamp((pz.beam.until - now) / 130, 0, 1);
      ctx.strokeStyle = 'rgba(255,0,30,.85)'; ctx.lineWidth = 4; ctx.shadowBlur = 16; ctx.shadowColor = '#ff1f2a';
      ctx.beginPath(); ctx.moveTo(pz.beam.x1, pz.beam.y1); ctx.lineTo(pz.beam.x2, pz.beam.y2); ctx.stroke();
      ctx.restore();
    }
    drawNoEanScannerSprite(pz, now);
    ctx.save();
    // Narrow vertical mini-game HUD, centered in the left-side open space instead of a long top box.
    const hudW = 184, hudH = 206, hudX = 40, hudY = Math.round((H - hudH) * .52);
    ctx.fillStyle = 'rgba(12,15,18,.82)';
    roundRect(hudX, hudY, hudW, hudH, 12, true, false);
    ctx.strokeStyle = '#ff6900'; ctx.lineWidth = 2;
    roundRect(hudX, hudY, hudW, hudH, 12, false, true);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff4df';
    ctx.font = 'bold 18px Trebuchet MS';
    ctx.fillText('SCORE', hudX + 22, hudY + 42);
    ctx.fillText(formatScore(game.score), hudX + 96, hudY + 42);
    ctx.fillText('HEARTS', hudX + 22, hudY + 84);
    ctx.fillText('♥'.repeat(Math.max(0, game.health)), hudX + 96, hudY + 84);
    ctx.fillText('TIME', hudX + 22, hudY + 126);
    ctx.fillText(`${Math.max(0, Math.ceil((pz.until - now) / 1000))}s`, hudX + 96, hudY + 126);
    ctx.fillStyle = '#ffd054';
    ctx.font = 'bold 17px Trebuchet MS';
    ctx.fillText('TARGET', hudX + 22, hudY + 168);
    ctx.fillText(pz.targetLabel, hudX + 22, hudY + 196);
    if (now < pz.toastUntil) {
      ctx.fillStyle = 'rgba(15,18,22,.88)';
      roundRect(42, Math.round(H * .72), 300, 60, 12, true, false);
      ctx.strokeStyle = '#ff6900'; ctx.lineWidth = 2;
      roundRect(42, Math.round(H * .72), 300, 60, 12, false, true);
      ctx.fillStyle = '#ffd054'; ctx.font = 'bold 25px Trebuchet MS'; ctx.textAlign = 'center';
      ctx.fillText(`SHOOT ALL ${pz.targetLabel}`, 192, Math.round(H * .72) + 38);
    }
    if (pz.wrongFlashUntil && now < pz.wrongFlashUntil) {
      ctx.globalAlpha = clamp((pz.wrongFlashUntil - now) / 300, 0, 1) * .35;
      ctx.fillStyle = '#ff1f2a'; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
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
  function scheduleNextFire(now) { game.nextFireAt = now + FIRE_COOLDOWN; }
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


  function shouldStartBossAfterWarehouse(level) { return level > 0 && level % 3 === 0; }
  function startBossIntro() {
    game.mode = 'bossIntro';
    setGameplayControlsVisible(false);
    keys.clear();
    game.health = game.maxHearts;
    const bg = images.bossBg || images.bossBgWin;
    const bgW = bg ? bg.width : 2000;
    const bgH = bg ? bg.height : 576;
    const worldScale = H / bgH;
    const bossWorldW = Math.max(2000, bgW);
    game.boss = {
      phase: 'intro',
      introStart: performance.now(),
      cameraX: 0,
      worldW: bossWorldW,
      worldScale,
      countdown: 3,
      player: { x: bossWorldW / 2, y: H + 220, speed: 430, invulnerableUntil: performance.now() + 2300 },
      boss: { x: bossWorldW / 2, y: -350, w: 560, h: 560, vx: 135, hearts: 6, maxHearts: 6, hitFlashUntil: 0, dead: false },
      fireballs: [],
      shoes: [],
      effects: [],
      nextFireAt: performance.now() + 4200,
      nextVoiceAt: performance.now() + randInt(10000, 15000),
      startedAt: performance.now(),
      victoryStart: 0,
      rewardShown: false,
      summaryUntil: 0,
      fade: 1
    };
    music.play('boss', true);
  }
  function startBossFight() {
    if (!game.boss) return;
    game.mode = 'bossFight';
    game.boss.phase = 'fight';
    game.boss.startedAt = performance.now();
    game.boss.nextFireAt = performance.now() + 2200;
    game.boss.nextVoiceAt = performance.now() + randInt(10000, 15000);
    setGameplayControlsVisible(true);
    music.play('boss', true);
  }
  function bossViewport() {
    const bg = images.bossBg || images.bossBgWin;
    const bgW = bg ? bg.width : 2000;
    const bgH = bg ? bg.height : 576;
    const scale = H / bgH;
    const worldW = game.boss && game.boss.worldW ? game.boss.worldW : bgW;
    const scaledW = worldW * scale;
    const maxCamera = Math.max(0, scaledW - W);
    const desired = game.boss ? game.boss.player.x * scale - W / 2 : maxCamera / 2;
    return { scale, scaledW, maxCamera, cameraX: clamp(desired, 0, maxCamera) };
  }
  function tintDraw(img, x, y, w, h, alpha = 1, flipX = false, redTint = true) {
    if (!img) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    // V2.58: never tint by filling the main canvas rectangle. That was causing the visible square backgrounds.
    // A drawImage filter only affects the sprite pixels being drawn, so transparent alpha stays transparent.
    ctx.filter = redTint ? 'brightness(86%) sepia(18%) saturate(118%) hue-rotate(-10deg)' : 'none';
    if (flipX) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
    } else ctx.drawImage(img, 0, 0, img.width, img.height, x, y, w, h);
    ctx.restore();
  }
  function bossAlphaHit(a, b, pad = 0) {
    return a.x - a.w / 2 + pad < b.x + b.w / 2 && a.x + a.w / 2 - pad > b.x - b.w / 2 && a.y - a.h / 2 + pad < b.y + b.h / 2 && a.y + a.h / 2 - pad > b.y - b.h / 2;
  }
  function damageBoss(amount, source, hitX = null, hitY = null) {
    const bz = game.boss;
    const b = bz && bz.boss;
    if (!b || b.dead || bz.phase !== 'fight') return false;
    const now = performance.now();

    // V2.70: Ivan can only be damaged by thrown offline-stock shoes.
    // Each accepted shoe hit removes exactly one heart, then Ivan gets a 3-second recovery window.
    if (source !== 'shoe') return false;
    if (now < (b.shoeHitUntil || 0)) return false;

    const applied = 1;
    b.shoeHitUntil = now + 3000;
    game.stats.bossShoeHits++;

    b.hearts = Math.max(0, b.hearts - applied);
    b.hitFlashUntil = now + 420;
    game.stats.bossHits += applied;

    const fxX = hitX == null ? b.x : hitX;
    const fxY = hitY == null ? b.y : hitY;
    bz.effects = bz.effects || [];
    bz.effects.push({
      type: 'shoeImpact',
      x: fxX,
      y: fxY,
      start: now,
      dur: 260
    });

    burst(fxX, fxY, '#ffef9a', 24);
    synth.hurt();
    addMessage('OFFLINE STOCK HIT!  -1 IVAN HEART', '#ffd054', 900);
    if (b.hearts <= 0) startBossVictory();
    return true;
  }
  function startBossVictory() {
    const bz = game.boss;
    if (!bz || bz.phase === 'victory') return;
    bz.phase = 'victory';
    game.mode = 'bossVictory';
    bz.victoryStart = performance.now();
    bz.boss.dead = true;
    bz.nextFireAt = Number.POSITIVE_INFINITY;
    bz.nextVoiceAt = Number.POSITIVE_INFINITY;
    bz.fireballs = [];
    bz.shoes = [];
    bz.effects = [];
    keys.delete('Space');
    music.stop();
    stopOneShots();
    playOneShot('success.mp3', .75);
    game.maxHearts += 1;
    game.health = game.maxHearts;
    game.stats.bossesDefeated++;
    game.stats.warehousesCleared++;
    updateBest();
  }
  function throwBossShoe(now) {
    const bz = game.boss;
    if (!bz || bz.phase !== 'fight' || bz.boss.dead) return false;
    if (now < (bz.nextShoeAt || 0)) return false;

    bz.nextShoeAt = now + 460;
    const keysPool = shoeImageKeys();
    const size = 54;
    const startX = bz.player.x;
    const startY = bz.player.y - 105;

    // You must drive closer before offline stock can reach Ivan.
    // V2.70: shoes travel a little further, with about 10% random range variation per throw.
    // From the very bottom/back of the arena they still visibly arc and land short.
    const closeEnoughToHit = bz.player.y <= H - 230;
    const rangeJitter = rand(0.90, 1.10);
    const targetX = clamp((bz.boss ? bz.boss.x : bz.player.x) + rand(-24, 24), 160, bz.worldW - 160);
    const travelTime = (closeEnoughToHit ? 1.32 : 0.88) * rangeJitter;
    const groundY = H - 92;
    const vx = (targetX - startX) / travelTime;
    const vy = (closeEnoughToHit ? -650 : -455) * rangeJitter;
    const gravity = closeEnoughToHit ? 880 : 955;

    bz.shoes.push({
      x: startX,
      y: startY,
      prevY: startY,
      w: size,
      h: size,
      vx,
      vy,
      gravity,
      groundY,
      spin: 0,
      born: now,
      armedAt: now + 520,
      hitEnabledAt: now + 620,
      canHitBoss: closeEnoughToHit,
      exploded: false,
      explodeStart: 0,
      landed: false,
      landAt: 0,
      hit: false,
      impact: false,
      impactStart: 0,
      image: choice(keysPool.length ? keysPool : ['shoe'])
    });
    synth.jump();
    addMessage(closeEnoughToHit ? 'OFFLINE STOCK THROWN!' : 'MOVE CLOSER TO HIT IVAN!', closeEnoughToHit ? '#ffd054' : '#ff9a3b', 650);
    return true;
  }
  function shootBossFireball(now) {
    const bz = game.boss;
    if (!bz || !bz.boss || bz.boss.dead) return;
    const b = bz.boss;

    const activeShoes = (bz.shoes || []).filter(s => !s.hit && !s.exploded && !s.landed);
    let target = null;
    if (activeShoes.length) {
      target = activeShoes.sort((a, z) => Math.hypot(a.x - b.x, a.y - b.y) - Math.hypot(z.x - b.x, z.y - b.y))[0];
    } else {
      target = { x: bz.player.x, y: bz.player.y - 35 };
    }

    const originX = b.x + b.w * 0.04;
    const originY = b.y + b.h * 0.08;
    const dx = target.x - originX;
    const dy = target.y - originY;
    const len = Math.max(1, Math.hypot(dx, dy));
    const speed = 360;

    bz.fireballs.push({
      x: originX,
      y: originY,
      w: 118,
      h: 118,
      vx: dx / len * speed,
      vy: dy / len * speed,
      born: now,
      frameFloat: 0,
      hit: false
    });
  }
  function updateBossIntro(dt, now) {
    const bz = game.boss;
    if (!bz) return;
    const elapsed = now - bz.introStart;
    if (elapsed < 900) return;
    if (elapsed < 6200) {
      bz.typed = clamp((elapsed - 900) / 4400, 0, 1);
      return;
    }
    if (elapsed < 7900) return;
    bz.phase = 'enter';
    game.mode = 'bossEnter';
    bz.enterStart = now;
  }
  function updateBossEnter(dt, now) {
    const bz = game.boss;
    if (!bz) return;
    const t = clamp((now - bz.enterStart) / 2600, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    bz.boss.y = -350 + (H * .34 + 350) * eased;
    bz.player.y = H + 260 + (H * .84 - H - 260) * eased;
    if (t >= 1) {
      bz.phase = 'countdown';
      game.mode = 'bossCountdown';
      bz.countdownStart = now;
    }
  }
  function updateBossCountdown(dt, now) {
    const bz = game.boss;
    if (!bz) return;
    const elapsed = now - bz.countdownStart;
    bz.countdown = Math.max(1, 3 - Math.floor(elapsed / 1000));
    if (elapsed >= 3300) startBossFight();
  }
  function updateBossFight(dt, now) {
    const bz = game.boss;
    if (!bz || bz.phase !== 'fight') return;
    const b = bz.boss;
    const worldW = bz.worldW || 2000;
    const speed = bz.player.speed || 520;
    const dx = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0);
    const dy = (keys.has('ArrowDown') || keys.has('KeyS') ? 1 : 0) - (keys.has('ArrowUp') || keys.has('KeyW') ? 1 : 0);

    bz.player.x = clamp(bz.player.x + dx * speed * dt, 180, worldW - 180);

    // The forklift artwork is tall and top-heavy, so the gameplay collision/depth point is the lower visible half.
    // This lets the player drive further "forward" into the arena without the invisible top of the sprite stopping early.
    const playerForwardLimit = H - 385;
    bz.player.y = clamp(bz.player.y + dy * speed * dt, playerForwardLimit, H - 70);

    b.x += b.vx * dt;
    const leftLimit = 320;
    const rightLimit = worldW - 320;
    if (b.x < leftLimit || b.x > rightLimit) {
      b.vx *= -1;
      b.x = clamp(b.x, leftLimit, rightLimit);
    }

    // Ivan mostly moves left/right, but can drift a little further backward/forward in the room.
    b.y = H * .34 + Math.sin(now / 820) * 42;

    if (!b.dead && b.hearts > 0 && now >= bz.nextFireAt) {
      shootBossFireball(now);
      bz.nextFireAt = now + rand(2400, 3500);
    }
    if (!b.dead && now >= bz.nextVoiceAt) {
      const voice = choice(['robot1.mp3', 'robot2.mp3', 'robot3.mp3']);
      playOneShot(voice, .55);
      bz.nextVoiceAt = now + rand(10000, 15000);
    }

    bz.fireballs.forEach(f => {
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.frameFloat = ((f.frameFloat || 0) + dt * 16) % 17;
    });
    bz.fireballs = bz.fireballs.filter(f => f.y < H + 160 && f.x > -180 && f.x < worldW + 180 && !f.hit);

    // Move shoes in an arc. They can only hit on the downward part of the arc.
    bz.shoes.forEach(s => {
      s.prevY = s.y;
      if (!s.landed && !s.exploded && !s.hit && !s.impact) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += s.gravity * dt;
        s.spin += dt * Math.PI * 5.4;
        if (s.y >= s.groundY && s.vy > 0) {
          s.y = s.groundY;
          s.landed = true;
          s.landAt = now;
          s.vx = 0;
          s.vy = 0;
          s.spin = 0;
        }
      }
    });

    // Ivan targets thrown shoes first and can shoot them out of the air.
    for (const f of bz.fireballs) {
      if (f.hit) continue;
      for (const s of bz.shoes) {
        if (s.hit || s.exploded || s.landed || s.impact) continue;
        const xClose = Math.abs(f.x - s.x) < (f.w * .32 + s.w * .42);
        const yClose = Math.abs(f.y - s.y) < (f.h * .32 + s.h * .42);
        if (xClose && yClose) {
          f.hit = true;
          s.exploded = true;
          s.explodeStart = now;
          bz.effects.push({
            type: 'shoeExplosion',
            x: s.x,
            y: s.y,
            start: now,
            dur: 300
          });
          addMessage('IVAN SHOT THE STOCK!', '#ff9a3b', 600);
          break;
        }
      }
    }
    bz.fireballs = bz.fireballs.filter(f => !f.hit);

    const bossBox = {
      x: b.x - b.w * .30,
      y: b.y - b.h * .43,
      w: b.w * .60,
      h: b.h * .76
    };
    for (const s of bz.shoes) {
      if (s.hit || s.exploded || s.landed || s.impact || now < (s.hitEnabledAt || s.armedAt || 0)) continue;
      if (!s.canHitBoss) continue;
      if (s.vy <= 55) continue; // only after the shoe has visibly gone up and started coming down
      const shoeBox = {
        x: s.x - s.w * .30,
        y: s.y - s.h * .30,
        w: s.w * .60,
        h: s.h * .60
      };
      const overlaps = shoeBox.x < bossBox.x + bossBox.w &&
        shoeBox.x + shoeBox.w > bossBox.x &&
        shoeBox.y < bossBox.y + bossBox.h &&
        shoeBox.y + shoeBox.h > bossBox.y;
      if (overlaps) {
        s.hit = true;
        s.impact = true;
        s.impactStart = now;
        s.vx = 0;
        s.vy = 0;
        s.x = clamp(s.x, bossBox.x + 20, bossBox.x + bossBox.w - 20);
        s.y = clamp(s.y, bossBox.y + 30, bossBox.y + bossBox.h - 30);
        if (!s.damageApplied) {
          s.damageApplied = damageBoss(1, 'shoe', s.x, s.y);
        }
      }
    }

    bz.shoes = bz.shoes.filter(s => {
      if (s.impact) return now - s.impactStart < 160;
      if (s.exploded) return now - s.explodeStart < 300;
      if (s.landed) return now - s.landAt < 520;
      return s.y > -180;
    });

    // V2.70: car/forklift ramming no longer damages Ivan. Boss damage now comes only from shoe throws.

    // Fireball hits only the visible lower-body/forklift footprint, not the full transparent/top-heavy image box.
    const playerHitX = bz.player.x;
    const playerHitY = bz.player.y + 4;
    for (const f of bz.fireballs) {
      if (Math.abs(f.x - playerHitX) < 82 && Math.abs(f.y - playerHitY) < 92 && now > (bz.nextPlayerHitAt || 0)) {
        bz.nextPlayerHitAt = now + 900;
        game.health = Math.max(0, game.health - 1);
        bz.effects.push({
          type: 'playerImpact',
          x: playerHitX,
          y: playerHitY - 40,
          start: now,
          dur: 260
        });
        burst(playerHitX, playerHitY, '#ee394d', 28);
        synth.hurt();
        addMessage('IVAN HIT YOU! -1 HEART', '#ee394d', 850);
        f.hit = true;
        if (game.health <= 0) triggerDeath();
      }
    }
    bz.fireballs = bz.fireballs.filter(f => !f.hit);

    bz.effects = (bz.effects || []).filter(fx => now - fx.start < fx.dur);
  }
  function updateBossVictory(dt, now) {
    const bz = game.boss;
    if (!bz) return;
    if (!bz.summaryUntil && now - bz.victoryStart > 5600) bz.summaryUntil = now + 8500;
    if (bz.summaryUntil && now > bz.summaryUntil) {
      stopOneShots();
      music.stop();
      game.level++;
      game.mode = 'transition';
      game.transitionUntil = now + 1800;
      game.boss = null;
    }
  }
  function updateBoss(dt, now) {
    if (!game.boss) return;
    if (game.mode === 'bossIntro') updateBossIntro(dt, now);
    else if (game.mode === 'bossEnter') updateBossEnter(dt, now);
    else if (game.mode === 'bossCountdown') updateBossCountdown(dt, now);
    else if (game.mode === 'bossFight') updateBossFight(dt, now);
    else if (game.mode === 'bossVictory') updateBossVictory(dt, now);
  }


  function makeLevelCarry() {
    return {
      coffees: game.coffees,
      tasks: {
        alm: game.tasks.alm || 0,
        sl: game.tasks.sl || 0,
        email: game.tasks.email || 0,
        workday: game.tasks.workday || 0,
        tokens: game.tasks.tokens || 0
      }
    };
  }
  function applyLevelCarry(carry) {
    if (!carry) return;
    game.coffees = clamp(Number(carry.coffees) || 0, 0, 2);
    ['alm', 'sl', 'email', 'workday'].forEach(type => { game.tasks[type] = Math.max(game.tasks[type] || 0, Number(carry.tasks && carry.tasks[type]) || 0); });
    game.tasks.tokens = Math.max(game.tasks.tokens || 0, Number(carry.tasks && carry.tasks.tokens) || 0);
    game.levelCarry = null;
  }

  function triggerLevelWin() {
    if (game.player.action || game.mode !== 'play') return;
    if (!requiredTasksComplete()) {
      if (performance.now() >= game.exitWarnUntil) {
        game.exitWarnUntil = performance.now() + 3300;
        addMessage(`YOU NEED ${requiredTaskCountForLevel()} TASKS COMPLETE BEFORE YOU CAN LEAVE.`, '#ff7700', 3100);
        addMessage(completionChecklist(), '#ffd054', 3100);
      }
      return;
    }
    music.play('winner', false);
    startPlayerAction('win', 1040, () => {
      game.score += 750 + game.health * 100;
      game.health = Math.min(game.maxHearts, game.health + 1);
      updateBest();
      game.levelCarry = makeLevelCarry();
      if (shouldStartBossAfterWarehouse(game.level)) startBossIntro();
      else {
        game.stats.warehousesCleared++;
        game.level++;
        game.mode = 'transition';
        game.transitionUntil = performance.now() + 2400;
      }
    });
  }
  function finishTransition() {
    const carry = game.levelCarry;
    game.mode = 'play';
    setGameplayControlsVisible(true);
    buildLevel(game.level);
    applyLevelCarry(carry);
    music.playGameplay(true);
    addMessage(`WAREHOUSE ${game.level} — THREATS INCREASED`, '#ff7700', 3200);
  }
  function triggerDeath() {
    if (game.mode === 'bossIntro' || game.mode === 'bossEnter' || game.mode === 'bossCountdown' || game.mode === 'bossFight' || game.mode === 'bossVictory') {
      game.mode = 'gameover';
      game.boss = null;
      setGameplayControlsVisible(false);
      music.stop();
      stopOneShots();
      keys.clear();
      updateBest();
      gameoverUI.classList.remove('hidden');
      music.play('gameover', true);
      saveShift();
      return;
    }
    if (game.mode !== 'play') return;
    game.mode = 'dying';
    setGameplayControlsVisible(false);
    music.stop();
    stopOneShots();
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
        game.truck = { until: now + 60000, phase: 'arriving', arriveStarted: now };
        synth.truck();
        addMessage('CARRIER AT DOCK — 60 SECONDS!', '#ff7700', 3500);
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

  function assetDrawUsage(key) {
    const uses = [];
    const add = (source, rect) => {
      if (!rect || !Number.isFinite(rect.width) || !Number.isFinite(rect.height)) return;
      uses.push(`${source}: ${rect.width.toFixed(2)}×${rect.height.toFixed(2)} tiles`);
    };
    (game.obstacles || []).forEach(p => { if (p.image === key) add('obstacle', p); });
    (game.zoneProps || []).forEach(p => { if (p.image === key) add('zone', p); });
    (game.borderProps || []).forEach(p => { if (p.image === key) add('border', p); });
    (game.decorativeProps || []).forEach(p => { if (p.image === key) add(p.collectible ? 'pickup' : 'decor', p); });
    (game.conveyors || []).forEach(c => {
      if (key === 'conveyor') add('conveyor belt', { width: 3.05, height: images.conveyor ? 3.05 * images.conveyor.height / images.conveyor.width : 1.04 });
      if (key === 'conveyorEnd') add('conveyor machine', { width: 3.05, height: images.conveyorEnd ? 3.05 * images.conveyorEnd.height / images.conveyorEnd.width : 1.42 });
    });
    if (key === 'minimap') uses.push('HUD minimap: exact image aspect, 25% smaller');
    if (key === 'title') uses.push('title screen/report image');
    if (key === 'walksprite') uses.push('player walking sprite sheet');
    if (key === 'bossCar') uses.push('boss battle animated car WebP');
    if (key === 'fireball') uses.push('boss/fireball animated WebP');
    return uses.length ? uses.slice(0, 4).join(' | ') + (uses.length > 4 ? ` | +${uses.length - 4} more` : '') : 'not currently placed in this screen';
  }

  function openAssetAudit() {
    let modal = document.getElementById('asset-audit-modal');
    if (!modal) {
      modal = document.createElement('section');
      modal.id = 'asset-audit-modal';
      modal.className = 'asset-audit-modal hidden';
      modal.innerHTML = `
        <div class="asset-audit-card">
          <header><strong>FILE / IMAGE AUDIT</strong><button type="button" id="asset-audit-close">✕</button></header>
          <p class="asset-audit-note">Shows each configured image, actual loaded dimensions, and current in-game draw usage.</p>
          <div id="asset-audit-grid" class="asset-audit-grid"></div>
        </div>`;
      document.body.appendChild(modal);
      modal.querySelector('#asset-audit-close').addEventListener('click', () => modal.classList.add('hidden'));
    }
    const grid = modal.querySelector('#asset-audit-grid');
    const keys = Object.keys(assetSources).sort((a, b) => a.localeCompare(b));
    grid.innerHTML = '';
    keys.forEach(key => {
      const img = images[key];
      const file = (assetSources[key] || [key])[0];
      const ok = !!img && img.complete !== false && img.naturalWidth !== 0;
      const nativeW = img && (img.naturalWidth || img.width) || 0;
      const nativeH = img && (img.naturalHeight || img.height) || 0;
      const card = document.createElement('article');
      card.className = `asset-audit-item ${ok ? 'ok' : 'missing'}`;
      card.innerHTML = `
        <div class="asset-audit-thumb">${ok ? `<img src="${img.src}" alt="">` : '<span>?</span>'}</div>
        <div class="asset-audit-meta">
          <strong>${key}</strong>
          <span>${file}</span>
          <span>${ok ? `${nativeW}×${nativeH}px` : 'missing / fallback'}</span>
          <small>${assetDrawUsage(key)}</small>
        </div>`;
      grid.appendChild(card);
    });
    modal.classList.remove('hidden');
  }

  function showAdminPanel(show) {
    adminPanel.classList.toggle('hidden', !show);
  }
  function adminReturnToWarehouse() {
    hideMapBuilderPanel();
    game.mode = 'play';
    game.office = null;
    game.inventoryPuzzle = null;
    game.qsPuzzle = null;
    game.noEanPuzzle = null;
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
    hideMapBuilderPanel();
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

  function ensureAdminEditor() {
    let editor = document.getElementById('admin-editor');
    if (editor) return editor;
    editor = document.createElement('section');
    editor.id = 'admin-editor';
    editor.className = 'admin-editor hidden';
    editor.innerHTML = `
      <div class="admin-editor-card">
        <header><strong>EDIT GAME SAVE</strong><button type="button" id="admin-editor-close">✕</button></header>
        <div id="admin-editor-list" class="admin-editor-list"></div>
        <div id="admin-editor-fields" class="admin-editor-fields hidden"></div>
        <div class="admin-editor-actions"><button type="button" id="admin-editor-save">Save changes</button><button type="button" id="admin-editor-back">Back to admin</button></div>
      </div>`;
    document.getElementById('game-shell').appendChild(editor);
    editor.querySelector('#admin-editor-close').addEventListener('click', closeAdminEditor);
    editor.querySelector('#admin-editor-back').addEventListener('click', closeAdminEditor);
    editor.querySelector('#admin-editor-save').addEventListener('click', saveAdminEditorChanges);
    return editor;
  }
  function closeAdminEditor() { const editor = document.getElementById('admin-editor'); if (editor) editor.classList.add('hidden'); }
  function adminSliderRow(key, label, value, min, max, step = 1) {
    return `<label class="admin-slider-row"><span>${label}</span><input data-edit-key="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"><output>${value}</output></label>`;
  }
  function adminEditGameSave() {
    const profiles = readProfiles();
    const editor = ensureAdminEditor();
    const list = editor.querySelector('#admin-editor-list');
    const fields = editor.querySelector('#admin-editor-fields');
    fields.classList.add('hidden'); fields.innerHTML = ''; editor.dataset.profileIndex = '';
    if (!profiles.length) list.innerHTML = '<p>No saved games found.</p>';
    else list.innerHTML = profiles.map((p, i) => `<button type="button" data-profile-index="${i}">${p.name || 'Scout'} — W${p.level || 1} / ${formatScore(p.score || 0)}</button>`).join('');
    list.querySelectorAll('[data-profile-index]').forEach(btn => btn.addEventListener('click', () => loadAdminEditorProfile(Number(btn.dataset.profileIndex))));
    editor.classList.remove('hidden');
  }
  function loadAdminEditorProfile(index) {
    const profiles = readProfiles(); const p = profiles[index]; if (!p) return;
    const editor = ensureAdminEditor(); const fields = editor.querySelector('#admin-editor-fields');
    editor.dataset.profileIndex = String(index);
    const tasks = { ...freshTasks(), ...(p.tasks || {}) };
    fields.innerHTML = `
      ${adminSliderRow('score', 'Points', Math.max(0, p.score || 0), 0, 50000, 50)}
      ${adminSliderRow('level', 'Warehouse', Math.max(1, p.level || 1), 1, 30, 1)}
      ${adminSliderRow('coffees', 'Coffees', Math.max(0, p.coffees || 0), 0, 9, 1)}
      ${adminSliderRow('tokens', 'SOP tokens', Math.max(0, tasks.tokens || 0), 0, 20, 1)}
      ${adminSliderRow('alm', 'ALM tasks', Math.max(0, tasks.alm || 0), 0, 20, 1)}
      ${adminSliderRow('sl', 'SL tasks', Math.max(0, tasks.sl || 0), 0, 20, 1)}
      ${adminSliderRow('email', 'Email tasks', Math.max(0, tasks.email || 0), 0, 20, 1)}
      ${adminSliderRow('workday', 'Workday tasks', Math.max(0, tasks.workday || 0), 0, 20, 1)}
      ${adminSliderRow('maxHearts', 'Max hearts', Math.max(3, p.maxHearts || 3), 3, 10, 1)}
    `;
    fields.querySelectorAll('input[type="range"]').forEach(input => input.addEventListener('input', () => { input.nextElementSibling.textContent = input.value; }));
    fields.classList.remove('hidden');
  }
  function saveAdminEditorChanges() {
    const editor = ensureAdminEditor(); const index = Number(editor.dataset.profileIndex);
    const profiles = readProfiles(); const p = profiles[index]; if (!p) { addMessage('CHOOSE A SAVE FIRST', '#ffd054', 1500); return; }
    const get = key => Number(editor.querySelector(`[data-edit-key="${key}"]`)?.value || 0);
    p.score = get('score'); p.level = Math.max(1, get('level')); p.coffees = get('coffees'); p.maxHearts = Math.max(3, get('maxHearts')); p.health = Math.min(p.maxHearts, p.health || p.maxHearts);
    const taskDefaults = { ...freshTasks(), ...(p.tasks || {}) };
    ['tokens','alm','sl','email','workday'].forEach(key => taskDefaults[key] = get(key));
    p.tasks = taskDefaults;
    writeProfiles(profiles); refreshSavedButton(); addMessage('ADMIN SAVE EDITED', '#ffd054', 1800); closeAdminEditor();
  }


  function uid(prefix) {
    return `${prefix || 'id'}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  }

  const MAP_BUILDER_SAVE_KEY = 'zalandoScout.mapBuilder.namedLayouts';
  const MAP_BUILDER_AUTOSAVE_KEY = 'zalandoScout.mapBuilder.autosave';

  function mapBuilderPalette() {
    return ['box1','box2','box3','box4','box5','box6','box7','smallbox','smallbox2','smallbox3','conveyor','conveyorEnd','cone','printers','bathroom','kitchen','table','table2','coffee','shoe','shoe1','shoe2','shoe3'].filter(key => images[key]);
  }

  function defaultMapBuilderAreas() {
    return [
      { id: uid('area'), kind:'area', name:'Dock', left:4, top:4, width:14, height:8, image:'entrance', lockedType:'dock' },
      { id: uid('area'), kind:'area', name:'Area Pod', left:30, top:4, width:14, height:8 },
      { id: uid('area'), kind:'area', name:'Area Pod', left:60, top:4, width:14, height:8 },
      { id: uid('area'), kind:'area', name:'Area Pod', left:6, top:20, width:14, height:8 },
      { id: uid('area'), kind:'area', name:'Elevator', left:33, top:20, width:14, height:8, image:'elevator', lockedType:'elevator' },
      { id: uid('area'), kind:'area', name:'Area Pod', left:60, top:20, width:14, height:8 },
      { id: uid('area'), kind:'area', name:'Area Pod', left:6, top:36, width:14, height:8 },
      { id: uid('area'), kind:'area', name:'Area Pod', left:30, top:36, width:14, height:8 },
      { id: uid('area'), kind:'area', name:'Area Pod', left:60, top:36, width:14, height:8 }
    ];
  }

  function defaultMapBuilderPaths() {
    return templatePathRects().map(r => ({ id: uid('path'), kind:'path', name:'Clear Path', left:r.left, top:r.top, width:r.width, height:r.height }));
  }

  function mapBuilderPayload() {
    const mb=game.mapBuilder;
    return {
      version:'v2.56-map-builder',
      mapTiles:{width:MAP_W,height:MAP_H},
      paths:(mb?.paths||[]).map(p=>({id:p.id||uid('path'),kind:'path',left:+p.left.toFixed(2),top:+p.top.toFixed(2),width:+p.width.toFixed(2),height:+p.height.toFixed(2)})),
      areas:(mb?.areas||[]).map(p=>({id:p.id||uid('area'),kind:'area',name:p.name||'Area',image:p.image||null,lockedType:p.lockedType||null,left:+p.left.toFixed(2),top:+p.top.toFixed(2),width:+p.width.toFixed(2),height:+p.height.toFixed(2)})),
      props:(mb?.props||[]).map(p=>({id:p.id||uid('prop'),kind:'prop',image:p.image,left:+p.left.toFixed(2),top:+p.top.toFixed(2),width:+p.width.toFixed(2),height:+p.height.toFixed(2),baseWidth:+(p.baseWidth||p.width).toFixed(2),baseHeight:+(p.baseHeight||p.height).toFixed(2),scale:+(p.scale||1).toFixed(2),flipX:!!p.flipX,collision:p.collision||'block'}))
    };
  }

  function mapBuilderApplyPayload(payload) {
    if (!payload || !game.mapBuilder) return;
    game.mapBuilder.paths = (payload.paths||[]).map(p=>({...p,id:p.id||uid('path'),kind:'path'}));
    game.mapBuilder.areas = (payload.areas||[]).map(p=>({...p,id:p.id||uid('area'),kind:'area'}));
    game.mapBuilder.props = (payload.props||[]).map(p=>({...p,id:p.id||uid('prop'),kind:'prop',baseWidth:p.baseWidth||p.width,baseHeight:p.baseHeight||p.height,scale:p.scale||1}));
    game.mapBuilder.selectedIds = [];
    game.mapBuilder.contextMenu = null;
  }

  function mapBuilderAutosave() {
    try { localStorage.setItem(MAP_BUILDER_AUTOSAVE_KEY, JSON.stringify(mapBuilderPayload())); } catch (err) { console.warn('Map builder autosave failed', err); }
  }

  function mapBuilderReadNamedSaves() {
    try { return JSON.parse(localStorage.getItem(MAP_BUILDER_SAVE_KEY) || '{}') || {}; } catch { return {}; }
  }

  function mapBuilderWriteNamedSaves(saves) {
    localStorage.setItem(MAP_BUILDER_SAVE_KEY, JSON.stringify(saves));
  }

  function mapBuilderSaveNamed() {
    const name = window.prompt('Save map as:', `layout-${new Date().toISOString().slice(0,10)}`);
    if (!name) return;
    const clean = name.trim();
    if (!clean) return;
    const saves = mapBuilderReadNamedSaves();
    saves[clean] = { savedAt: new Date().toISOString(), layout: mapBuilderPayload() };
    mapBuilderWriteNamedSaves(saves);
    mapBuilderAutosave();
    addMessage(`MAP SAVED: ${clean}`, '#71dd8d', 1800);
  }

  function mapBuilderLoadNamed() {
    const saves = mapBuilderReadNamedSaves();
    const names = Object.keys(saves).sort();
    if (!names.length) { addMessage('NO SAVED MAPS YET', '#ffd054', 1800); return; }
    const picked = window.prompt(`Load which map?\n\n${names.join('\n')}`, names[names.length - 1]);
    if (!picked || !saves[picked]) return;
    mapBuilderApplyPayload(saves[picked].layout);
    addMessage(`MAP LOADED: ${picked}`, '#71dd8d', 1800);
  }

  function startMapBuilder() {
    adminReturnToWarehouse();
    game.mode = 'mapBuilder';
    setGameplayControlsVisible(false);
    keys.clear();
    let restored = null;
    try { restored = JSON.parse(localStorage.getItem(MAP_BUILDER_AUTOSAVE_KEY) || 'null'); } catch {}
    game.mapBuilder = {
      zoom:.18, panX:24, panY:56, selected:'box5', tool:'place', placeMode:'prop', propScale:1,
      props:[], areas:defaultMapBuilderAreas(), paths:defaultMapBuilderPaths(),
      selectedIds:[], dragging:null, marquee:null, drawing:null, panning:null, contextMenu:null
    };
    if (restored && restored.paths && restored.areas) mapBuilderApplyPayload(restored);
    showMapBuilderPanel();
    addMessage('MAP BUILDER: save/export before leaving', '#ffd054', 3000);
  }

  function mapBuilderExitToGame() {
    mapBuilderAutosave();
    game.mode='play';
    game.mapBuilder=null;
    hideMapBuilderPanel();
    setGameplayControlsVisible(true);
    addMessage('MAP AUTOSAVED', '#71dd8d', 1200);
  }

  function mapBuilderAllObjects() {
    const mb=game.mapBuilder;
    return mb ? [...(mb.paths||[]), ...(mb.areas||[]), ...(mb.props||[])] : [];
  }

  function mapBuilderScreenToTile(x,y) {
    const mb=game.mapBuilder;
    return { x:(x-mb.panX)/(TILE*mb.zoom), y:(y-mb.panY)/(TILE*mb.zoom) };
  }

  function mapBuilderObjectAt(t) {
    const objects=mapBuilderAllObjects();
    for(let i=objects.length-1;i>=0;i--){
      const p=objects[i];
      if(t.x>=p.left && t.x<=p.left+p.width && t.y>=p.top && t.y<=p.top+p.height) return p;
    }
    return null;
  }

  function mapBuilderHandleAt(obj,t) {
    if(!obj) return null;
    const hs=Math.max(.35,9/(TILE*game.mapBuilder.zoom));
    const corners=[['nw',obj.left,obj.top],['ne',obj.left+obj.width,obj.top],['sw',obj.left,obj.top+obj.height],['se',obj.left+obj.width,obj.top+obj.height]];
    for(const [name,x,y] of corners){ if(Math.abs(t.x-x)<=hs && Math.abs(t.y-y)<=hs) return name; }
    const cx=obj.left+obj.width/2, cy=obj.top+obj.height/2;
    if(Math.abs(t.x-cx)<=hs && Math.abs(t.y-cy)<=hs) return 'move';
    return null;
  }

  function mapBuilderSelectedObjects(){
    const mb=game.mapBuilder;
    if(!mb) return [];
    const ids=new Set(mb.selectedIds||[]);
    return mapBuilderAllObjects().filter(o=>ids.has(o.id));
  }

  function mapBuilderSelectObject(obj, additive){
    const mb=game.mapBuilder;
    if(!mb||!obj) return;
    if(additive){
      const set=new Set(mb.selectedIds||[]);
      set.has(obj.id)?set.delete(obj.id):set.add(obj.id);
      mb.selectedIds=[...set];
    } else mb.selectedIds=[obj.id];
    mb.contextMenu=null;
  }

  function mapBuilderListForObject(obj) {
    const mb=game.mapBuilder;
    if(!mb||!obj) return null;
    if(obj.kind==='prop') return mb.props;
    if(obj.kind==='area') return mb.areas;
    if(obj.kind==='path') return mb.paths;
    return null;
  }

  function mapBuilderDeleteSelected(){
    const mb=game.mapBuilder;
    if(!mb||!mb.selectedIds?.length) return;
    const ids=new Set(mb.selectedIds);
    mb.props=mb.props.filter(p=>!ids.has(p.id));
    mb.areas=mb.areas.filter(p=>!ids.has(p.id));
    mb.paths=mb.paths.filter(p=>!ids.has(p.id));
    mb.selectedIds=[];
    mb.contextMenu=null;
    mapBuilderAutosave();
  }

  function mapBuilderDuplicateSelected(){
    const mb=game.mapBuilder;
    if(!mb||!mb.selectedIds?.length) return;
    const copies=[];
    mapBuilderSelectedObjects().forEach(obj=>{
      const copy={...obj,id:uid(obj.kind||'prop'),left:obj.left+1,top:obj.top+1};
      if(obj.kind==='prop') mb.props.push(copy);
      else if(obj.kind==='area') mb.areas.push(copy);
      else if(obj.kind==='path') mb.paths.push(copy);
      copies.push(copy.id);
    });
    mb.selectedIds=copies;
    mb.contextMenu=null;
    mapBuilderAutosave();
  }

  function mapBuilderFlipSelected(){
    mapBuilderSelectedObjects().forEach(obj=>{ if(obj.kind==='prop') obj.flipX=!obj.flipX; });
    if(game.mapBuilder) game.mapBuilder.contextMenu=null;
    mapBuilderAutosave();
  }

  function mapBuilderCycleCollisionSelected(){
    const order=['block','decor','pushable','interaction'];
    mapBuilderSelectedObjects().forEach(obj=>{
      if(obj.kind!=='prop') return;
      const current=order.indexOf(obj.collision||'block');
      obj.collision=order[(current+1)%order.length];
    });
    if(game.mapBuilder) game.mapBuilder.contextMenu=null;
    mapBuilderAutosave();
  }

  function mapBuilderMoveSelectedLayer(mode){
    const mb=game.mapBuilder;
    if(!mb||!mb.selectedIds?.length) return;
    const ids=new Set(mb.selectedIds);
    const operate = list => {
      if(!list || !list.some(o=>ids.has(o.id))) return list;
      if(mode==='front') return [...list.filter(o=>!ids.has(o.id)), ...list.filter(o=>ids.has(o.id))];
      if(mode==='back') return [...list.filter(o=>ids.has(o.id)), ...list.filter(o=>!ids.has(o.id))];
      const next=[...list];
      if(mode==='forward'){
        for(let i=next.length-2;i>=0;i--) if(ids.has(next[i].id)&&!ids.has(next[i+1].id)) [next[i],next[i+1]]=[next[i+1],next[i]];
      }
      if(mode==='backward'){
        for(let i=1;i<next.length;i++) if(ids.has(next[i].id)&&!ids.has(next[i-1].id)) [next[i],next[i-1]]=[next[i-1],next[i]];
      }
      return next;
    };
    mb.props=operate(mb.props);
    mb.areas=operate(mb.areas);
    mb.paths=operate(mb.paths);
    mb.contextMenu=null;
    mapBuilderAutosave();
  }

  function mapBuilderSetSelectedScale(scale){
    const selected=mapBuilderSelectedObjects();
    selected.forEach(obj=>{
      if(obj.kind==='prop'){
        obj.baseWidth=obj.baseWidth||obj.width;
        obj.baseHeight=obj.baseHeight||obj.height;
        obj.scale=scale;
        obj.width=obj.baseWidth*scale;
        obj.height=obj.baseHeight*scale;
      } else {
        const cx=obj.left+obj.width/2, cy=obj.top+obj.height/2;
        obj.width=Math.max(.75,obj.width*scale);
        obj.height=Math.max(.75,obj.height*scale);
        obj.left=cx-obj.width/2;
        obj.top=cy-obj.height/2;
      }
      obj.left=mapBuilderClampLeft(obj,obj.left);
      obj.top=mapBuilderClampTop(obj,obj.top);
    });
    if(game.mapBuilder) game.mapBuilder.contextMenu=null;
    mapBuilderAutosave();
  }

  function mapBuilderExport(){
    const payload=mapBuilderPayload();
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='custom_map_layout.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    mapBuilderAutosave();
    addMessage('MAP JSON EXPORTED','#71dd8d',1800);
  }

  function makeViewportDraggable(panel, handle) {
    if (!panel || !handle || panel.dataset.dragReady === '1') return;
    panel.dataset.dragReady = '1';
    let drag = null;
    handle.addEventListener('pointerdown', event => {
      if (event.target.closest('button')) return;
      const rect = panel.getBoundingClientRect();
      drag = { startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top };
      panel.style.left = `${rect.left}px`;
      panel.style.top = `${rect.top}px`;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      handle.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
    });
    handle.addEventListener('pointermove', event => {
      if (!drag) return;
      const maxLeft = Math.max(4, window.innerWidth - panel.offsetWidth - 4);
      const maxTop = Math.max(4, window.innerHeight - panel.offsetHeight - 4);
      const nextLeft = clamp(drag.left + event.clientX - drag.startX, 4, maxLeft);
      const nextTop = clamp(drag.top + event.clientY - drag.startY, 4, maxTop);
      panel.style.left = `${nextLeft}px`;
      panel.style.top = `${nextTop}px`;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      event.preventDefault();
      event.stopPropagation();
    });
    const endDrag = event => { drag = null; handle.releasePointerCapture?.(event.pointerId); };
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
  }

  function mapBuilderControlPanel() {
    if (mapBuilderPanel) return mapBuilderPanel;
    mapBuilderPanel = document.createElement('aside');
    mapBuilderPanel.id = 'map-builder-panel';
    mapBuilderPanel.className = 'map-builder-panel hidden';
    mapBuilderPanel.innerHTML = `
      <header class="map-builder-header">
        <strong>BUILD A MAP</strong>
        <div class="admin-window-controls">
          <button type="button" data-map-builder="back" class="admin-exit" title="Back to game">↩️</button>
          <button type="button" data-map-builder="collapse" class="admin-exit" title="Collapse">—</button>
          <button type="button" data-map-builder="back" class="admin-exit" title="Close">✕</button>
        </div>
      </header>
      <div class="map-builder-body">
        <div class="map-builder-row map-builder-tools">
          <button type="button" data-tool="place" title="Place">📍</button>
          <button type="button" data-tool="erase" title="Erase">🧽</button>
          <button type="button" data-tool="move" title="Move">✋</button>
          <button type="button" data-tool="select" title="Select">⬚</button>
        </div>
        <div class="map-builder-row map-builder-modes">
          <button type="button" data-place-mode="prop" title="Props">📦</button>
          <button type="button" data-place-mode="area" title="Green Area"><span class="green-dot"></span></button>
          <button type="button" data-place-mode="path" title="Yellow Path"><span class="yellow-dot"></span></button>
        </div>
        <div class="map-builder-row">
          <button type="button" data-map-builder="save" title="Save named map">🏷️</button>
          <button type="button" data-map-builder="load" title="Load named map">📂</button>
          <button type="button" data-map-builder="export" title="Export JSON">💾</button>
        </div>
        <div class="map-builder-row">
          <button type="button" data-map-builder="zoomIn" title="Zoom in">➕</button>
          <button type="button" data-map-builder="zoomOut" title="Zoom out">➖</button>
          <button type="button" data-map-builder="rescale" title="Rescale selected">📏</button>
        </div>
        <div class="map-builder-row map-builder-scale-row">
          <button type="button" data-prop-scale="1" title="New props 1x">1×</button>
          <button type="button" data-prop-scale="2" title="New props 2x">2×</button>
          <button type="button" data-prop-scale="3" title="New props 3x">3×</button>
        </div>
        <div class="map-builder-rescale hidden">
          <button type="button" data-rescale="1">1×</button>
          <button type="button" data-rescale="2">2×</button>
          <button type="button" data-rescale="3">3×</button>
        </div>
        <div class="map-builder-hint">Middle mouse pans. Right-click selected objects for layer/delete/duplicate.</div>
        <div class="map-builder-palette"></div>
      </div>`;
    document.body.appendChild(mapBuilderPanel);
    makeViewportDraggable(mapBuilderPanel, mapBuilderPanel.querySelector('.map-builder-header'));
    mapBuilderPanel.addEventListener('click', event => {
      const button = event.target.closest('[data-map-builder], [data-prop], [data-tool], [data-place-mode], [data-prop-scale], [data-rescale]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const mb=game.mapBuilder;
      const action=button.dataset.mapBuilder;
      if(action==='back'){ mapBuilderExitToGame(); return; }
      if(action==='collapse'){ mapBuilderPanel.classList.toggle('collapsed'); refreshMapBuilderPanel(); return; }
      if(!mb) return;
      if(action==='save'){ mapBuilderSaveNamed(); return; }
      if(action==='load'){ mapBuilderLoadNamed(); refreshMapBuilderPanel(); return; }
      if(action==='export'){ mapBuilderExport(); return; }
      if(action==='zoomIn'){ mb.zoom=Math.min(.42,mb.zoom+.025); refreshMapBuilderPanel(); return; }
      if(action==='zoomOut'){ mb.zoom=Math.max(.08,mb.zoom-.025); refreshMapBuilderPanel(); return; }
      if(action==='rescale'){ mapBuilderPanel.querySelector('.map-builder-rescale')?.classList.toggle('hidden'); return; }
      if(button.dataset.rescale){ mapBuilderSetSelectedScale(Number(button.dataset.rescale)); mapBuilderPanel.querySelector('.map-builder-rescale')?.classList.add('hidden'); return; }
      if(button.dataset.propScale){ mb.propScale=Number(button.dataset.propScale); refreshMapBuilderPanel(); return; }
      if(button.dataset.tool){ mb.tool=button.dataset.tool; mb.contextMenu=null; refreshMapBuilderPanel(); return; }
      if(button.dataset.placeMode){ mb.placeMode=button.dataset.placeMode; mb.tool='place'; mb.contextMenu=null; refreshMapBuilderPanel(); return; }
      if(button.dataset.prop){ mb.selected=button.dataset.prop; mb.placeMode='prop'; mb.tool='place'; mb.contextMenu=null; refreshMapBuilderPanel(); return; }
    });
    return mapBuilderPanel;
  }

  function refreshMapBuilderPanel(){
    const panel=mapBuilderControlPanel();
    const mb=game.mapBuilder;
    const body=panel.querySelector('.map-builder-body');
    const paletteEl=panel.querySelector('.map-builder-palette');
    if(!mb||!paletteEl) return;
    panel.querySelectorAll('[data-tool]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.tool===mb.tool));
    panel.querySelectorAll('[data-place-mode]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.placeMode===mb.placeMode));
    panel.querySelectorAll('[data-prop-scale]').forEach(btn=>btn.classList.toggle('selected',Number(btn.dataset.propScale)===(mb.propScale||1)));
    paletteEl.innerHTML='';
    mapBuilderPalette().forEach(key=>{
      const button=document.createElement('button');
      button.type='button';
      button.dataset.prop=key;
      button.title=key;
      button.className=key===mb.selected?'selected':'';
      const file=assetSources[key]?.[0]||'';
      button.innerHTML=`${file?`<img src="${ASSET_PATH}${file}" alt="${key}">`:''}<span>${key}</span>`;
      paletteEl.appendChild(button);
    });
    if(body) body.style.display=panel.classList.contains('collapsed')?'none':'';
  }

  function showMapBuilderPanel(){ const panel=mapBuilderControlPanel(); panel.classList.remove('hidden'); refreshMapBuilderPanel(); }
  function hideMapBuilderPanel(){ if(mapBuilderPanel) mapBuilderPanel.classList.add('hidden'); }

  function mapBuilderPlaceAt(t){
    const mb=game.mapBuilder; if(!mb) return;
    if(mb.placeMode==='path'||mb.placeMode==='area') return;
    const img=images[mb.selected];
    const baseW=mb.selected==='conveyorEnd'?3.05:(mb.selected==='conveyor'?3.05:(mb.selected==='printers'||mb.selected==='bathroom'?9.8:2.4));
    const baseH=img?baseW*(img.height/img.width):1.6;
    const scale=mb.propScale||1;
    mb.props.push({id:uid('prop'),kind:'prop',image:mb.selected,left:Math.round(t.x*2)/2,top:Math.round(t.y*2)/2,width:baseW*scale,height:baseH*scale,baseWidth:baseW,baseHeight:baseH,scale,collision:mb.selected==='cone'?'decor':(mb.selected==='smallbox3'?'pushable':'block')});
    mapBuilderAutosave();
  }

  function mapBuilderClampLeft(obj, left) {
    return clamp(left, 1 - Math.max(.5, obj.width), MAP_W - 1);
  }

  function mapBuilderClampTop(obj, top) {
    return clamp(top, 1 - Math.max(.5, obj.height), MAP_H - 1);
  }

  function mapBuilderHandleContextCommand(x,y){
    const mb=game.mapBuilder;
    if(!mb||!mb.contextMenu) return false;
    if(x<mb.contextMenu.x||x>mb.contextMenu.x+170||y<mb.contextMenu.y||y>mb.contextMenu.y+272) return false;
    const row=Math.floor((y-mb.contextMenu.y)/34);
    if(row===0) mapBuilderMoveSelectedLayer('front');
    else if(row===1) mapBuilderMoveSelectedLayer('forward');
    else if(row===2) mapBuilderMoveSelectedLayer('backward');
    else if(row===3) mapBuilderMoveSelectedLayer('back');
    else if(row===4) mapBuilderDuplicateSelected();
    else if(row===5) mapBuilderDeleteSelected();
    else if(row===6) mapBuilderFlipSelected();
    else if(row===7) mapBuilderCycleCollisionSelected();
    refreshMapBuilderPanel();
    return true;
  }

  function handleMapBuilderClick(x,y){
    const mb=game.mapBuilder; if(!mb) return;
    if(mapBuilderHandleContextCommand(x,y)) return;
  }

  function beginMapBuilderPointer(x,y,pointerId,sourceEvent){
    const mb=game.mapBuilder; if(!mb) return false;

    if(sourceEvent&&sourceEvent.button===1){
      mb.panning={pointerId,startX:x,startY:y,panX:mb.panX,panY:mb.panY};
      mb.contextMenu=null;
      return true;
    }

    if(sourceEvent&&sourceEvent.button===2){
      const t=mapBuilderScreenToTile(x,y);
      const obj=mapBuilderObjectAt(t);
      if(obj&&!(mb.selectedIds||[]).includes(obj.id)) mapBuilderSelectObject(obj,false);
      if((mb.selectedIds||[]).length) mb.contextMenu={x:Math.min(x,W-176),y:Math.min(y,H-276)};
      return true;
    }

    if(mapBuilderHandleContextCommand(x,y)) return true;
    mb.contextMenu=null;

    const t=mapBuilderScreenToTile(x,y);
    if(t.x<0||t.y<0||t.x>MAP_W||t.y>MAP_H) return false;

    if(mb.tool==='place'&&(mb.placeMode==='path'||mb.placeMode==='area')){
      mb.drawing={pointerId,kind:mb.placeMode,startX:t.x,startY:t.y,x:t.x,y:t.y};
      return true;
    }

    if(mb.tool==='place'){ mapBuilderPlaceAt(t); return true; }

    const obj=mapBuilderObjectAt(t);
    if(mb.tool==='erase'){
      if(obj){
        mb.props=mb.props.filter(p=>p.id!==obj.id);
        mb.areas=mb.areas.filter(p=>p.id!==obj.id);
        mb.paths=mb.paths.filter(p=>p.id!==obj.id);
        mb.selectedIds=(mb.selectedIds||[]).filter(id=>id!==obj.id);
        mapBuilderAutosave();
      }
      return true;
    }

    if((mb.tool==='move'||mb.tool==='select')&&obj){
      const handle=mapBuilderHandleAt(obj,t)||'move';
      if(!(mb.selectedIds||[]).includes(obj.id)) mapBuilderSelectObject(obj,!!sourceEvent?.shiftKey);
      const selected=mapBuilderSelectedObjects().map(o=>({obj:o,left:o.left,top:o.top,width:o.width,height:o.height}));
      mb.dragging={pointerId,type:handle==='move'?'move':'resize',handle,startX:t.x,startY:t.y,selected};
      return true;
    }

    if(mb.tool==='select'){
      mb.selectedIds=[];
      mb.marquee={startX:t.x,startY:t.y,x:t.x,y:t.y};
      return true;
    }
    return false;
  }

  function updateMapBuilderPointer(x,y,pointerId){
    const mb=game.mapBuilder; if(!mb) return false;

    if(mb.panning&&mb.panning.pointerId===pointerId){
      mb.panX=mb.panning.panX+x-mb.panning.startX;
      mb.panY=mb.panning.panY+y-mb.panning.startY;
      return true;
    }

    const t=mapBuilderScreenToTile(x,y);

    if(mb.drawing&&mb.drawing.pointerId===pointerId){
      mb.drawing.x=clamp(t.x,0,MAP_W);
      mb.drawing.y=clamp(t.y,0,MAP_H);
      return true;
    }

    if(mb.marquee){ mb.marquee.x=t.x; mb.marquee.y=t.y; return true; }

    if(!mb.dragging||mb.dragging.pointerId!==pointerId) return false;
    const dx=t.x-mb.dragging.startX, dy=t.y-mb.dragging.startY;
    if(mb.dragging.type==='move'){
      mb.dragging.selected.forEach(s=>{
        s.obj.left=mapBuilderClampLeft(s.obj,s.left+dx);
        s.obj.top=mapBuilderClampTop(s.obj,s.top+dy);
      });
    } else {
      const s=mb.dragging.selected[0]; if(!s) return true;
      const obj=s.obj, minSize=.75;
      if(mb.dragging.handle.includes('e')) obj.width=Math.max(minSize,s.width+dx);
      if(mb.dragging.handle.includes('s')) obj.height=Math.max(minSize,s.height+dy);
      if(mb.dragging.handle.includes('w')){ const right=s.left+s.width; obj.left=Math.min(right-minSize,s.left+dx); obj.width=right-obj.left; }
      if(mb.dragging.handle.includes('n')){ const bottom=s.top+s.height; obj.top=Math.min(bottom-minSize,s.top+dy); obj.height=bottom-obj.top; }
      obj.left=mapBuilderClampLeft(obj,obj.left);
      obj.top=mapBuilderClampTop(obj,obj.top);
    }
    return true;
  }

  function endMapBuilderPointer(pointerId){
    const mb=game.mapBuilder; if(!mb) return false;

    if(mb.panning&&mb.panning.pointerId===pointerId){ mb.panning=null; return true; }

    if(mb.drawing&&mb.drawing.pointerId===pointerId){
      const d=mb.drawing;
      const x1=Math.max(0,Math.min(d.startX,d.x)), x2=Math.min(MAP_W,Math.max(d.startX,d.x));
      const y1=Math.max(0,Math.min(d.startY,d.y)), y2=Math.min(MAP_H,Math.max(d.startY,d.y));
      const w=Math.max(.75,x2-x1), h=Math.max(.75,y2-y1);
      if(d.kind==='path') mb.paths.push({id:uid('path'),kind:'path',name:'Clear Path',left:Math.round(x1*2)/2,top:Math.round(y1*2)/2,width:Math.round(w*2)/2,height:Math.round(h*2)/2});
      else mb.areas.push({id:uid('area'),kind:'area',name:'Area Pod',left:Math.round(x1*2)/2,top:Math.round(y1*2)/2,width:Math.round(w*2)/2,height:Math.round(h*2)/2});
      mb.drawing=null;
      mapBuilderAutosave();
      return true;
    }

    if(mb.marquee){
      const x1=Math.min(mb.marquee.startX,mb.marquee.x), x2=Math.max(mb.marquee.startX,mb.marquee.x);
      const y1=Math.min(mb.marquee.startY,mb.marquee.y), y2=Math.max(mb.marquee.startY,mb.marquee.y);
      mb.selectedIds=mapBuilderAllObjects().filter(o=>o.left<=x2&&o.left+o.width>=x1&&o.top<=y2&&o.top+o.height>=y1).map(o=>o.id);
      mb.marquee=null;
      return true;
    }

    if(mb.dragging&&mb.dragging.pointerId===pointerId){ mb.dragging=null; mapBuilderAutosave(); return true; }
    return false;
  }

  function drawMapBuilderObject(o,now){
    const selected=(game.mapBuilder.selectedIds||[]).includes(o.id);
    if(o.kind==='path'){
      ctx.fillStyle='rgba(255,210,84,.26)';
      ctx.fillRect(o.left*TILE,o.top*TILE,o.width*TILE,o.height*TILE);
      ctx.strokeStyle=selected?'#fff4df':'#ffd054';
      ctx.lineWidth=(selected?4:2)/game.mapBuilder.zoom;
      ctx.strokeRect(o.left*TILE,o.top*TILE,o.width*TILE,o.height*TILE);
    } else if(o.kind==='area'){
      ctx.fillStyle='rgba(70,180,90,.22)';
      ctx.fillRect(o.left*TILE,o.top*TILE,o.width*TILE,o.height*TILE);
      if(o.image&&images[o.image]) drawContain(images[o.image],o.left*TILE,o.top*TILE,o.width*TILE,o.height*TILE,.72,true);
      ctx.strokeStyle=selected?'#fff4df':'#58d34c';
      ctx.lineWidth=(selected?4:2)/game.mapBuilder.zoom;
      ctx.strokeRect(o.left*TILE,o.top*TILE,o.width*TILE,o.height*TILE);
      ctx.fillStyle='#c9ffbf';
      ctx.font=`${Math.max(44,15/game.mapBuilder.zoom)}px Trebuchet MS`;
      ctx.fillText(o.name||'Area',(o.left+.3)*TILE,(o.top+.8)*TILE);
    } else {
      if(images[o.image]) drawContain(images[o.image],o.left*TILE,o.top*TILE,o.width*TILE,o.height*TILE,1,true,!!o.flipX);
      ctx.strokeStyle=o.collision==='decor'?'#58d34c':(o.collision==='pushable'?'#ffd054':(o.collision==='interaction'?'#57c7ff':'#ff3949'));
      ctx.lineWidth=(selected?4:2)/game.mapBuilder.zoom;
      ctx.strokeRect(o.left*TILE,o.top*TILE,o.width*TILE,o.height*TILE);
    }
    if(selected){
      const hs=Math.max(10/game.mapBuilder.zoom,28);
      const handles=[
        [o.left,o.top],[o.left+o.width,o.top],[o.left,o.top+o.height],[o.left+o.width,o.top+o.height],
        [o.left+o.width/2,o.top+o.height/2]
      ];
      handles.forEach((h,i)=>{
        ctx.fillStyle=i===4?'#57c7ff':'#fff4df';
        ctx.beginPath();
        ctx.arc(h[0]*TILE,h[1]*TILE,hs,0,Math.PI*2);
        ctx.fill();
        ctx.strokeStyle='#101316';
        ctx.lineWidth=2/game.mapBuilder.zoom;
        ctx.stroke();
      });
    }
  }

  function drawMapBuilder(now){
    const mb=game.mapBuilder; if(!mb) return;
    mb.paths=mb.paths||[]; mb.areas=mb.areas||[]; mb.props=mb.props||[];
    ctx.save();
    ctx.fillStyle='#11161a'; ctx.fillRect(0,0,W,H);
    ctx.translate(mb.panX,mb.panY); ctx.scale(mb.zoom,mb.zoom);
    ctx.fillStyle='#31383d'; ctx.fillRect(0,0,WORLD_W,WORLD_H);
    ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=1/mb.zoom;
    for(let x=0;x<=MAP_W;x++){ ctx.beginPath(); ctx.moveTo(x*TILE,0); ctx.lineTo(x*TILE,WORLD_H); ctx.stroke(); }
    for(let y=0;y<=MAP_H;y++){ ctx.beginPath(); ctx.moveTo(0,y*TILE); ctx.lineTo(WORLD_W,y*TILE); ctx.stroke(); }
    mb.paths.forEach(p=>drawMapBuilderObject(p,now));
    mb.areas.forEach(p=>drawMapBuilderObject(p,now));
    mb.props.forEach(p=>drawMapBuilderObject(p,now));
    if(mb.marquee){
      const x1=Math.min(mb.marquee.startX,mb.marquee.x), x2=Math.max(mb.marquee.startX,mb.marquee.x);
      const y1=Math.min(mb.marquee.startY,mb.marquee.y), y2=Math.max(mb.marquee.startY,mb.marquee.y);
      ctx.strokeStyle='#57c7ff'; ctx.lineWidth=3/mb.zoom; ctx.setLineDash([20/mb.zoom,12/mb.zoom]);
      ctx.strokeRect(x1*TILE,y1*TILE,(x2-x1)*TILE,(y2-y1)*TILE);
      ctx.setLineDash([]);
    }
    if(mb.drawing){
      const x1=Math.min(mb.drawing.startX,mb.drawing.x), x2=Math.max(mb.drawing.startX,mb.drawing.x);
      const y1=Math.min(mb.drawing.startY,mb.drawing.y), y2=Math.max(mb.drawing.startY,mb.drawing.y);
      ctx.fillStyle=mb.drawing.kind==='path'?'rgba(255,210,84,.28)':'rgba(70,180,90,.24)';
      ctx.fillRect(x1*TILE,y1*TILE,(x2-x1)*TILE,(y2-y1)*TILE);
      ctx.strokeStyle=mb.drawing.kind==='path'?'#ffd054':'#58d34c';
      ctx.lineWidth=3/mb.zoom;
      ctx.strokeRect(x1*TILE,y1*TILE,(x2-x1)*TILE,(y2-y1)*TILE);
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle='rgba(10,13,17,.72)';
    roundRect(18,16,610,42,8,true,false);
    ctx.strokeStyle='rgba(255,105,0,.8)';
    roundRect(18,16,610,42,8,false,true);
    ctx.fillStyle='#fff4df'; ctx.font='bold 14px Trebuchet MS';
    ctx.fillText(`Build a Map — ${mb.tool.toUpperCase()} ${mb.placeMode==='prop'?mb.selected:mb.placeMode.toUpperCase()} — ${mb.propScale||1}× — zoom ${Math.round(mb.zoom*100)}%`,34,43);
    if(mb.contextMenu){
      const rows=['Bring front','Move forward','Move backward','Send back','Duplicate','Delete','Flip','Collision'];
      ctx.fillStyle='rgba(12,15,18,.98)';
      roundRect(mb.contextMenu.x,mb.contextMenu.y,170,rows.length*34,8,true,false);
      ctx.strokeStyle='#ff6900';
      roundRect(mb.contextMenu.x,mb.contextMenu.y,170,rows.length*34,8,false,true);
      rows.forEach((label,i)=>{
        ctx.fillStyle='#fff4df'; ctx.font='bold 13px Trebuchet MS';
        ctx.fillText(label,mb.contextMenu.x+12,mb.contextMenu.y+22+i*34);
      });
    }
    ctx.restore();
  }

  function handleAdminAction(action) {
    if (!game.adminMode) return;
    const now = performance.now();
    if (action === 'points') { game.score += 500; addMessage('ADMIN +500 POINTS', '#ffd054', 1400); return; }
    if (action === 'token') { game.tasks.tokens++; addMessage('ADMIN +1 SOP TOKEN', '#ffd054', 1400); return; }
    if (action === 'hearts') { game.health = game.maxHearts; addMessage('ADMIN HEARTS RESTORED', '#ffd054', 1400); return; }
    if (action === 'inventory') { adminReturnToWarehouse(); game.inventoryCooldownUntil = 0; startInventoryBriefing(); return; }
    if (action === 'qs') { adminReturnToWarehouse(); game.qsCooldownUntil = 0; startQSPuzzle(); return; }
    if (action === 'noean') { adminReturnToWarehouse(); game.noEanCooldownUntil = 0; startNoEanBriefing(); return; }
    if (action === 'fire') { adminReturnToWarehouse(); game.fire = null; startFireEvent(now); return; }
    if (action === 'office') { adminReturnToWarehouse(); game.tasks.alm = Math.max(game.tasks.alm, 5); game.tasks.sl = Math.max(game.tasks.sl, 5); game.tasks.email = Math.max(game.tasks.email, 5); game.tasks.workday = Math.max(game.tasks.workday, 5); game.mode = 'office'; game.office = { page: 'menu', selectedType: null, puzzle: null, hotspots: [], result: null }; setGameplayControlsVisible(false); return; }
    if (action === 'alm' || action === 'sl' || action === 'email' || action === 'workday') { adminDirectPuzzle(action); return; }
    if (action === 'sop') { adminReturnToWarehouse(); game.tasks.email = Math.max(game.tasks.email, 5); game.tasks.tokens = Math.max(game.tasks.tokens, 1); game.mode = 'office'; game.office = { page: 'sop', selectedType: null, puzzle: null, hotspots: [], result: null }; setGameplayControlsVisible(false); return; }
    if (action === 'truck') { adminReturnToWarehouse(); game.truck = { until: now + 60000, phase: 'waiting', arriveStarted: now }; addMessage('ADMIN: CARRIER AT DOCK — 60 SECONDS!', '#ff7700', 3000); return; }
    if (action === 'pallet') { adminReturnToWarehouse(); game.player.palletJackUntil = now + PALLET_JACK_DURATION; addMessage('ADMIN: PALLET JACK ACTIVE — 30s', '#ffd054', 2200); return; }
    if (action === 'exitLocked') { adminReturnToWarehouse(); game.tasks = freshTasks(); const pos = destinationPosition(game.zones.exit); game.player.x = pos.x; game.player.y = pos.y; centerCamera(); triggerLevelWin(); return; }
    if (action === 'exitOpen') { adminReturnToWarehouse(); TASK_TYPES.forEach(type => game.tasks.completed[type] = true); const pos = destinationPosition(game.zones.exit); game.player.x = pos.x; game.player.y = pos.y; centerCamera(); triggerLevelWin(); return; }
    if (action === 'gameover') { adminReturnToWarehouse(); game.health = 0; triggerDeath(); return; }
    if (action === 'boss') { adminReturnToWarehouse(); game.level = 3; startBossIntro(); return; }
    if (action === 'editGame') { adminEditGameSave(); return; }
    if (action === 'buildMap') { startMapBuilder(); return; }
    if (action === 'auditAssets') { openAssetAudit(); return; }
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
    if (game.mode === 'bossIntro' || game.mode === 'bossEnter' || game.mode === 'bossCountdown' || game.mode === 'bossFight' || game.mode === 'bossVictory') { updateBoss(dt, now); }
    else if (game.mode === 'play') {
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
    } else if (game.mode === 'noEanBriefing' && now >= game.noEanBriefUntil) {
      createNoEanPuzzle();
    } else if (game.mode === 'noEanPuzzle' && game.noEanPuzzle) {
      updateNoEanPuzzle(dt, now);
      if (game.noEanPuzzle && now >= game.noEanPuzzle.until) finishNoEanPuzzle();
    } else if (game.mode === 'dying') {
      updatePlayerAction(now);
      game.messages = game.messages.filter(message => message.until > now);
    } else if (game.mode === 'transition' && now >= game.transitionUntil) finishTransition();
    updateParticles(dt);
  }

  function onScreenRect(x, y, w, h, margin = DRAW_MARGIN) {
    const z = gameplayZoomFactor ? gameplayZoomFactor() : 1;
    const viewW = W / z;
    const viewH = H / z;
    return x + w >= game.camera.x - margin && x <= game.camera.x + viewW + margin &&
      y + h >= game.camera.y - margin && y <= game.camera.y + viewH + margin;
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
  function drawTintedSpriteFrame(img, cols, rows, col, row, dx, dy, dw, dh, flip = false, alpha = 1, shadow = true, redTint = false) {
    const sw = img.width / cols, sh = img.height / rows;
    if (shadow) drawShadow(dx, dy, dw, dh, .28 * alpha);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.filter = 'brightness(92%) sepia(12%) saturate(112%) hue-rotate(-8deg)';
    if (flip) { ctx.translate(dx + dw, dy); ctx.scale(-1, 1); ctx.drawImage(img, col * sw, row * sh, sw, sh, 0, 0, dw, dh); }
    else ctx.drawImage(img, col * sw, row * sh, sw, sh, dx, dy, dw, dh);
    ctx.restore();
  }

  function drawTintedSpriteFrameContain(img, cols, rows, col, row, cx, cy, maxW, maxH, flip = false, alpha = 1, shadow = true, redTint = false) {
    const sw = img.width / cols, sh = img.height / rows;
    const scale = Math.min(maxW / sw, maxH / sh);
    const dw = sw * scale, dh = sh * scale;
    const dx = cx - dw / 2, dy = cy - dh / 2;
    if (shadow) drawShadow(dx, dy, dw, dh, .28 * alpha);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.filter = 'brightness(92%) sepia(12%) saturate(112%) hue-rotate(-8deg)';
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
        const onPath = tileInsideTemplatePath({ x, y });
        const blocked = game.map[y] && game.map[y][x] === 1;
        ctx.fillStyle = onPath ? 'rgba(255,255,255,.105)' : (blocked ? 'rgba(0,0,0,.145)' : 'rgba(0,0,0,.070)');
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
      const visualX = (conveyor.visualLeft ?? conveyor.left) * TILE;
      const visualW = ((conveyor.visualRight ?? (conveyor.left + conveyor.width)) - (conveyor.visualLeft ?? conveyor.left)) * TILE;
      if (!images.conveyor || !onScreenRect(visualX, (conveyor.top - .2) * TILE, visualW, 2.0 * TILE, 100)) return;

      // V2.51: conveyor.png and conveyor2.png are authored at matching scale.
      // Draw both by width-derived natural aspect at the same top baseline; do not centre the
      // flat conveyor inside a taller fake hitbox, because that visually breaks the seam.
      const pieceW = 3.05 * TILE;
      const pieceH = pieceW * (images.conveyor.height / images.conveyor.width);
      const y = (conveyor.top + CONVEYOR_DRAW_Y_OFFSET) * TILE;
      for (let i = 0; i < conveyor.pieces; i++) {
        const x = (conveyor.left + i * 3.13) * TILE;
        ctx.save();
        ctx.drawImage(images.conveyor, x, y, pieceW, pieceH);
        ctx.restore();
      }
      if (images.conveyorEnd) {
        const endW = pieceW;
        const endH = endW * (images.conveyorEnd.height / images.conveyorEnd.width);
        const machineLeft = conveyor.feederSide === 'left'
          ? (conveyor.left - 3.05) * TILE
          : (conveyor.left + conveyor.width) * TILE;
        if (conveyor.feederSide === 'left') {
          ctx.save();
          ctx.translate(machineLeft + endW, y);
          ctx.scale(-1, 1);
          ctx.drawImage(images.conveyorEnd, 0, 0, endW, endH);
          ctx.restore();
        } else ctx.drawImage(images.conveyorEnd, machineLeft, y, endW, endH);
      }
    });
    game.movingConveyorItems.forEach(item => {
      if (!images[item.image] || !onScreenRect(item.x - 90, item.y - 70, 180, 120, 80)) return;
      const w = (item.collectible ? 126 : 170) * item.size;
      const h = (item.collectible ? 80 : 100) * item.size;
      drawContain(images[item.image], item.x - w / 2, item.y - h * .72, w, h, 1, true, item.dir < 0 && item.collectible);
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
    const drivewayY = z.top * TILE + TILE * 4.45;
    const drivewayH = TILE * 2.65;
    const drivewayX = -TILE * 18;
    const drivewayW = (z.left + z.width + 3) * TILE + TILE * 18;

    ctx.save();
    ctx.fillStyle = 'rgba(246,183,53,.22)';
    ctx.fillRect(drivewayX, drivewayY, drivewayW, drivewayH);
    ctx.strokeStyle = '#f0a623';
    ctx.lineWidth = 7;
    ctx.setLineDash([30, 20]);
    ctx.beginPath();
    ctx.moveTo(drivewayX + 20, drivewayY + drivewayH / 2);
    ctx.lineTo(drivewayX + drivewayW - 20, drivewayY + drivewayH / 2);
    ctx.stroke();
    ctx.restore();

    drawZoneSign('DOCK', z, 330, 82);

    // Bigger office/door building on the far right of the driveway.
    const officeW = TILE * 10.1;
    const officeH = TILE * 3.75;
    const officeX = (z.left + z.width) * TILE - officeW - 12;
    const officeY = z.top * TILE + TILE * 1.08;
    drawContain(images.entrance, officeX, officeY, officeW, officeH, .98, true);

    // Truck is drawn dynamically above the cached warehouse layer when it arrives.
  }
  function drawElevator(now = performance.now()) {
    const e = game.zones.elevator;
    if (!e || !isZoneVisible(e, 140)) return;
    const zoneX = e.left * TILE, zoneY = e.top * TILE;
    const imgW = e.width * TILE * .60;
    const imgH = imgW * .50; // elevator.png is 1000 x 500
    const x = zoneX + (e.width * TILE - imgW) / 2;
    const y = zoneY + (e.height * TILE - imgH) / 2;
    if (images.elevator) drawContain(images.elevator, x, y, imgW, imgH, .98, true);
    else { ctx.save(); ctx.fillStyle = '#b7c0cb'; ctx.fillRect(x, y, imgW, imgH); ctx.restore(); }
    const labels = currentElevatorDestinations(now);
    const flash = elevatorChangeFlashing(now) && Math.floor(now / 250) % 2 === 0;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px Trebuchet MS';
    labels.forEach((dest, i) => {
      if (!dest) return;
      const tx = x + (i + .5) * (imgW / 3);
      const ty = y + imgH * .095;
      const labelMax = imgW / 3 - 10;
      ctx.fillStyle = flash ? '#d3ffb5' : '#58d34c';
      ctx.strokeStyle = 'rgba(0,0,0,.92)';
      ctx.lineWidth = 4;
      const text = dest.label.length > 13 ? dest.label.replace(' / ', '/').replace('QUARANTINE', 'QS').replace('INVENTORY', 'INV.') : dest.label;
      ctx.strokeText(text, tx, ty, labelMax);
      ctx.fillText(text, tx, ty, labelMax);
    });
    if (game.player && pointInsideZone(game.player, e)) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = 'bold 14px Trebuchet MS';
      ctx.fillStyle = '#ffd054';
      ctx.strokeStyle = 'rgba(0,0,0,.95)';
      ctx.lineWidth = 4;
      const help = 'Press SPACE to take the elevator to the listed area';
      const hx = game.player.x;
      const hy = game.player.y - TILE * .72;
      ctx.strokeText(help, hx, hy);
      ctx.fillText(help, hx, hy);
      ctx.restore();
    }
    ctx.restore();
  }
  function drawZonePod(z) {
    // Area pods should not get a dark overlay now; keep only a very faint outline for orientation.
    if (!z || !isZoneVisible(z, 80)) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.055)';
    ctx.lineWidth = 2;
    ctx.strokeRect(z.left * TILE + 4, z.top * TILE + 4, z.width * TILE - 8, z.height * TILE - 8);
    ctx.restore();
  }
  function drawZones() {
    [game.zones.dock, game.zones.quarantine, game.zones.inventory, game.zones.exit, game.zones.elevator, ...game.zones.kitchens].forEach(drawZonePod);
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
    const targetX = z.left * TILE + TILE * 1.1;
    const leftOffMap = z.left * TILE - TILE * 13.5;
    if (!game.truck) return targetX;
    if (game.truck.phase === 'arriving') {
      const progress = clamp((now - game.truck.arriveStarted) / 1250, 0, 1);
      return leftOffMap + (targetX - leftOffMap) * progress;
    }
    if (game.truck.phase === 'leaving') {
      const progress = clamp((now - game.truck.leaveStarted) / 1100, 0, 1);
      return targetX + (leftOffMap - targetX) * progress;
    }
    return targetX;
  }
  function drawLiveTruck(now) {
    if (!game.truck || !images.truck || !isZoneVisible(game.zones.dock, 40)) return;
    const z = game.zones.dock;
    drawContain(images.truck, truckDrawX(now), z.top * TILE + TILE * 4.25, TILE * 9.0, TILE * 3.2, 1, true);
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
      drawContain(images.evilguy, forklift.x - fw / 2, forklift.y - fh * .42, fw, fh, 1, false, forklift.facing === 'right');
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
  function miniMapScreenRect() {
    const maxW = Math.min(210, W * .165);
    const aspect = images.minimap && images.minimap.width ? images.minimap.height / images.minimap.width : 5 / 8;
    const w = maxW;
    const h = w * aspect;
    return { x: W - w - 18, y: 104, w, h };
  }
  function drawMiniMapMarker(x, y, emoji, now, size = 15, flash = true) {
    const alpha = flash ? (.72 + .28 * Math.sin(now / 130)) : 1;
    ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.beginPath(); ctx.fillStyle = emoji === '🧍‍♂️' ? 'rgba(255,208,84,.82)' : 'rgba(255,105,0,.72)';
    ctx.shadowColor = emoji === '🧍‍♂️' ? '#ffd054' : '#ff6900'; ctx.shadowBlur = emoji === '🧍‍♂️' ? 18 : 11;
    ctx.arc(x, y, Math.max(6, size * .48), 0, Math.PI * 2); ctx.fill();
    ctx.font = `${size}px Arial`; ctx.fillText(emoji, x, y);
    if (emoji === '🧍‍♂️') { ctx.font = 'bold 9px Trebuchet MS'; ctx.fillStyle = '#ffd054'; ctx.fillText('YOU', x, y + size * .75); }
    ctx.restore();
  }
  function miniMapPointFromWorld(rect, wx, wy) {
    return { x: rect.x + clamp(wx / WORLD_W, 0, 1) * rect.w, y: rect.y + clamp(wy / WORLD_H, 0, 1) * rect.h };
  }
  function drawMiniMap(now) {
    if (game.mode !== 'play' && game.mode !== 'dying' && game.mode !== 'cockpitHelp') return;
    const r = miniMapScreenRect();
    ctx.save();
    ctx.fillStyle = 'rgba(11,14,18,.72)'; roundRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8, 8, true, false);
    ctx.strokeStyle = '#ff6900'; ctx.lineWidth = 2; roundRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8, 8, false, true);
    if (images.minimap) drawContain(images.minimap, r.x, r.y, r.w, r.h, .88, false);
    else { ctx.fillStyle = 'rgba(180,190,190,.35)'; ctx.fillRect(r.x, r.y, r.w, r.h); }
    const zoneRect = (z, color) => { ctx.fillStyle = color; ctx.fillRect(r.x + (z.left / MAP_W) * r.w, r.y + (z.top / MAP_H) * r.h, (z.width / MAP_W) * r.w, (z.height / MAP_H) * r.h); };
    zoneRect(game.zones.dock, 'rgba(255,105,0,.22)'); zoneRect(game.zones.elevator, 'rgba(80,210,100,.22)');
    if (game.fire) {
      const fp = miniMapPointFromWorld(r, game.fire.x, game.fire.y); drawMiniMapMarker(fp.x, fp.y, '🔥', now, 17, true);
      if (!game.fire.hasExtinguisher && game.fire.station) { const ep = miniMapPointFromWorld(r, game.fire.station.pos.x, game.fire.station.pos.y); drawMiniMapMarker(ep.x, ep.y, '🧯', now, 15, true); }
    }
    if (game.truck) { const tp = miniMapPointFromWorld(r, game.zones.dock.left * TILE + TILE * 2, game.zones.dock.top * TILE + TILE * 5.8); drawMiniMapMarker(tp.x, tp.y, '🚚', now, 15, false); }
    if (game.debugOverlay) [...game.enemies, ...game.forklifts].forEach(enemy => { if (now < enemy.disabledUntil) return; const ep = miniMapPointFromWorld(r, enemy.x, enemy.y); drawMiniMapMarker(ep.x, ep.y, '🤖', now, 10, false); });
    if (game.player) { const pp = miniMapPointFromWorld(r, game.player.x, game.player.y); drawMiniMapMarker(pp.x, pp.y, '🧍‍♂️', now, 18, true); }
    ctx.restore();
  }
  function drawDebugWorldOverlay() {
    if (!game.debugOverlay) return;
    ctx.save(); ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,0,0,.85)';
    game.colliders.forEach(c => ctx.strokeRect(c.left, c.top, c.width, c.height));
    ctx.strokeStyle = 'rgba(0,255,110,.86)';
    [game.zones.dock, game.zones.elevator, game.zones.inventory, game.zones.quarantine, game.zones.exit, ...game.zones.kitchens].filter(Boolean).forEach(z => ctx.strokeRect(z.left * TILE, z.top * TILE, z.width * TILE, z.height * TILE));
    extinguisherStations().forEach(st => ctx.strokeRect(st.pos.x - TILE * .45, st.pos.y - TILE * .45, TILE * .9, TILE * .9));
    ctx.restore();
  }
  function drawScreenDebugBoxes() {
    if (!game.debugOverlay) return;
    ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,255,110,.9)';
    const c = cockpitRect(); ctx.strokeRect(c.x, c.y, c.w, c.h);
    ctx.restore();
  }
  function drawOfficeDebugBoxes() {
    if (!(game.debugOverlay || game.adminMode) || !game.office) return;
    ctx.save(); ctx.lineWidth = 3;
    (game.office.hotspots || []).forEach(h => { ctx.strokeStyle = h.active ? 'rgba(0,255,110,.95)' : 'rgba(0,255,110,.35)'; ctx.strokeRect(h.x, h.y, h.w, h.h); });
    ctx.restore();
  }

  function drawTokenCelebration(now) {
    if (now >= game.tokenFlashUntil) return;
    const remain = clamp((game.tokenFlashUntil - now) / 2200, 0, 1);
    const pulse = .65 + .35 * Math.sin(now / 90);
    ctx.save();
    ctx.globalAlpha = .20 * remain; ctx.fillStyle = '#ff6900'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = remain;
    ctx.textAlign = 'center';
    if (images.scoutIcon) {
      const s = 142 + pulse * 18;
      ctx.shadowColor = '#ff7700'; ctx.shadowBlur = 34;
      drawContain(images.scoutIcon, W / 2 - s / 2, H / 2 - s / 2 - 60, s, s, .58, true);
    }
    ctx.shadowColor = '#ff7700'; ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffd054'; ctx.font = 'bold 26px Trebuchet MS';
    ctx.fillText('Use the SOPScout to help you complete a task in the office!', W / 2, H / 2 + 105);
    ctx.restore();
  }
  function drawHUD(now) {
    ctx.save();
    ctx.fillStyle = 'rgba(12,15,18,.88)'; ctx.fillRect(0, 0, W, 70);
    ctx.strokeStyle = '#ff6900'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 70); ctx.lineTo(W, 70); ctx.stroke();
    ctx.font = 'bold 19px Trebuchet MS'; ctx.fillStyle = '#edc17e'; ctx.fillText(game.playerName.toUpperCase(), 20, 27);
    ctx.font = 'bold 23px Trebuchet MS'; ctx.fillStyle = '#fff3e1'; ctx.fillText(`SCORE  ${formatScore(game.score)}`, 20, 55);
    ctx.fillText(`WAREHOUSE  ${game.level}`, 252, 43);
    for (let i = 0; i < (game.maxHearts || STARTING_MAX_HEARTS); i++) {
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
    ctx.font = 'bold 14px Trebuchet MS'; ctx.fillStyle = '#f0c7a0'; ctx.fillText(`${game.health}/${game.maxHearts}`, 610, 43);
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
    drawMiniMap(now);
    drawScreenDebugBoxes();
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
      ['ARTICLES IN BAD CONDITION', game.stats.quarantineSorts], ['NO EAN SCANS', game.stats.noEanScans], ['FIRES OUT', game.stats.firesExtinguished], ['CNR RETURN', game.stats.returnsProcessed],
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
    const z = gameplayZoomFactor();
    ctx.scale(z, z);
    ctx.translate(-game.camera.x + sx / z, -game.camera.y + sy / z);
    drawStaticWorldView();
    drawLiveTruck(now);
    drawFireWorld(now);
    drawRoute(now);
    drawPickups(now);
    drawEnemies(now);
    drawPlayer(now);
    drawForegroundSceneryOverPlayer();
    drawParticles();
    drawDebugWorldOverlay();
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
    const barRight = W - 178;
    ctx.fillStyle = 'rgba(16,18,22,.88)'; ctx.fillRect(35, 24, barRight - 35, 74);
    ctx.strokeStyle = '#ff6900'; ctx.lineWidth = 3; ctx.strokeRect(35, 24, barRight - 35, 74);
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 30px Trebuchet MS'; ctx.fillText('INVENTORY CHECK', 62, 70);
    ctx.fillStyle = '#ffd054'; ctx.textAlign = 'right'; ctx.fillText(`TIME  ${Math.max(0, Math.ceil((pz.until - now) / 1000))}s`, barRight - 28, 70);
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
    const barRight = W - 178;
    ctx.fillStyle = 'rgba(12,15,18,.91)'; ctx.fillRect(36, 20, barRight - 36, 74);
    ctx.strokeStyle = '#ff6900'; ctx.lineWidth = 3; ctx.strokeRect(36, 20, barRight - 36, 74);
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 30px Trebuchet MS'; ctx.fillText('SPERRLAGER: ITEMS IN BAD CONDITION', 62, 65);
    ctx.textAlign = 'right'; ctx.fillStyle = '#ffd054'; ctx.fillText(`TIME  ${Math.max(0, Math.ceil((pz.until - now) / 1000))}s`, barRight - 28, 65);
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
    types.forEach((type, i) => officeButton(r.x + 24, r.y + 92 + i * 46, r.width - 48, 36, `${TASK_LABELS[type]} — ${taskJobsReady(type)} READY`, `${tokenMode ? 'token-' : 'puzzle-'}${type}`, taskAvailable(type) && (!tokenMode || game.tasks.tokens > 0), buttonStyle));
    officeButton(r.x + r.width - 125, r.y + r.height - 39, 101, 27, 'BACK', 'office-menu', true, buttonStyle);
  }
  function startOfficePuzzle(type) {
    if (taskJobsReady(type) < 1) return;
    const remaining = taskCooldownRemaining(type);
    if (remaining > 0) { addMessage(`${TASK_LABELS[type]} COOLDOWN ${Math.ceil(remaining / 1000)}s`, '#ffd054', 1800); return; }
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
    drawOfficeDebugBoxes();
    ctx.save(); ctx.fillStyle = '#fff4df'; ctx.font = 'bold 16px Trebuchet MS'; ctx.fillText('ESC — LEAVE OFFICE', 22, H - 23); ctx.restore();
    drawTokenCelebration(now);
  }

  function handleOfficeClick(x, y) { if (game.mode !== 'office' || !game.office) return; const spot = game.office.hotspots.find(h => x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h); if (!spot || !spot.active) return; const id = spot.id; if (id === 'leave-office') { game.mode = 'play'; game.office = null; setGameplayControlsVisible(true); music.playGameplay(); return; } if (id === 'office-menu') { game.office.page = 'menu'; game.office.puzzle = null; return; } if (id === 'app-sop') { if (game.tasks.tokens && anyTaskReady()) game.office.page = 'sop'; else addMessage('NO SOP TOKEN OR NO READY TASKS', '#ffd054', 1800); return; } if (id === 'app-jira') { if (taskAvailable('alm') || taskAvailable('sl')) game.office.page = 'jira'; else addMessage('NO JIRA TASKS READY OR COOLDOWN ACTIVE', '#ffd054', 1700); return; } if (id === 'app-email') { if (taskAvailable('email')) startOfficePuzzle('email'); else addMessage('NO EMAIL TASKS READY OR COOLDOWN ACTIVE', '#ffd054', 1700); return; } if (id === 'app-workday') { if (taskAvailable('workday')) startOfficePuzzle('workday'); else addMessage('NO WORKDAY TASKS READY OR COOLDOWN ACTIVE', '#ffd054', 1700); return; } if (id.startsWith('puzzle-')) { startOfficePuzzle(id.slice(7)); return; } if (id.startsWith('token-')) { const type = id.slice(6); if (game.tasks.tokens > 0 && taskJobsReady(type) > 0) { game.tasks.tokens--; completeTaskUnit(type, true, true); addMessage(`SOP SCOUT COMPLETED ${TASK_LABELS[type]}  +50`, '#ff7700', 2300); if (!anyTaskReady() || game.tasks.tokens <= 0) game.office.page = 'menu'; } return; } if (id === 'buy-hint') { buyOfficeHint(); return; } if (id.startsWith('emoji-') && game.office.puzzle) { const emoji = id.slice(6), chosen = game.office.puzzle.selected, idx = chosen.indexOf(emoji); if (idx >= 0) { if (!game.office.puzzle.locked.includes(emoji)) chosen.splice(idx, 1); } else if (chosen.length < 3) chosen.push(emoji); return; } if (id === 'submit-puzzle') submitOfficePuzzle(); }

  function drawBossBackground(victory = false) {
    const img = victory ? (images.bossBgWin || images.bossBg) : images.bossBg;
    if (!img) { ctx.fillStyle = '#1a0e1c'; ctx.fillRect(0,0,W,H); return bossViewport(); }
    const view = bossViewport();
    ctx.drawImage(img, view.cameraX / view.scale, 0, W / view.scale, img.height, 0, 0, W, H);
    return view;
  }
  function drawBossIntro(now) {
    const bz = game.boss;
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,W,H);
    if (!bz) return;
    const elapsed = now - bz.introStart;
    const fade = elapsed < 800 ? elapsed / 800 : 1;
    ctx.save(); ctx.globalAlpha = fade;
    if (images.bossIntro) drawCoverImage(images.bossIntro, 0, 0, W, H); else { ctx.fillStyle = '#111'; ctx.fillRect(0,0,W,H); }
    const story = 'Crazy Ivan has turned himself into an Evil AI Robot and he isnt going to let you get away! Battle him so you can get to the next warehouse!';
    const chars = Math.floor(story.length * (bz.typed || 0));
    ctx.fillStyle = 'rgba(0,0,0,.72)'; ctx.fillRect(70, H - 154, W - 140, 98);
    ctx.strokeStyle = '#ff6900'; ctx.lineWidth = 3; ctx.strokeRect(70, H - 154, W - 140, 98);
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 23px Trebuchet MS'; ctx.textAlign = 'center';
    wrapText(story.slice(0, chars), W/2, H - 116, W - 190, 29);
    ctx.restore();
  }
  function wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(' '); let line = '', yy = y;
    words.forEach(word => { const test = line ? line + ' ' + word : word; if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, yy); line = word; yy += lineHeight; } else line = test; });
    if (line) ctx.fillText(line, x, yy);
  }
  function drawBossActor(now, view, victory = false) {
    const bz = game.boss; if (!bz) return;
    const b = bz.boss;
    if (victory && Math.floor((now - bz.victoryStart) / 130) % 2 === 0 && now - bz.victoryStart < 1600) return;
    const sx = b.x * view.scale - view.cameraX, sy = b.y;
    // Ivan's source art is square. Always draw him into a square target so he is never squeezed tall/narrow.
    const size = Math.max(b.w, b.h);
    if (images.bossIvan) tintDraw(images.bossIvan, sx - size/2, sy - size/2, size, size, (now < b.hitFlashUntil ? .55 : 1), false, true);
    else { ctx.font = '140px Arial'; ctx.textAlign='center'; ctx.fillText('🤖', sx, sy); }
  }
  function drawBossPlayer(now, view) {
    const bz = game.boss; if (!bz) return;
    const x = bz.player.x * view.scale - view.cameraX, y = bz.player.y;
    if (bz.phase === 'victory') {
      if (images.bossCarWin) drawContain(images.bossCarWin, x - 310, H - 330, 620, 360, 1, true);
      if (images.actionssprite) {
        const frame = Math.floor(((now - bz.victoryStart) / 140) % 10);
        const f = frame < 5 ? frame : 9 - frame;
        const sw = images.actionssprite.width / 5;
        const sh = images.actionssprite.height / 3;
        const dh = 430;
        const dw = dh * (sw / sh);
        spriteFrame(images.actionssprite, 5, 3, f, 1, x - dw / 2, H - 515, dw, dh, false, 1, true);
      }
      return;
    }
    const alpha = now < (bz.player.invulnerableUntil || 0) && Math.floor(now/100)%2 === 0 ? .55 : 1;
    const carSize = 306; // 15% smaller than previous 360
    if (images.bossCar) tintDraw(images.bossCar, x - carSize/2, y - 213, carSize, carSize, alpha, false, true);
    else { ctx.font = '94px Arial'; ctx.textAlign='center'; ctx.fillText('🚜', x, y); }
  }
  function drawBossProjectiles(now, view) {
    const bz = game.boss; if (!bz) return;

    bz.fireballs.forEach(f => {
      const x = f.x * view.scale - view.cameraX;
      ctx.save();
      const pulse = 1 + Math.sin((now - f.born) / 110) * 0.08;
      const drawW = f.w * pulse;
      const drawH = f.h * pulse;
      const radius = Math.max(drawW, drawH) * .74;
      const glow = ctx.createRadialGradient(x, f.y, 0, x, f.y, radius);
      glow.addColorStop(0, 'rgba(255, 241, 130, .95)');
      glow.addColorStop(.22, 'rgba(255, 160, 0, .82)');
      glow.addColorStop(.55, 'rgba(255, 72, 0, .42)');
      glow.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, f.y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (images.fireball) {
        ctx.shadowColor = '#ff6a00';
        ctx.shadowBlur = 24;
        drawContain(images.fireball, x - drawW/2, f.y - drawH/2, drawW, drawH, 1, false);
      } else {
        ctx.font='64px Arial';
        ctx.textAlign='center';
        ctx.fillText('🔥', x, f.y);
      }
      ctx.restore();
    });

    bz.shoes.forEach(s => {
      const x = s.x * view.scale - view.cameraX;

      if (s.exploded) return;

      const drop = Math.max(0, s.groundY - s.y);
      const shadowScale = s.landed ? 1 : Math.max(.35, 1 - drop / 220);
      ctx.save();
      ctx.globalAlpha = s.landed ? .28 : .16 + shadowScale * .18;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(x, s.groundY + 10, 20 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(x, s.y);
      ctx.rotate(s.spin);
      ctx.shadowColor = s.canHitBoss ? '#ffd054' : '#ff9a3b';
      ctx.shadowBlur = s.impact ? 22 : 14;
      ctx.globalAlpha = Math.min(1, Math.max(.38, (now - s.born) / 120));
      const scale = s.impact ? 1.16 : 1;
      if (images[s.image]) tintDraw(images[s.image], -s.w*scale/2, -s.h*scale/2, s.w*scale, s.h*scale, 1, false, true);
      else { ctx.font='50px Arial'; ctx.textAlign='center'; ctx.fillText('👟',0,0); }
      ctx.restore();
    });

    (bz.effects || []).forEach(fx => {
      const x = fx.x * view.scale - view.cameraX;
      const p = Math.min(1, Math.max(0, (now - fx.start) / fx.dur));

      if (fx.type === 'shoeExplosion') {
        const grow = p < .5 ? (0.55 + p * 2.2) : (1.65 - (p - .5) * 1.8);
        const alpha = p < .6 ? 1 : 1 - ((p - .6) / .4);
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        const radius = 32 + 72 * grow;
        const flash = ctx.createRadialGradient(x, fx.y, 0, x, fx.y, radius);
        flash.addColorStop(0, 'rgba(255,255,240,.96)');
        flash.addColorStop(.22, 'rgba(255,214,84,.92)');
        flash.addColorStop(.55, 'rgba(255,100,0,.55)');
        flash.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = flash;
        ctx.beginPath();
        ctx.arc(x, fx.y, radius, 0, Math.PI * 2);
        ctx.fill();

        const drawSize = 86 + 90 * grow;
        if (images.fireball) {
          drawContain(images.fireball, x - drawSize/2, fx.y - drawSize/2, drawSize, drawSize, 1, false);
        }
        ctx.restore();
      }

      if (fx.type === 'shoeImpact' || fx.type === 'playerImpact') {
        const alpha = 1 - p;
        const radius = 58 * (0.65 + p);
        ctx.save();
        ctx.globalAlpha = alpha;
        const flash = ctx.createRadialGradient(x, fx.y, 0, x, fx.y, radius);
        flash.addColorStop(0, 'rgba(255,255,220,1)');
        flash.addColorStop(.22, fx.type === 'playerImpact' ? 'rgba(255,80,80,.95)' : 'rgba(255,220,120,.92)');
        flash.addColorStop(.58, fx.type === 'playerImpact' ? 'rgba(255,0,0,.28)' : 'rgba(255,140,0,.22)');
        flash.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = flash;
        ctx.beginPath();
        ctx.arc(x, fx.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }
  function drawBossUI(now) {
    const bz = game.boss; if (!bz) return;
    ctx.save(); ctx.fillStyle='rgba(12,15,18,.78)'; roundRect(24, 74, 195, 168, 12, true, false); ctx.strokeStyle='#ff6900'; ctx.lineWidth=2; roundRect(24,74,195,168,12,false,true);
    ctx.fillStyle='#fff4df'; ctx.font='bold 20px Trebuchet MS'; ctx.fillText('SCOUT', 46, 111); ctx.fillText('HEARTS', 46, 153); ctx.fillText('♥'.repeat(Math.max(0,game.health)), 46, 194);
    ctx.fillStyle='rgba(12,15,18,.78)'; roundRect(W-228, 74, 204, 250, 12, true, false); ctx.strokeStyle='#ff6900'; roundRect(W-228,74,204,250,12,false,true);
    ctx.fillStyle='#ff9a3b'; ctx.font='bold 20px Trebuchet MS'; ctx.fillText('CRAZY IVAN', W-205, 112);
    for (let i=0;i<bz.boss.maxHearts;i++) { ctx.globalAlpha = i < bz.boss.hearts ? 1 : .20; ctx.fillStyle='#ed4959'; ctx.font='bold 28px Trebuchet MS'; ctx.fillText('♥', W-126, 156 + i*28); }
    ctx.globalAlpha=1;
    if (game.mode === 'bossCountdown') { ctx.textAlign='center'; ctx.fillStyle='#ffd054'; ctx.font='bold 78px Trebuchet MS'; ctx.fillText(String(bz.countdown), W/2, H/2); }
    if (game.mode === 'bossFight') { ctx.textAlign='center'; ctx.fillStyle='#fff4df'; ctx.font='bold 18px Trebuchet MS'; ctx.fillStyle='rgba(0,0,0,.50)'; roundRect(W/2 - 455, H - 74, 910, 38, 12, true, false); ctx.fillStyle='#fff4df'; ctx.fillText('Drive closer and throw offline stock at Ivan to get him away from the exit!', W/2, H-49); }
    ctx.restore();
  }
  function drawBossVictorySummary(now) {
    const bz = game.boss; if (!bz || !bz.summaryUntil) return;
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,.58)';
    ctx.fillRect(0,0,W,H);

    const boardW=1040, boardH=430, x=(W-boardW)/2, y=86;
    if (images.score) {
      ctx.drawImage(images.score, x, y, boardW, boardH);
    } else {
      ctx.fillStyle='rgba(255,214,132,.96)';
      roundRect(x,y,boardW,boardH,18,true,false);
      ctx.strokeStyle='#5b2c09'; ctx.lineWidth=4;
      roundRect(x,y,boardW,boardH,18,false,true);
    }

    ctx.fillStyle='#1d1006';
    ctx.textAlign='center';
    ctx.shadowColor='rgba(255,245,190,.55)';
    ctx.shadowBlur=2;
    ctx.font='bold 40px Trebuchet MS';
    ctx.fillText('CRAZY IVAN DEFEATED!', W/2, y+106);

    const rewardY = y + 165;
    const spin = (now - bz.victoryStart) / 300;
    ctx.fillStyle='#1d1006';
    ctx.font='bold 30px Trebuchet MS';
    ctx.fillText('You won an extra heart!', W/2, rewardY);

    const heartOffset = 320;
    ctx.save();
    ctx.translate(W/2 - heartOffset, rewardY - 8);
    ctx.rotate(spin);
    ctx.fillStyle='#ed1d3b';
    ctx.font='bold 64px Trebuchet MS';
    ctx.textAlign='center';
    ctx.fillText('♥', 0, 20);
    ctx.restore();

    ctx.save();
    ctx.translate(W/2 + heartOffset, rewardY - 8);
    ctx.rotate(-spin);
    ctx.fillStyle='#ed1d3b';
    ctx.font='bold 64px Trebuchet MS';
    ctx.textAlign='center';
    ctx.fillText('♥', 0, 20);
    ctx.restore();

    ctx.fillStyle='#1d1006';
    ctx.textAlign='center';
    ctx.font='bold 24px Trebuchet MS';
    ctx.fillText(`Max hearts now: ${game.maxHearts}`, W/2, y+220);
    ctx.font='bold 22px Trebuchet MS';
    ctx.fillText(`Ivan hearts removed: ${game.stats.bossHits} / 6`, W/2, y+270);
    ctx.fillText(`Offline stock hits: ${game.stats.bossShoeHits} × 1 heart`, W/2, y+320);
    ctx.restore();
  }
  function drawBoss(now) {
    if (game.mode === 'bossIntro') { drawBossIntro(now); return; }
    const bz = game.boss; if (!bz) return;
    const victory = bz.phase === 'victory';
    const view = drawBossBackground(victory);
    if (!victory) drawBossProjectiles(now, view);
    if (!victory || now - bz.victoryStart < 1600) drawBossActor(now, view, victory);
    if (victory && now - bz.victoryStart < 1700) { ctx.save(); ctx.globalAlpha = .55 * (1 - (now - bz.victoryStart)/1700); ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H); ctx.restore(); }
    drawBossPlayer(now, view);
    if (!victory) drawBossUI(now);
    drawBossVictorySummary(now);
  }

  function draw(now) {
    if (game.mode !== 'play' && game.mode !== 'cockpitHelp') hideFireOverlay();
    ctx.clearRect(0, 0, W, H);
    if (game.mode === 'title' || game.mode === 'intro') drawTitle();
    else if (game.mode === 'play' || game.mode === 'dying' || game.mode === 'cockpitHelp') drawWorld(now);
    else if (game.mode === 'mapBuilder') drawMapBuilder(now);
    else if (game.mode === 'inventoryBriefing') drawInventoryBriefing();
    else if (game.mode === 'inventoryPuzzle') drawInventoryPuzzle(now);
    else if (game.mode === 'office') drawOffice(now);
    else if (game.mode === 'qsPuzzle') drawQSPuzzle(now);
    else if (game.mode === 'noEanBriefing') drawNoEanBriefing(now);
    else if (game.mode === 'noEanPuzzle') drawNoEanPuzzle(now);
    else if (game.mode === 'transition') drawTransition(now);
    else if (game.mode === 'bossIntro' || game.mode === 'bossEnter' || game.mode === 'bossCountdown' || game.mode === 'bossFight' || game.mode === 'bossVictory') drawBoss(now);
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
  if (fullscreenModeButton) fullscreenModeButton.addEventListener('click', requestFullscreenMode);
  continueSavedButton.addEventListener('click', continueSavedShift);
  continueShiftButton.addEventListener('click', continueAfterDeath);
  restartShiftButton.addEventListener('click', () => {
    gameoverUI.classList.add('hidden');
    startNewShift();
  });
  downloadScoreButton.addEventListener('click', downloadScoreCard);
  closeCockpitHelpButton.addEventListener('click', closeCockpitHelp);
  muteToggleButton.addEventListener('click', () => { synth.init(); if (game.mode === 'title') startTitleMusic(); volumePanel.classList.toggle('hidden'); });
  muteToggleButton.addEventListener('dblclick', event => { event.preventDefault(); event.stopPropagation(); synth.init(); toggleAudio(); volumePanel.classList.add('hidden'); });
  displayToggleButton.addEventListener('click', () => { toggleDisplayMode(); });
  volumeSlider.addEventListener('input', event => { synth.init(); setVolume(event.target.value); if (game.mode === 'title') startTitleMusic(); });
  unstuckButton.addEventListener('click', () => { synth.init(); emergencyMove(); });
  directionControls.forEach(button => {
    const code = button.dataset.key;
    const press = event => {
      event.preventDefault();
      if (game.mode !== 'play' && game.mode !== 'bossFight') return;
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
    if (game.mode !== 'play' && game.mode !== 'bossFight') return;
    synth.init();
    if (game.mode === 'bossFight') {
      throwBossShoe(performance.now());
    } else if (!keys.has('Space')) {
      handleActionPress(performance.now());
    }
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

  if (adminCollapseButton) adminCollapseButton.addEventListener('click', event => { event.stopPropagation(); adminPanel.classList.toggle('collapsed'); });
  (function setupAdminPanelDrag() {
    const header = adminPanel.querySelector('.admin-header');
    if (!header) return;
    makeViewportDraggable(adminPanel, header);
  })();


  titleUI.addEventListener('pointerdown', () => { synth.init(); startTitleMusic(); });
  nameInput.addEventListener('focus', () => { synth.init(); startTitleMusic(); });
  canvas.addEventListener('contextmenu', event => {
    if (game.mode === 'mapBuilder') {
      event.preventDefault();
      const { x, y } = canvasPoint(event);
      const mb = game.mapBuilder;
      const t = mapBuilderScreenToTile(x, y);
      const obj = mapBuilderObjectAt(t);
      if (obj && !(mb.selectedIds || []).includes(obj.id)) mapBuilderSelectObject(obj, false);
      if ((mb.selectedIds || []).length) mb.contextMenu = { x: Math.min(x, W - 176), y: Math.min(y, H - 276) };
    }
  });
  canvas.addEventListener('click', event => {
    const { x, y } = canvasPoint(event);
    if (game.mode === 'inventoryPuzzle') handleInventoryClick(x, y);
    else if (game.mode === 'office') handleOfficeClick(x, y);
    else if (game.mode === 'play') { const c = cockpitRect(); if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) openCockpitHelp(); }
  });
  canvas.addEventListener('pointerdown', event => {
    if (game.mode === 'mapBuilder') {
      const { x, y } = canvasPoint(event);
      if (beginMapBuilderPointer(x, y, event.pointerId, event)) {
        canvas.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      }
      return;
    }
    if (game.mode !== 'qsPuzzle') return;
    const { x, y } = canvasPoint(event);
    if (handleQSPointerDown(x, y, event.pointerId)) {
      synth.init();
      canvas.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    }
  });
  canvas.addEventListener('pointermove', event => {
    if (game.mode === 'mapBuilder') {
      const { x, y } = canvasPoint(event);
      if (updateMapBuilderPointer(x, y, event.pointerId)) event.preventDefault();
      return;
    }
    if (game.mode !== 'qsPuzzle') return;
    const { x, y } = canvasPoint(event);
    if (handleQSPointerMove(x, y, event.pointerId)) event.preventDefault();
  });
  const releaseQSPointer = event => {
    if (game.mode === 'mapBuilder') {
      if (endMapBuilderPointer(event.pointerId)) {
        canvas.releasePointerCapture?.(event.pointerId);
        event.preventDefault();
      }
      return;
    }
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
    if (prevent && (game.mode === 'play' || game.mode === 'qsPuzzle' || game.mode === 'bossFight' || game.mode === 'bossCountdown' || game.mode === 'noEanPuzzle' || game.mode === 'noEanBriefing' || game.mode === 'mapBuilder')) event.preventDefault();
    if (event.code === 'Escape' && game.mode === 'title') {
      const now = performance.now();
      game.adminEscapeCount = now <= game.adminEscapeUntil ? game.adminEscapeCount + 1 : 1;
      game.adminEscapeUntil = now + 4000;
      if (game.adminEscapeCount >= 5) enterAdminMode();
      return;
    }
    if (event.code === 'Space' && event.ctrlKey && event.shiftKey) { game.debugOverlay = !game.debugOverlay; event.preventDefault(); addMessage(game.debugOverlay ? 'DEBUG ZONES ON' : 'DEBUG ZONES OFF', '#71dd8d', 1400); return; }
    if (document.activeElement === nameInput && game.mode === 'title') return;
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
    if (event.code === 'Escape' && game.mode === 'mapBuilder') { mapBuilderExitToGame(); return; }
    if (event.code === 'Escape' && game.mode === 'office') {
      game.mode = 'play'; game.office = null; setGameplayControlsVisible(true); music.playGameplay(); return;
    }
    if (event.code === 'Escape' && game.mode === 'qsPuzzle') {
      finishQSPuzzle();
      return;
    }
    if (event.code === 'Escape' && (game.mode === 'noEanPuzzle' || game.mode === 'noEanBriefing')) {
      finishNoEanPuzzle();
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
    if (game.mode === 'mapBuilder') {
      if (game.mapBuilder && (event.code === 'Equal' || event.code === 'NumpadAdd')) { game.mapBuilder.zoom = Math.min(.42, game.mapBuilder.zoom + .025); refreshMapBuilderPanel(); }
      if (game.mapBuilder && (event.code === 'Minus' || event.code === 'NumpadSubtract')) { game.mapBuilder.zoom = Math.max(.08, game.mapBuilder.zoom - .025); refreshMapBuilderPanel(); }
      if (event.code === 'KeyE') mapBuilderExport();
      return;
    }
    if (game.mode === 'noEanPuzzle') {
      const now = performance.now();
      if ((event.code === 'ArrowUp' || event.code === 'KeyW') && !keys.has(event.code)) noEanAdvanceAngle(game.noEanPuzzle, 1, now);
      if ((event.code === 'ArrowDown' || event.code === 'KeyS') && !keys.has(event.code)) noEanAdvanceAngle(game.noEanPuzzle, -1, now);
      if (event.code === 'Enter') { resetNoEanScanner(); event.preventDefault(); return; }
      if (event.code === 'Space' && !keys.has('Space')) { fireNoEanScanner(now); actionControl.classList.add('active'); }
    }
    if (event.code === 'Space' && game.mode === 'bossFight' && !keys.has('Space')) { event.preventDefault(); synth.init(); throwBossShoe(performance.now()); actionControl.classList.add('active'); }
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

  
  if (typeof globalThis !== 'undefined') {
    globalThis.__sopTest = {
      game,
      keys,
      startBossIntro,
      updateBossIntro,
      updateBossEnter,
      updateBossCountdown,
      updateBossFight,
      throwBossShoe,
      damageBoss,
      triggerDeath
    };
  }

  loadAssets().catch(error => {
    loading.textContent = `Asset loading failed: ${error.message}`;
    console.error(error);
  });
})();
