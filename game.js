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
    enemies: [
      { name: "Kamal Frost Warrior", health: 80, attack: 15 },
      { name: "Tsaesci Serpent Guard", health: 65, attack: 20 }
    ],
    locations: {
      "Po Tun Highlands": ["Frostwall Pass", "Ka'ishi Ruins"],
      "Frostwall Pass": ["Kamal Ice Fortress"],
      "Ka'ishi Ruins": ["Dragon Shrine"]
    }
  };
  function renderWorld() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, 800, 600);
    
    // Draw location text
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Current Location: ${gameState.player.location}`, 20, 40);
    
    // Draw location connections
    gameState.locations[gameState.player.location].forEach((loc, index) => {
      ctx.fillText(`${index+1}. Travel to ${loc}`, 20, 80 + (index*30));
    });
  }
  
  document.addEventListener('keypress', (e) => {
    if (e.key >=1 && e.key <=9) {
      const locationIndex = parseInt(e.key) -1;
      const newLocation = gameState.locations[gameState.player.location][locationIndex];
      if (newLocation) {
        gameState.player.location = newLocation;
        renderWorld();
      }
    }
  });
  
  renderWorld();