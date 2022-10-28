// This strategy is stupid but easy to test - don't actually do this
// Gathers 50 poppies and relies on the player to help the bot navigate if it can't find more poppies...
function gatherPoppiesRoutine(rg, bot) {


  // when pathfinder resets its path. This indicates that bot may be stuck
  bot.on('path_reset', (reason) => {
    console.log(`Path was reset for reason: ${reason}`)
    // if (reason === 'stuck') {
    //   // we will use this as a flag to search for the next-closest poppy 
    //   // instead of whichever one is getting us stuck
    //   stuck++;
    // } else if (reason == 'dig_error' || reason == 'block_updated') {
    //   // dig errors can happen when the block we're digging was updated and
    //   // can cause the bot to get stuck digging nothing. Stop pathfinding + digging, and restart the main loop
    //   stuck = 0;
    //   bot.stopDigging();
    //   bot.pathfinder.stop();
    // }
  });

  const startRoutine = async () => {

    let stuck = 0;

    // goal: collect 20 poppies
    while (rg.getInventoryItemQuantity('Poppy') < 20) {

      let completedDig = false;
      try {
        // attempt to find a poppy
        if (await rg.findBlock('Poppy', true, false, 50, stuck >= 3)) {
          completedDig = await rg.findAndDigBlock('Poppy', true, false, 50, stuck >= 3);
        }
        if (!completedDig) {
          // if the bot couldn't find a poppy or failed to collect it, 
          // have it wander for a bit before trying again
          await rg.wander();
          stuck++;
        }
        else {
          stuck = 0;
        }
      } catch (err) {
        stuck++;
        console.log(err);
      }

    }

    // once we have 5 poppies, celebrate!
    rg.chat('Wow! I have collected 20 Poppies!');
  }

  // When spawned, start looking for poppies
  bot.on('spawn', async () => {
    rg.chat('I have arrived!');
    startRoutine();
  });

  // Whenever we collect a Poppy, check inventory
  // if we have 50 Poppies, then we win! (100pts @ 2pts/Poppy)
  // otherwise, search for the next poppy.
  bot.on('playerCollect', async (collector, collected) => {
    if (collector.username == bot.username && rg.getItemName(collected) == 'Poppy') {
      rg.chat('I collected a Poppy.');
    }
  });

}

module.exports = gatherPoppiesRoutine;