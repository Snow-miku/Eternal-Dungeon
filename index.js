//import "p5.play"

class Character {
  constructor(name, image) {
    this.name = name;
    this.image = image;
  }
}

const characters = [];

let battleMusic, winMusic, loseBGM, regAtkSFX, critAtkSFX, logo, backgroundImg, battleSceneImg;
let gokuImg, jerryImg, tomImg, tomDefeatedImg; //characters
let pressStart2P; //fonts

function preload() {
  colors = loadJSON("media/color-palette.json");
  battleMusic = loadSound("media/battle.mp3");
  winMusic = loadSound("media/win.mp3");
  loseBGM = loadSound("media/lose.mp3");
  regAtkSFX = loadSound("media/attack-normal.mp3");
  critAtkSFX = loadSound("media/attack-critical.mp3");

  // image load
  hit = loadImage("media/hit.png");
  backgroundImg = loadImage("media/background.png");
  battleSceneImg = loadImage("media/battleScene.jpg");

  //character image load
  gokuImg = loadImage("media/goku.png");
  jerryImg = loadImage("media/jerry.png");
  tomImg = loadImage("media/tom-normal.png");
  tomDefeatedImg = loadImage("media/tom-defeated.png");

  // fonts load
  pressStart2P = loadFont("fonts/PressStart2P-Regular.ttf");
}

const textSize = 40;
const playDamageMultiplier = 1;
const bossDmgMultiplier = 1;
let x, y;
let startButton, charButton, attackButton, resumeButton, restartButton;
let winPrompt, losePrompt, bossDmgDisplay, playerDmgDisplay, selectTitle;
let hpBar1, hpBar2, hpBar1Outline, hpBar2Outline, char1, char2, bossHitSprite, playerHitSprite;

let hp1, hp1Cur, hp1Width, hp1WidthCur;
let hp2, hp2Cur, hp2Width, hp2WidthCur;
let timer, seconds;
let gameStarted, attackAllowed, isSelectView; //the state of the game
let isCritical;

let playerLevel, bossLevel;

let input, inputButton;

let charGroup;

// Create a new canvas to the browser size
function setup() {
  createCanvas(windowWidth, windowHeight);

  //get the center of the page
  x = width / 2;
  y = height / 2;

  //set the proper volume
  battleMusic.setVolume(0.1);
  regAtkSFX.setVolume(0.4);
  critAtkSFX.setVolume(0.2);
  winMusic.setVolume(0.3);
  loseBGM.setVolume(0.6);

  textFont(pressStart2P);

  //Initialize the Start Game Button
  startButton = genButton("Start Game");
  startButton.y = y * 5/4;

  //Initialize the Start Game Button
  charButton = genButton("Characters");
  charButton.y = y * 6/4;

  //Initialize the Attack Button
  attackButton = genButton("Attack");
  attackButton.y = y * 7/4;
  attackButton.w = width * 1/4;

  //Initialize the Resume Button
  resumeButton = genButton("Next Level");
  //restartButton = genButton("Retry");

  logo = genText("ETERNAL DUNGEON");
  logo.y = y * 1/2;

  winPrompt = genText("YOU WIN!!");
  losePrompt = genText("YOU LOSE :(");

  selectTitle = genText("PLAYER SELECT");
  selectTitle.y = y * 1/4;

  levelPrompt = genText(`LEVEL: ${bossLevel}`);
  levelPrompt.y = y * 1/8;

  bossDmgDisplay = genText("");
  bossDmgDisplay.x = x * 1.5;
  bossDmgDisplay.y = y * 0.5;

  playerDmgDisplay = genText("");
  playerDmgDisplay.x = x * 0.5;
  playerDmgDisplay.y = y * 0.5;

  hpBar1 = genHealthBar(false);
  hpBar1.x = x * 0.5;
  hpBar2 = genHealthBar(false);
  hpBar2.x = x * 1.5;
  hpBar1Outline = genHealthBar(true);
  hpBar1Outline.x = x * 0.5;
  hp1Width = hpBar1.width;
  hpBar2Outline = genHealthBar(true);
  hpBar2Outline.x = x * 1.5;
  hp2Width = hpBar2.width;

  //resize character Imgs
  gokuImg.resize(width/3.5, 0);
  tomImg.resize(width/3, 0);
  jerryImg.resize(width/4, 0);

  char1 = genCharacter(gokuImg);
  char1.x = x * 0.5;
  char2 = genCharacter(tomImg);
  char2.x = x * 1.5;
  char2.addImage("defeated", tomDefeatedImg);
  hit.resize(width/3.5, 0);
  bossHitSprite = genCharacter(hit);
  bossHitSprite.x = x * 1.5;
  playerHitSprite = genCharacter(hit);
  playerHitSprite.x = x * 0.5;

  let goku = new Character("goku", gokuImg);
  let tom = new Character("tom", tomImg);
  let jerry = new Character("jerry", jerryImg);
  characters.push(goku);
  characters.push(tom);
  characters.push(jerry);

  charGroup = new Group();
  charGroup.x = (i) => (i+1) * width/6;
	charGroup.y = y * 3/4;
  charGroup.height = height/8;
  charGroup.width = height/8;
  charGroup.amount = characters.length;
  charGroup.text = (i) => characters[i].name;
  charGroup.strokeWeight = 6
  charGroup.strokeColor = color(0, 0, 0, 0);

  initGame();
}

// On window resize, update the canvas size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  //get the center of the page
  x = width / 2;
  y = height / 2;
  //console.log(`width: ${width}, height: ${height}`);
}

function draw() {
  background(battleSceneImg);
  if (!gameStarted) {
    background(backgroundImg);
    //startButton Click Behavior
    if (!isSelectView) {
      if (startButton.mouse.pressing()) {
        startButton.shapeColor = colors.grey;
      }
      if (startButton.mouse.released()) {
          toggleGameView();
      }
      if (mouse.released()) {
        startButton.shapeColor = color(0, 0, 0, 0);
      }
      //charButton Click Behavior
      if (charButton.mouse.pressing()) {
        charButton.shapeColor = colors.grey;
      }
      if (charButton.mouse.released()) {
        toggleSelectView();
      }
      if (mouse.released()) {
        charButton.shapeColor = color(0, 0, 0, 0);
      }
    } else {
      for (let i = 0; i < charGroup.length; i++) {
        if (charGroup[i].mouse.released()) {
          console.log("im here for clicking");
          char1.img = characters[i].image;
          toggleGameView();
        }
      }
    }

    if (hp2Cur <= 0 || hp1Cur <= 0) {
      if (resumeButton.mouse.pressing()) {
        resumeButton.shapeColor = colors.grey;
      }
      if (resumeButton.mouse.released()) {
        goNext();
      }
      if (mouse.released()) {
        resumeButton.shapeColor = color(0, 0, 0, 0);
      }
    }
  }
  if (gameStarted) {
    if (attackAllowed) {
      if (attackButton.mouse.pressing()) {
        attackButton.textColor = colors.pink4;
        attackButton.shapeColor = colors.pink4;
      }
      if (attackButton.mouse.released()) {
        playerAttack();
      }
      if (mouse.released()) {
        attackButton.textColor = colors.blue1;
        attackButton.shapeColor = color(0, 0, 0, 0);
      }
    }
    if (hp2Cur <= 0) {
      winGame();
    }
    if (hp1Cur <= 0) {
      loseGame();
    }
  }
}

function toggleGameView() {
  console.log("Game view");

  startGame();
}

function playerAttack() {
  attackAllowed = false;
  bossHitSprite.visible = true;
  bossDmgDisplay.visible = true;
  setTimeout(() => {
    bossHitSprite.visible = false;
  }, 100);
  setTimeout(() => {
    bossDmgDisplay.visible = false;
  }, 500);

  //check critical
  isCritical = random(0, 100) <= 25;
  isCritical ? critAtkSFX.play() : regAtkSFX.play();
  //damage calculation
  let damage = Math.round(damageCalculate(playerLevel, isCritical) * playDamageMultiplier);
  //damage = 100; //for test purpose
  bossDmgDisplay.text = `- ${damage} ${isCritical ? "CRIT" : ""}`;
  hp2Cur -= damage;
  console.log(`Player dealts ${damage} damage. Boss current hp: ${hp2Cur}.`);

  //hp calculation
  hp2WidthCur = hp2Width * (hp2Cur / hp2);
  hpBar2.x = 1.5 * x - (hp2Width - hp2WidthCur)/2;
  //console.log(`healthbar x position: ${hpBar2.x}.`);
  hpBar2.width = hp2WidthCur;

  if (hp2Cur > 0) {
    setTimeout(() => {
      bossAttack();
    }, 1500);
  }
}

function bossAttack() {
  playerHitSprite.visible = true;
  playerDmgDisplay.visible = true;
  setTimeout(() => {
    playerHitSprite.visible = false;
  }, 100);
  setTimeout(() => {
    playerDmgDisplay.visible = false;
  }, 500);

  //check critical
  isCritical = random(0, 100) <= 25;
  isCritical ? critAtkSFX.play() : regAtkSFX.play();
  let damage = Math.round(damageCalculate(bossLevel, isCritical) * bossDmgMultiplier);
  playerDmgDisplay.text = `- ${damage} ${isCritical ? "CRIT" : ""}`;
  hp1Cur -= damage;
  console.log(`Boss dealts ${damage} damage. Player current hp: ${hp1Cur}.`);

  //hp calculation
  hp1WidthCur = hp1Width * (hp1Cur / hp1);
  hpBar1.x = 0.5 * x - (hp1Width - hp1WidthCur)/2;
  //console.log(`healthbar x position: ${hpBar2.x}.`);
  hpBar1.width = hp1WidthCur;

  setTimeout(() => {
    attackAllowed = true;
  }, 1200);
}

function winGame() {
  console.log("YOU WIN!!");

  resumeButton.text = "Next Level"
  battleMusic.stop();
  clearInterval(timer);//stop the timer
  console.log(`Spent ${seconds/100} seconds.`)

  winPrompt.visible = true;
  setTimeout(() => {
    char2.img = "defeated";
  }, 150);
  setTimeout(() => {
    winMusic.play();
  }, 1000);

  gameStarted = false;
  attackAllowed = false;

  setTimeout(() => {
    winPrompt.visible = false;
    resumeButton.visible = true;
  }, 3000);
}

function loseGame() {
  console.log("YOU LOST :(");

  resumeButton.text = "RETRY"
  battleMusic.stop();
  clearInterval(timer);//stop the timer
  console.log(`Spent ${seconds/100} seconds.`)

  losePrompt.visible = true;
  setTimeout(() => {
    loseBGM.play();
  }, 1000);

  gameStarted = false;
  attackAllowed = false;

  playerLevel = 0;
  bossLevel = 0;

  setTimeout(() => {
    losePrompt.visible = false;
    resumeButton.visible = true;
  }, 3000);
}

function initGame() {
  console.log("init game");
  seconds = 0;

  //switch visibility
  invisibilizeAll();
  logo.visible = true;
  startButton.visible = true;
  charButton.visible = true;

  //switch game state
  gameStarted = false;
  attackAllowed = false
  isSelectView = false;

  //reset game levels
  playerLevel = 1;
  bossLevel = 1;

  //restore character health;
  updateCharStats();
}

function startGame() {
  console.log("Game Started");

  gameStarted = true;
  isSelectView = false;

  //switch visibility
  invisibilizeAll();

  attackButton.visible = true;
  hpBar1.visible = true;
  hpBar2.visible = true;
  hpBar1Outline.visible = true;
  hpBar2Outline.visible = true;
  char1.visible = true;
  char2.visible = true;
  char2.img = "char";
  levelPrompt.text = `LEVEL: ${bossLevel}`;
  levelPrompt.visible = true;

  updateCharStats();
  battleMusic.loop();
  setTimeout(() => {
    attackAllowed = true;

    //start timer
    console.log("Start Timer.");
    timer = setInterval(function() {
      seconds++;
    }, 10);
  }, 3800)
}

function updateCharStats() {
  hp1 = hpCalculate(playerLevel);
  hp1Cur = hp1; //restore full hp
  hpBar1.width = hp1Width;
  hp1WidthCur = hp1Width;
  hpBar1.x = 0.5 * x;

  hp2 = hpCalculate(bossLevel);
  hp2Cur = hp2;
  hpBar2.width = hp2Width;
  hp2WidthCur = hp2Width;
  hpBar2.x = 1.5 * x;
}

function toggleSelectView() {
  console.log("Character Selection");

  invisibilizeAll();
  selectTitle.visible = true;
  charGroup.visible = true;

  //switch game state
  gameStarted = false;
  attackAllowed = false;
  isSelectView = true;
}

//Behavuir after clicking resume game
function goNext() {
  muteAll();

  playerLevel++;
  bossLevel++;

  startGame();
}

/*
-------------------- HELPER FUNCTION --------------------
*/

//clear everything on the board
function invisibilizeAll() {
  startButton.visible = false;
  charButton.visible = false;
  attackButton.visible = false;
  resumeButton.visible = false;
  //Button.visible = false;
  charGroup.visible = false;

  logo.visible = false;
  levelPrompt.visible = false;
  winPrompt.visible = false;
  losePrompt.visible = false;
  bossDmgDisplay.visible = false;
  selectTitle.visible = false;

  hpBar1.visible = false;
  hpBar2.visible = false;
  hpBar1Outline.visible = false;
  hpBar2Outline.visible = false;
  char1.visible = false;
  char2.visible = false;
  bossHitSprite.visible = false;
  playerHitSprite.visible = false;
}

//stop all music
function muteAll() {
  battleMusic.stop();
  winMusic.stop();
  loseBGM.stop();
  regAtkSFX.stop();
  critAtkSFX.stop();
}

function hpCalculate(level) {
  let hp = Math.floor(0.01 * (2 * 68 + 31 + floor(0.25)) * level) + level + 10;
  console.log(`Calculated hp is ${hp}`);
  return hp;
}

function damageCalculate(level, critical) {
  let basicDamage = ((2 * level / 5 + 2) / 50 + 2) * Math.round(random(85, 100))/100;
  if (critical) {
    return Math.round(basicDamage * 1.5);
  } else {
    return Math.round(basicDamage);
  }
}

//create Sprite for buttons
function genButton(text) {
  let button = new Sprite();
  button.textSize = textSize;
  button.text = text;
  button.w = textWidth("Characters") * 4;
  button.h = textSize * 1.5;
  button.textColor = colors.blue1;
  button.shapeColor = color(0, 0, 0, 0);
  button.strokeColor = colors.blue1;
  button.strokeWeight = 4;
  //button.collider = "none"
  return button;
}

//create Sprite object for health bars
function genHealthBar(outline) {
  let hp = new Sprite();
  if (outline) {
    hp.shapeColor = color(0, 0, 0, 0);
    hp.strokeColor = colors.pink1;
  } else {
    hp.shapeColor = colors.green1;
    hp.strokeColor = color(0, 0, 0, 0);
  }
  hp.strokeWeight = 6;
  hp.y = y * 1/4;
  hp.h = 20;
  hp.width = x / 2;
  hp.collider = "none";
  hp.layer = 1;
  return hp;
}

//create Sprite object for characters
function genCharacter(link) {
  let char = new Sprite();
  char.addImage("char", link);
  char.collider = "none";
  char.layer = 0;
  return char;
}

//create Sprite object for characters
function genText(text) {
  let msg = new Sprite();
  msg.textSize = 60;
  msg.text = text;
  msg.textColor = colors.pink4;
  msg.shapeColor = color(0, 0, 0, 0);
  msg.strokeColor = color(0, 0, 0, 0);
  msg.strokeWeight = 10;
  msg.collider = "none"; // set the colliding space to zero
  msg.layer = 10;
  return msg;
}