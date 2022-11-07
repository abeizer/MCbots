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
  routines.intermediateStrategy(rg, bot);
  // routines.advancedStrategy(rg, bot);

  bot.on('whisper', async (...args) => {
    if (args[0] === bot.username || args[0] === 'you') { return }
    if(args[1] === 'chestW') {
      const chest = rg.findBlock('chest', { maxDistance: 100});
      await rg.approachBlock(chest);
      const openedChest = await bot.openContainer(chest);
      await rg.withdrawItems(openedChest, {itemName: 'spruce_log'});
    }
    else if(args[1] === 'chestW3') {
      const chest = rg.findBlock('chest', { maxDistance: 100});
      await rg.approachBlock(chest);
      const openedChest = await bot.openContainer(chest);
      await rg.withdrawItems(openedChest, {itemName: 'spruce_log', quantity: 3});
    }
    else if(args[1] === 'chestD') {
      const chest = rg.findBlock('chest', { maxDistance: 100});
      await rg.approachBlock(chest);
      const openedChest = await bot.openContainer(chest);
      await rg.depositItems(openedChest, {itemName: 'spruce_log'});
    }
    else if(args[1] === 'chestD3') {
      const chest = rg.findBlock('chest', { maxDistance: 100});
      await rg.approachBlock(chest);
      const openedChest = await bot.openContainer(chest);
      await rg.depositItems(openedChest, {itemName: 'spruce_log', quantity: 3});
    }
    else if(args[1] === 'close') {
      const chest = rg.findBlock('chest', { maxDistance: 5});
      const openedChest = await bot.openContainer(chest);
      await openedChest.close();
    }
    else if(args[1] === 'print') {
      const chest = rg.findBlock('chest', { maxDistance: 5});
      const openedChest = await bot.openContainer(chest);
      console.log(`Bot: ${JSON.stringify(bot.inventory.items())}`);
      console.log(`Chest: ${JSON.stringify(rg.getContainerContents(openedChest))}`);
    }
  })

}




exports.configureBot = configureBot