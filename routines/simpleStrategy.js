// This strategy is the simplest example of how to get started with the RGBot.
// The Bot will run around and gathers Poppies until it has 5 in its inventory.
function simpleStrategy(rg, bot) {

  // Define our main loop
  // goal: collect 5 Poppies
  const startGathering = async () => {

    while (rg.getInventoryItemQuantity('Poppy') < 5) {

      // Try to locate a Poppy nearby and dig it up
      const collectedPoppy = await rg.findAndDigBlock('Poppy');

      if (collectedPoppy) {
        // If the Bot collected a Poppy, then announce it in chat 
        rg.chat('I collected a Poppy.');
      }
      else {
        // If the bot couldn't find a poppy 
        // or failed to collect on it did find, 
        // then have it wander around before trying to find another
        await rg.wander();
      }
    }

    // once we have 5 poppies, celebrate!
    rg.chat('Wow! I have collected 5 Poppies!');
  }

  // When the Bot spawns into the game, 
  // have it say hello in chat
  // and then start gathering Poppies
  bot.on('spawn', async () => {
    rg.chat('Hello, I have arrived!');
    startGathering();
  });

}

module.exports = simpleStrategy;