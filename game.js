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
  const VERSION = 'V2.60';
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
    inventorybg: ['inventory.png', 'inventory.jpg', 'inventorycheck.jpg', 'meeting.jpg'],
    table: ['table.png'], table2: ['table2.png'], table3: ['table3.png'], zalandologo: ['zalandologo.png'],
    smallbox: ['smallbox.png'], smallbox2: ['smallbox2.png'], smallbox3: ['smallbox3.png'],
    shoe: ['shoe.png'], shoe1: ['shoe1.png'], shoe2: ['shoe2.png'], shoe3: ['shoe3.png'],
    title: ['title.png'], truck: ['truck.png'], walksprite: ['walksprite.png'],
    officeBase: ['baseoffice.jpg'], officeFrame: ['officeframe.webp'], officeMenu: ['pcmenu.jpg'],
    palletjack: ['palletjack.png'], clothesDamaged: ['clothesdamaged.png'], slbox: ['slbox.png'],
    qsBg: ['qs2.jpg', 'qs2.png'], fireExtinguisher: ['fire.png'], fireAnim: ['fire.webp'],
    elevator: ['elevator.png'], conveyor: ['conveyor.png'], conveyorEnd: ['conveyor2.png'], conveyorBox: ['box.png'],
    jiraScreen: ['jira.jpg'], errorScreen: ['error.jpg'], scoutIcon: ['scoticon.png'],
    noEanWelcome: ['welcome3.jpg'], noEanBg: ['conveyor.jpg', 'conveyor.png', 'noeanbg.jpg', 'noeanbg.png', 'scannerbg.jpg', 'scannerbg.png', 'conveyorbg.jpg', 'conveyorbg.png'],
    scanner: ['scanner.png'], scannerCorrect: ['scanner2.png'], scannerWrong: ['scanner3.png'],
    noEanShoes: ['shoes.webp'], noEanTops: ['tops.webp'], noEanPants: ['pants.webp'],
    minimap: ['minimap.webp', 'minimap.png', 'minimap.jpg'],
    bossIntro: ['it2.jpg'], bossBg: ['bossbg.jpg'], bossBgWin: ['bossbg1.jpg'], bossIvan: ['boss1.webp'], fireball: ['fireball.webp'], fireballSheet: ['fireball_sheet.png'], bossCarSheet: ['car_battle_sheet.png'], bossCar: ['car.webp'], bossCarWin: ['car.png']
  };
  const optionalAssets = new Set(['cone', 'qsObj1', 'qsObj2', 'table', 'table2', 'table3', 'zalandologo', 'smallbox', 'smallbox2', 'smallbox3', 'shoe', 'shoe1', 'shoe2', 'shoe3', 'officeBase', 'officeFrame', 'officeMenu', 'jiraScreen', 'errorScreen', 'scoutIcon', 'palletjack', 'clothesDamaged', 'slbox', 'qsBg', 'fireExtinguisher', 'fireAnim', 'elevator', 'conveyor', 'conveyorEnd', 'conveyorBox', 'noEanWelcome', 'noEanBg', 'scanner', 'scannerCorrect', 'scannerWrong', 'noEanShoes', 'noEanTops', 'noEanPants', 'minimap', 'printers', 'bathroom', 'bossIntro', 'bossBg', 'bossBgWin', 'bossIvan', 'fireball', 'fireballSheet', 'bossCarSheet', 'bossCar', 'bossCarWin']);
  const musicFiles = {
    startup: 'startup.mp3', gameplay: 'gameplay.mp3', gameplay1: 'gameplay1.mp3', gameplay2: 'gameplay2.mp3', gameplay3: 'gameplay3.mp3',
    inventory: 'inventory.mp3', gameover: 'gameover.mp3', winner: 'winner.mp3', kitchen: 'kitchen.mp3',
    welcome: 'welcome.mp3', factory: 'factory.mp3', evilrobot: 'evilrobot.mp3', boss: 'boss.mp3', success: 'success.mp3'
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
    { images: ['exit.jpg'], music: 'winner', text: 'Complete the required tasks and make your way to the exit, so we can send you to the next warehouse!' },
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
    // Locked V2.37 layout skeleton: outer walk ring, two vertical lane spines, and two horizontal lane spines.
    return [
      { left: 1, top: 1, width: 78, height: 3 },
      { left: 1, top: 46, width: 78, height: 3 },
      { left: 1, top: 1, width: 3, height: 48 },
      { left: 76, top: 1, width: 3, height: 48 },
      { left: 24, top: 1, width: 4, height: 48 },
      { left: 52, top: 1, width: 4, height: 48 },
      { left: 1, top: 15, width: 78, height: 4 },
      { left: 1, top: 31, width: 78, height: 4 }
    ];
  }
  function templateAreaSlots() {
    // Dock and elevator are fixed. Other pods rotate between the named areas.
    return [
      { id: 'topMiddle', left: 30, top: 4, width: 14, height: 8 },
      { id: 'topRight', left: 60, top: 4, width: 14, height: 8 },
      { id: 'middleLeft', left: 6, top: 20, width: 14, height: 8 },
      { id: 'middleRight', left: 60, top: 20, width: 14, height: 8 },
      { id: 'bottomLeft', left: 6, top: 36, width: 14, height: 8 },
      { id: 'bottomMiddle', left: 30, top: 36, width: 14, height: 8 },
      { id: 'bottomRight', left: 60, top: 36, width: 14, height: 8 }
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
  function protectedPropRects() {
    const rects = [];
    const add = item => {
      if (!item) return;
      const base = item.collisionRect || item;
      if (base && Number.isFinite(base.left) && Number.isFinite(base.top) && Number.isFinite(base.width) && Number.isFinite(base.height)) rects.push(paddedRect(base, .30));
    };
    (game.zoneProps || []).forEach(add);
    (game.conveyors || []).forEach(c => rects.push({ left: c.visualLeft ?? c.left, top: (c.top || 0) - .35, width: (c.visualRight ?? (c.left + c.width)) - (c.visualLeft ?? c.left), height: 1.85 }));
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
  function scatterConeHazards() {
    if (!images.cone) return;
    const groupsTarget = game.level >= 5 ? 36 : 20;
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
    const slots = shuffle(templateAreaSlots());
    const take = () => slots.shift();

    const invSlot = take();
    const qsSlot = take();
    const exitSlot = take();
    const kitchenSlot = take();
    const kitchen2Slot = take();

    game.zones = {
      dock: zone(4, 4, 14, 8, 'DOCK', 7, 6),
      elevator: zone(33, 20, 14, 8, 'ELEVATOR', 7, 5),
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
      if (img) addZoneProp(img, { left: z.left + .8, top: z.top + .8, width: z.width - 1.6, height: z.height - 1.6 }, { collisionInset: .12 });
      if (!shelfImages.length) return;
      // Build a clearer wall of boxes/shelves around each filler pod, with left/right walk gaps.
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
    // Main vertical lane guides.
    [24, 52].forEach(x => {
      for (let y = 6; y <= 43; y += 5) {
        if (Math.abs(y - 15) < 2 || Math.abs(y - 31) < 2) continue;
        guidePoints.push({ x: x - 1.0, y }, { x: x + 3.2, y });
      }
    });
    // Main horizontal lane guides.
    [15, 31].forEach(y => {
      for (let x = 7; x <= 72; x += 7) {
        if (Math.abs(x - 24) < 3 || Math.abs(x - 52) < 3) continue;
        guidePoints.push({ x, y: y - 1.0 }, { x, y: y + 3.3 });
      }
    });
    guidePoints.forEach((p, i) => {
      const rect = { left: p.x, top: p.y, width: .75, height: .75 };
      if (withinMap(rect) && !tileInAnyZone({ x: Math.floor(p.x), y: Math.floor(p.y) }, 0)) {
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
    stopOneShots();
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
    game.boss = {
      phase: 'intro', introStart: performance.now(), cameraX: 0, countdown: 3,
      player: { x: W / 2, y: H + 220, speed: 430, invulnerableUntil: performance.now() + 2300 },
      boss: { x: 1000, y: -350, w: 560, h: 560, vx: 135, hearts: 6, maxHearts: 6, hitFlashUntil: 0, dead: false },
      fireballs: [], shoes: [], nextFireAt: performance.now() + 3600, nextVoiceAt: performance.now() + randInt(10000, 15000),
      startedAt: performance.now(), victoryStart: 0, rewardShown: false, summaryUntil: 0, fade: 1, startingMaxHearts: game.maxHearts
    };
    music.play('boss', true);
  }
  function startBossFight() {
    if (!game.boss) return;
    game.mode = 'bossFight';
    game.boss.phase = 'fight';
    game.boss.startedAt = performance.now();
    game.boss.nextFireAt = performance.now() + 1600;
    music.play('boss', true);
  }
  function bossViewport() {
    const bg = images.bossBg || images.bossBgWin;
    const bgW = bg ? bg.width : 2000;
    const bgH = bg ? bg.height : 576;
    const scale = H / bgH;
    const scaledW = bgW * scale;
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
  function damageBoss(amount, source) {
    const bz = game.boss;
    const b = bz && bz.boss;
    if (!b || b.dead || bz.phase !== 'fight') return false;
    const now = performance.now();

    let applied = 0;
    if (source === 'ram') {
      if (now < (b.ramHitUntil || 0)) return false;
      applied = 2;
      b.ramHitUntil = now + 950;
      game.stats.bossRams++;
    } else if (source === 'shoe') {
      if (now < (b.shoeHitUntil || 0)) return false;
      applied = 1;
      b.shoeHitUntil = now + 120;
      game.stats.bossShoeHits++;
    } else {
      return false;
    }

    b.hearts = Math.max(0, b.hearts - applied);
    b.hitFlashUntil = now + 420;
    game.stats.bossHits += applied;
    burst(b.x, b.y, '#ff3c3c', source === 'ram' ? 36 : 24);
    synth.hurt();
    addMessage(source === 'ram' ? 'RAM HIT!  -2 IVAN HEARTS' : 'OFFLINE STOCK HIT!  -1 IVAN HEART', '#ffd054', 900);
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
    bz.nextShoeAt = now + 260;
    const keysPool = shoeImageKeys();
    const size = 90;
    const startY = bz.player.y - 96;
    bz.shoes.push({
      x: bz.player.x,
      y: startY,
      prevY: startY,
      w: size,
      h: size,
      vy: -920,
      spin: 0,
      born: now,
      image: choice(keysPool.length ? keysPool : ['shoe'])
    });
    synth.jump();
    addMessage('OFFLINE STOCK THROWN!', '#ffd054', 550);
    return true;
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
    bz.boss.y = -350 + (H * .37 + 350) * eased;
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
    if (!bz || bz.phase !== 'fight' || bz.boss.dead) return;
    let dx = 0, dy = 0;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) dx--;
    if (keys.has('ArrowRight') || keys.has('KeyD')) dx++;
    if (keys.has('ArrowUp') || keys.has('KeyW')) dy--;
    if (keys.has('ArrowDown') || keys.has('KeyS')) dy++;
    if (dx || dy) { const l = Math.hypot(dx, dy); dx /= l; dy /= l; }
    bz.player.x = clamp(bz.player.x + dx * bz.player.speed * dt, 80, 1920);
    bz.player.y = clamp(bz.player.y + dy * bz.player.speed * dt, H * .58, H - 45);
    const b = bz.boss;
    b.x += b.vx * dt;
    if (b.x < 360 || b.x > 1640) { b.vx *= -1; b.x = clamp(b.x, 360, 1640); }
    b.y = H * .37 + Math.sin(now / 900) * 22;
    if (now >= bz.nextVoiceAt) { playOneShot(choice(['robot1.mp3','robot2.mp3','robot3.mp3']), .62); bz.nextVoiceAt = now + randInt(10000, 15000); }
    if (!b.dead && bz.phase === 'fight' && b.hearts > 0 && now >= bz.nextFireAt) {
      // Fireball starts from Ivan's chest cannon area.
      bz.fireballs.push({ x: b.x, y: b.y - b.h * .06, w: 104, h: 104, vx: (bz.player.x - b.x) * .58, vy: 255, born: now });
      bz.nextFireAt = now + randInt(1400, 2300);
    }
    bz.fireballs.forEach(f => {
      const x = f.x * view.scale - view.cameraX;
      ctx.save();
      const radius = Math.max(f.w, f.h) * .68;
      const glow = ctx.createRadialGradient(x, f.y, 0, x, f.y, radius);
      glow.addColorStop(0, 'rgba(255, 236, 74, .88)');
      glow.addColorStop(.28, 'rgba(255, 95, 0, .55)');
      glow.addColorStop(.62, 'rgba(255, 0, 0, .20)');
      glow.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, f.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (images.fireballSheet) {
        ctx.save();
        ctx.shadowColor='#ff5b00';
        ctx.shadowBlur=18;
        const frame = Math.floor(f.frameFloat || ((now - f.born) / 55)) % 17;
        drawTintedSpriteFrameContain(images.fireballSheet, 17, 1, frame, 0, x, f.y, f.w, f.h, false, 1, false, false);
        ctx.restore();
      } else if (images.fireball) {
        ctx.save();
        ctx.shadowColor='#ff5b00';
        ctx.shadowBlur=18;
        drawContain(images.fireball, x - f.w/2, f.y - f.h/2, f.w, f.h, 1, false);
        ctx.restore();
      } else {
        ctx.font='44px Arial';
        ctx.textAlign='center';
        ctx.fillText('🔥', x, f.y);
      }
    });
    bz.shoes.forEach(s => {
      const x = s.x * view.scale - view.cameraX;
      ctx.save();
      ctx.translate(x, s.y);
      ctx.rotate(s.spin);
      ctx.shadowColor = '#ffd054';
      ctx.shadowBlur = 12;
      if (images[s.image]) tintDraw(images[s.image], -s.w/2, -s.h/2, s.w, s.h, 1, false, true);
      else { ctx.font='64px Arial'; ctx.textAlign='center'; ctx.fillText('👟',0,0); }
      ctx.restore();
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
    if (game.mode === 'bossFight') { ctx.textAlign='center'; ctx.fillStyle='#fff4df'; ctx.font='bold 18px Trebuchet MS'; ctx.fillStyle='rgba(0,0,0,.50)'; roundRect(W/2 - 455, H - 74, 910, 38, 12, true, false); ctx.fillStyle='#fff4df'; ctx.fillText('Ram Ivan with the forklift or throw offline stock at him to get him away from the exit!', W/2, H-49); }
    ctx.restore();
  }
  function drawBossVictorySummary(now) {
    const bz = game.boss; if (!bz || !bz.summaryUntil) return;
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,.58)';
    ctx.fillRect(0,0,W,H);

    const boardW=1040, boardH=590, x=(W-boardW)/2, y=36;
    if (images.score) {
      // Stretch score.png to the full text panel; do not contain-fit it, because the board art has to cover all lines.
      ctx.drawImage(images.score, x, y, boardW, boardH);
    } else {
      ctx.fillStyle='rgba(255,214,132,.96)';
      roundRect(x,y,boardW,boardH,18,true,false);
      ctx.strokeStyle='#5b2c09'; ctx.lineWidth=4;
      roundRect(x,y,boardW,boardH,18,false,true);
    }

    ctx.textAlign='center';
    ctx.shadowColor='rgba(255,245,190,.55)';
    ctx.shadowBlur=2;
    ctx.fillStyle='#1d1006';
    ctx.font='bold 40px Trebuchet MS';
    ctx.fillText('CRAZY IVAN DEFEATED!', W/2, y+140);

    const spin = (now - bz.victoryStart) / 300;
    ctx.save();
    ctx.translate(W/2, y+220);
    ctx.rotate(spin);
    ctx.fillStyle='#ed1d3b';
    ctx.font='bold 68px Trebuchet MS';
    ctx.fillText('♥',0,0);
    ctx.restore();

    ctx.fillStyle='#1d1006';
    ctx.font='bold 30px Trebuchet MS';
    ctx.fillText('You won an extra heart!', W/2, y+300);
    ctx.font='bold 25px Trebuchet MS';
    ctx.fillText(`Max hearts now: ${game.maxHearts}`, W/2, y+360);
    ctx.font='bold 23px Trebuchet MS';
    ctx.fillText(`Ivan hearts removed: ${game.stats.bossHits} / 6`, W/2, y+415);
    ctx.fillText(`Rams: ${game.stats.bossRams} × 2 hearts`, W/2, y+465);
    ctx.fillText(`Offline stock hits: ${game.stats.bossShoeHits} × 1 heart`, W/2, y+515);
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
    if (game.mode !== 'play' && game.mode !== 'bossFight') return;
    synth.init();
    if (game.mode === 'bossFight') throwBossShoe(performance.now());
    else if (!keys.has('Space')) handleActionPress(performance.now());
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
      stopOneShots();
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

  loadAssets().catch(error => {
    loading.textContent = `Asset loading failed: ${error.message}`;
    console.error(error);
  });
})();
