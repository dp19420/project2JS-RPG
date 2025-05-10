// game.js
const gameState = {
  player: {
    name: "Tosh Raka",
    health: 100,
    magicka: 50,
    stamina: 75,
    weapon: "Tsaesci Katana",
    location: "Po Tun Highlands"
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
  }
};

function renderWorld() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2d2d2d';
  ctx.fillRect(0, 0, 800, 600);

  // Draw location text
  const loc = gameState.locations[gameState.player.location];
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Current Location: ${gameState.player.location}`, 20, 40);

  // Draw location description
  ctx.font = '16px Arial';
  ctx.fillText(loc.description, 20, 70);

  // Draw location connections
  ctx.font = '18px Arial';
  loc.connections.forEach((locName, index) => {
    ctx.fillText(`${index+1}. Travel to ${locName}`, 20, 110 + (index*30));
  });
}

renderWorld();

const locationEncounters = {
  "Frostwall Pass": { name: "Kamal Frost Warrior", health: 80, attack: 15 },
  "Ka'ishi Ruins": { name: "Tsaesci Serpent Guard", health: 65, attack: 20 },
  "Kamal Ice Fortress": { name: "Kamal Warlord", health: 120, attack: 25 },
  "Moon-Sugar Fields": { name: "Bandit Skirmisher", health: 50, attack: 10 }
};

function startCombat(enemy) {
  let combatActive = true;

  function combatLoop() {
    const playerAction = prompt(`Encountered ${enemy.name}! [A]ttack [F]lee`);

    if (playerAction?.toUpperCase() === 'A') {
      const damage = Math.floor(Math.random() * 20) + 10;
      enemy.health -= damage;
      alert(`You strike with your ${gameState.player.weapon} for ${damage} damage!`);

      if (enemy.health <= 0) {
        alert(`${enemy.name} defeated!`);
        combatActive = false;
        return;
      }

      // Enemy counterattack
      const enemyDamage = Math.floor(Math.random() * enemy.attack);
      gameState.player.health -= enemyDamage;
      alert(`${enemy.name} retaliates for ${enemyDamage} damage!`);

      if (gameState.player.health <= 0) {
        alert("Your journey ends here...");
        combatActive = false;
        return;
      }

      combatLoop();
    } else if (playerAction?.toUpperCase() === 'F') {
      alert("You flee back to your previous location!");
      
      combatActive = false;
      return;
    }
  }

  combatLoop();
}
document.addEventListener('keypress', (e) => {
  if (e.key >= 1 && e.key <= 9) {
    const loc = gameState.locations[gameState.player.location];
    const locationIndex = parseInt(e.key) - 1;
    const newLocation = loc.connections[locationIndex];
    if (newLocation) {
      gameState.player.location = newLocation;
      renderWorld();

      // Trigger encounter if present
      if (locationEncounters[newLocation]) {
        // Clone the enemy so we don't mutate the base
        const enemy = { ...locationEncounters[newLocation] };
        startCombat(enemy);

        // Award XP if player survives and enemy is defeated
        if (gameState.player.health > 0 && enemy.health <= 0) {
          gainXP(50);
        }
      }
    }
  }
});
    
  
Object.assign(gameState.player, {
  xp: 0,
  level: 1,
  nextLevel: 100,

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
    alert(`Reached Level ${gameState.player.level}!`);
  }
}
gameState.quests = {
  "Lotus Valley": {
    started: false,
    completed: false,
    rewardGiven: false
  }
};

function checkQuest() {
  // Offer quest in Lotus Valley
  if (
    gameState.player.location === "Lotus Valley" &&
    !gameState.quests["Lotus Valley"].started
  ) {
    const choice = prompt("A wounded monk asks for help retrieving a sacred lotus from the Kamal Ice Fortress. Will you accept? [Y/N]");
    if (choice?.toUpperCase() === "Y") {
      gameState.quests["Lotus Valley"].started = true;
      alert("Quest started: Retrieve the Sacred Lotus from Kamal Ice Fortress!");
    }
  }
  // Complete quest at Kamal Ice Fortress
  if (
    gameState.player.location === "Kamal Ice Fortress" &&
    gameState.quests["Lotus Valley"].started &&
    !gameState.quests["Lotus Valley"].completed
  ) {
    alert("You found the Sacred Lotus! Return it to the monk in Lotus Valley.");
    gameState.quests["Lotus Valley"].completed = true;
  }
  // Reward quest in Lotus Valley
  if (
    gameState.player.location === "Lotus Valley" &&
    gameState.quests["Lotus Valley"].completed &&
    !gameState.quests["Lotus Valley"].rewardGiven
  ) {
    alert("The monk thanks you and bestows a blessing. Quest complete!");
    gainXP(100);
    gameState.quests["Lotus Valley"].rewardGiven = true;
  }
}