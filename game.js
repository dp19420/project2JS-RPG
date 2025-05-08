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