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

  // routines.simpleStrategy(rg, bot);
  // routines.intermediateStrategy(rg, bot);
  // routines.advancedStrategy(rg, bot);

  bot.on('whisper', async (...args) => {
    if (args[0] === bot.username || args[0] === 'you') { return }
    if(args[1] === 'chestW') {
      const chest = rg.findBlock('chest', { maxDistance: 100});
      console.log(`Found chest entity: ${JSON.stringify(chest)}`);
      console.log(`approaching chest: ${JSON.stringify(await rg.approachBlock(chest))}`);
      const openedChest = await bot.openContainer(chest);
      console.log(`Opened Chest: ${JSON.stringify(rg.getContainerContents(openedChest))}`);
      await rg.withdrawItems(openedChest, {itemType: 'spruce_log'});
      console.log(`Inventory: ${JSON.stringify(bot.inventory.items())}`);

    }
    else if(args[1] === 'chestD') {
      const chest = rg.findBlock('chest', { maxDistance: 100});
      console.log(`Found chest entity: ${JSON.stringify(chest)}`);
      console.log(`approaching chest: ${JSON.stringify(await rg.approachBlock(chest))}`);
      const openedChest = await bot.openContainer(chest);
      console.log(`Opened Chest: ${JSON.stringify(openedChest)}`);
      await rg.depositItems(openedChest, {itemType: 'spruce_log'});
      console.log(`Inventory: ${JSON.stringify(rg.getContainerContents(openedChest))}`);

    }
  })

}




exports.configureBot = configureBot