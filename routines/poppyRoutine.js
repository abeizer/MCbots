// This strategy is stupid but easy to test - don't actually do this
// Gathers 50 poppies and relies on the player to help the bot navigate if it can't find more poppies...
function gatherPoppiesRoutine(rg, bot) {

  const startRoutine = async () => {

    // track how many times we get stuck trying to collect the same poppy
    // we will try up to 2 times before moving onto a different one.
    let stuck = 0;

    // goal: collect 20 poppies
    while (rg.getInventoryItemQuantity('Poppy') < 20) {

      let completedDig = false;
      if (await rg.findBlock('Poppy', true, false, 50, stuck >= 1)) {
        completedDig = await rg.findAndDigBlock('Poppy', true, false, 50, stuck >= 1);
      }
      if (!completedDig) {
        stuck++;
        // if the bot couldn't find a poppy or failed to collect it, 
        // have it wander for a bit before trying again
        let didWander = false;
        while(!didWander) {
          didWander = await rg.wander();
        }
      } else {
        stuck = 0;
      }
    }

    // once we have 20 poppies, celebrate!
    rg.chat('Wow! I have collected 20 Poppies!');
  }

  // When spawned, start looking for Poppies
  bot.on('spawn', async () => {
    rg.chat('I have arrived!');
    startRoutine();
  });

  // The bot will announce whenever it collects a Poppy
  bot.on('playerCollect', async (collector, collected) => {
    if (collector.username == bot.username && rg.getItemName(collected) == 'Poppy') {
      rg.chat('I collected a Poppy.');
    }
  });

}

module.exports = gatherPoppiesRoutine;