const gameState = {
  player: {
    name: "Tosh Raka",
    health: 100,
    magicka: 50,
    stamina: 75,
    weapon: "Tsaesci Katana",
    location: "Po Tun Highlands",
    xp: 0,
    level: 1,
    nextLevel: 100
  },
  previousLocations: [],
  mode: "exploring", // "exploring", "combat", "dialog"
  combat: null,
  dialog: null,
  quests: {
    "Lotus Valley": {
      started: false,
      completed: false,
      rewardGiven: false
    }
  },
  locations: {
    "Po Tun Highlands": {
      connections: ["Frostwall Pass", "Ka'ishi Ruins", "Lotus Valley"],
      description: "Rolling hills dotted with ancient Po Tun temples."
    },
    "Frostwall Pass": {
      connections: ["Kamal Ice Fortress", "Po Tun Highlands"],
      description: "A treacherous, icy mountain path."
    },
    "Ka'ishi Ruins": {
      connections: ["Dragon Shrine", "Po Tun Highlands"],
      description: "Crumbling ruins echoing with forgotten magic."
    },
    "Lotus Valley": {
      connections: ["Po Tun Highlands", "Moon-Sugar Fields"],
      description: "A serene valley filled with blooming lotuses."
    },
    "Moon-Sugar Fields": {
      connections: ["Lotus Valley"],
      description: "Fields of sweet, shimmering moon-sugar cane."
    },
    "Kamal Ice Fortress": {
      connections: ["Frostwall Pass"],
      description: "The icy stronghold of the Kamal invaders."
    },
    "Dragon Shrine": {
      connections: ["Ka'ishi Ruins"],
      description: "A sacred site where dragons once communed."
    }
  },
  gameOver: false
};

const locationEncounters = {
  "Frostwall Pass": { name: "Kamal Frost Warrior", health: 80, attack: 15 },
  "Ka'ishi Ruins": { name: "Tsaesci Serpent Guard", health: 65, attack: 20 },
  "Kamal Ice Fortress": { name: "Kamal Warlord", health: 120, attack: 25 },
  "Moon-Sugar Fields": { name: "Bandit Skirmisher", health: 50, attack: 10 }
};

// Level up logic
Object.assign(gameState.player, {
  levelUp() {
    this.xp -= this.nextLevel;
    this.level++;
    this.nextLevel = Math.floor(this.nextLevel * 1.5);
    this.health += 20;
    this.magicka += 10;
    this.stamina += 15;
  }
});

function gainXP(amount) {
  gameState.player.xp += amount;
  if (gameState.player.xp >= gameState.player.nextLevel) {
    gameState.player.levelUp();
    addMessage(`Reached Level ${gameState.player.level}!`);
  }
}

gameState.messageQueue = [];
function addMessage(msg) {
  gameState.messageQueue.push(msg);
}

// --- WORD WRAPPING FUNCTION ---
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const lines = text.split('\n');
  let currentY = y;
  lines.forEach(line => {
    let words = line.split(' ');
    let currentLine = '';
    for (let n = 0; n < words.length; n++) {
      let testLine = currentLine + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(currentLine, x, currentY);
        currentLine = words[n] + ' ';
        currentY += lineHeight;
      } else {
        currentLine = testLine;
      }
    }
    ctx.fillText(currentLine, x, currentY);
    currentY += lineHeight;
  });
  return currentY;
}

// Render function
function renderWorld() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // Game Over check
  if (gameState.mode === "gameover" || gameState.gameOver) {
    drawGameOver(ctx);
    return;
  }

  // Parchment gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#f9f1dc');
  grad.addColorStop(1, '#e6d9a3');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#4a2e00';
  ctx.textBaseline = 'top';

  if (gameState.mode === "combat" && gameState.combat) {
    drawCombat(ctx);
    return;
  }
  if (gameState.mode === "dialog" && gameState.dialog) {
    drawDialog(ctx);
    return;
  }

  // Exploration mode rendering
  const loc = gameState.locations[gameState.player.location];

  ctx.font = '24px MedievalSharp, Arial, serif';
  ctx.fillText(`Current Location: ${gameState.player.location}`, 20, 20);

  ctx.font = '18px MedievalSharp, Arial, serif';
  wrapText(ctx, loc.description, 20, 60, 760, 24);

  ctx.font = '20px MedievalSharp, Arial, serif';
  loc.connections.forEach((locName, index) => {
    ctx.fillText(`${index + 1}. Travel to ${locName}`, 20, 110 + index * 30);
  });

  // Show "0. Go Back" option if possible
  if (gameState.previousLocations.length > 0) {
    ctx.fillText(`0. Go Back`, 20, 110 + loc.connections.length * 30);
  }

  // Player stats (clamp health to 0 for display)
  ctx.font = '16px MedievalSharp, Arial, serif';
  ctx.fillText(`Health: ${Math.max(0, gameState.player.health)}`, 600, 20);
  ctx.fillText(`Magicka: ${gameState.player.magicka}`, 600, 45);
  ctx.fillText(`Stamina: ${gameState.player.stamina}`, 600, 70);
  ctx.fillText(`XP: ${gameState.player.xp} / ${gameState.player.nextLevel}`, 600, 95);
  ctx.fillText(`Level: ${gameState.player.level}`, 600, 120);

  // Show quest hints/messages if any
  if (gameState.messageQueue.length > 0) {
    ctx.fillStyle = '#333';
    ctx.fillRect(10, 520, 780, 70);
    ctx.fillStyle = '#f9f1dc';
    ctx.font = '16px MedievalSharp, Arial, serif';
    const messagesToShow = gameState.messageQueue.slice(-3);
    let y = 525;
    messagesToShow.forEach((msg) => {
      y = wrapText(ctx, msg, 20, y, 760, 20);
    });
  }

  // Check quests (for dialog triggers)
  checkQuest();
}

// Combat drawing
function drawCombat(ctx) {
  const combat = gameState.combat;
  ctx.fillStyle = '#4a2e00';
  ctx.font = '24px MedievalSharp, Arial, serif';
  let y = wrapText(ctx, combat.message, 40, 40, 700, 28);

  ctx.font = '20px MedievalSharp, Arial, serif';
  ctx.fillText(`Your Health: ${Math.max(0, gameState.player.health)}`, 40, y + 30);
  ctx.fillText(`${combat.enemy.name} Health: ${Math.max(0, combat.enemy.health)}`, 40, y + 70);

  ctx.font = '18px MedievalSharp, Arial, serif';
  ctx.fillText('[A] Attack', 40, y + 130);
  ctx.fillText('[F] Flee', 40, y + 160);
}

// Dialog drawing
function drawDialog(ctx) {
  const dialog = gameState.dialog;
  ctx.fillStyle = '#4a2e00';}
