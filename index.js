const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { GoalNear, GoalBlock, GoalGetToBlock, GoalLookAtBlock, GoalXZ, GoalY, GoalInvert, GoalFollow } = require('mineflayer-pathfinder').goals
const { Vec3 } = require('vec3');

const RGBot = require('./regression-games').RGBot;
const routines = require('./routines');

/**
 * @param {mineflayer.Bot} bot - The Mineflayer bot
 */
function configureBot(bot) {

  const rg = new RGBot(bot);
  rg.setDebug(true);

  // routines.gatherPoppiesRoutine(rg, bot);
  // routines.gatherLogsRoutine(rg, bot);
  routines.advancedStrategy(rg, bot);

  bot.on('whisper', async (...args) => {
    if (args[0] === bot.username || args[0] === 'you') { return }
    if (args[1] === 'find') {
      console.log(`FIND ITEMS ON GROUND: ${rg.findItemsOnGround()}`);
    }
    else if(args[1] === 'collect') {
      console.log(`COLLECT ITEMS ON GROUND: ${await rg.findAndCollectItemsOnGround()}`);
    }
    else if(args[1] === 'drop') {
      console.log(`DROPPING ONE LOG`);
      await rg.dropInventoryItem('log', {quantity: 1});
    }
    else if(args[1] === 'dropA') {
      console.log(`DROPPING ALL LOGS`);
      await rg.dropInventoryItem('log', {quantity: -1});
    }
    else if(args[1] === 'dropAR') {
      console.log(`DROPPING ALL LOGS RAW`);
      let itemsToDrop = bot.inventory.items().filter((item) => {
        return rg.entityNamesMatch('spruce_log', item);
      });

      await bot.toss(itemsToDrop[0].type, itemsToDrop[0].metadata, 100);
    }
  })

}




exports.configureBot = configureBot