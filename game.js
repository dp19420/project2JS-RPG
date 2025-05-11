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
  combat: null,      // { enemy: {...}, message: "" }
  dialog: null,      // { message: "", options: [{key:'Y', text:'Yes'}, ...] }
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
  gameOver: false // <-- New property for game over state
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

// Message queue for combat/dialog feedback
gameState.messageQueue = [];
function addMessage(msg) {
  gameState.messageQueue.push(msg);
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
  ctx.fillText(loc.description, 20, 60);

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
    messagesToShow.forEach((msg, i) => {
      ctx.fillText(msg, 20, 525 + i * 20);
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
  ctx.fillText(combat.message, 40, 40);

  ctx.font = '20px MedievalSharp, Arial, serif';
  ctx.fillText(`Your Health: ${Math.max(0, gameState.player.health)}`, 40, 100);
  ctx.fillText(`${combat.enemy.name} Health: ${Math.max(0, combat.enemy.health)}`, 40, 140);

  ctx.font = '18px MedievalSharp, Arial, serif';
  ctx.fillText('[A] Attack', 40, 200);
  ctx.fillText('[F] Flee', 40, 230);
}

// Dialog drawing
function drawDialog(ctx) {
  const dialog = gameState.dialog;
  ctx.fillStyle = '#4a2e00';
  ctx.font = '22px MedievalSharp, Arial, serif';
  ctx.fillText(dialog.message, 40, 40);

  ctx.font = '18px MedievalSharp, Arial, serif';
  dialog.options.forEach((opt, i) => {
    ctx.fillText(`[${opt.key}] ${opt.text}`, 40, 100 + i * 30);
  });
}

// Game Over drawing
function drawGameOver(ctx) {
  // Dim the background
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.font = 'bold 48px MedievalSharp, Arial, serif';
  ctx.fillStyle = "#e74c3c";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", ctx.canvas.width / 2, ctx.canvas.height / 2 - 40);

  ctx.font = '24px MedievalSharp, Arial, serif';
  ctx.fillStyle = "#f9f1dc";
  ctx.fillText("Press [R] to Restart", ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);

  ctx.textAlign = "left"; // Reset alignment for other renders
}

// Start combat mode
function startCombat(enemy) {
  gameState.mode = "combat";
  gameState.combat = {
    enemy: { ...enemy },
    message: `Encountered ${enemy.name}! Press [A]ttack or [F]lee.`
  };
  renderWorld();
}

// Start dialog mode
function startDialog(message, options) {
  gameState.mode = "dialog";
  gameState.dialog = { message, options };
  renderWorld();
}

// Check quest triggers and start dialogs if needed
function checkQuest() {
  if (
    gameState.player.location === "Lotus Valley" &&
    !gameState.quests["Lotus Valley"].started &&
    gameState.mode === "exploring"
  ) {
    startDialog(
      "A wounded monk asks for help retrieving a sacred lotus from the Kamal Ice Fortress. Will you accept?",
      [
        { key: 'Y', text: 'Yes' },
        { key: 'N', text: 'No' }
      ]
    );
  }

  if (
    gameState.player.location === "Kamal Ice Fortress" &&
    gameState.quests["Lotus Valley"].started &&
    !gameState.quests["Lotus Valley"].completed &&
    gameState.mode === "exploring"
  ) {
    addMessage("You found the Sacred Lotus! Return it to the monk in Lotus Valley.");
    gameState.quests["Lotus Valley"].completed = true;
  }

  if (
    gameState.player.location === "Lotus Valley" &&
    gameState.quests["Lotus Valley"].completed &&
    !gameState.quests["Lotus Valley"].rewardGiven &&
    gameState.mode === "exploring"
  ) {
    addMessage("The monk thanks you and bestows a blessing. Quest complete!");
    gainXP(100);
    gameState.quests["Lotus Valley"].rewardGiven = true;
  }
}

// Restart the game
function restartGame() {
  // Reset player stats
  Object.assign(gameState.player, {
    health: 100,
    magicka: 50,
    stamina: 75,
    location: "Po Tun Highlands",
    xp: 0,
    level: 1,
    nextLevel: 100
  });
  gameState.previousLocations = [];
  gameState.mode = "exploring";
  gameState.combat = null;
  gameState.dialog = null;
  gameState.gameOver = false;
  // Reset quests
  Object.keys(gameState.quests).forEach(q => {
    gameState.quests[q] = { started: false, completed: false, rewardGiven: false };
  });
  gameState.messageQueue = [];
  addMessage("Game restarted! Good luck, Tosh Raka.");
}

// Keyboard input handler
document.addEventListener('keypress', (e) => {
  // Game Over: Only allow restart
  if (gameState.mode === "gameover" || gameState.gameOver) {
    if (e.key.toUpperCase() === 'R') {
      restartGame();
      renderWorld();
    }
    return;
  }

  const key = e.key.toUpperCase();

  if (gameState.mode === "combat" && gameState.combat) {
    if (key === 'A') {
      // Player attacks
      const damage = Math.floor(Math.random() * 20) + 10;
      gameState.combat.enemy.health -= damage;
      gameState.combat.enemy.health = Math.max(0, gameState.combat.enemy.health); // Clamp
      gameState.combat.message = `You strike for ${damage} damage!`;

      if (gameState.combat.enemy.health <= 0) {
        gameState.combat.message = `${gameState.combat.enemy.name} defeated!`;
        gameState.mode = "exploring";
        gameState.combat = null;
        gainXP(50);
        renderWorld();
      } else {
        // Enemy counterattack after short delay
        setTimeout(() => {
          const enemyDamage = Math.floor(Math.random() * locationEncounters[gameState.player.location].attack);
          gameState.player.health -= enemyDamage;
          gameState.player.health = Math.max(0, gameState.player.health); 
          gameState.combat.message += `\n${gameState.combat.enemy.name} retaliates for ${enemyDamage} damage!`;

        if (gameState.player.health <= 0) {
          gameState.combat.message += "\nYour journey ends here...";
          gameState.mode = "gameover";
          gameState.combat = null;
          gameState.gameOver = true;
    renderWorld();
    return;
  }
  renderWorld();
}, 500);
      }
      renderWorld();
    } else if (key === 'F') {
      gameState.mode = "exploring";
      gameState.combat = null;
      addMessage("You fled the combat.");
      renderWorld();
    }
    return;
  }

  if (gameState.mode === "dialog" && gameState.dialog) {
    const option = gameState.dialog.options.find(opt => opt.key === key);
    if (option) {
      if (gameState.player.location === "Lotus Valley" && !gameState.quests["Lotus Valley"].started && option.key === 'Y') {
        gameState.quests["Lotus Valley"].started = true;
        addMessage("Quest started: Retrieve the Sacred Lotus from Kamal Ice Fortress!");
      } else if (option.key === 'N') {
        addMessage("You declined the monk's request.");
      }
      gameState.mode = "exploring";
      gameState.dialog = null;
      renderWorld();
    }
    return;
  }

  // Exploration mode input
  if (gameState.mode === "exploring") {
    if (key === '0') {
      // Go back if possible
      if (gameState.previousLocations.length > 0) {
        gameState.player.location = gameState.previousLocations.pop();
        addMessage(`Returned to ${gameState.player.location}.`);
        renderWorld();
      }
      return;
    }

    // Travel to connected location by number key
    if (key >= '1' && key <= '9') {
      const loc = gameState.locations[gameState.player.location];
      const index = parseInt(key) - 1;
      const newLocation = loc.connections[index];
      if (newLocation) {
        gameState.previousLocations.push(gameState.player.location);
        gameState.player.location = newLocation;
        addMessage(`Traveled to ${newLocation}.`);
        renderWorld();

        if (locationEncounters[newLocation]) {
          startCombat(locationEncounters[newLocation]);
        }
      }
    }
  }
});

// Initial render
renderWorld();