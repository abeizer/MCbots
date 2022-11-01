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

  routines.gatherPoppiesRoutine(rg, bot);
  // routines.gatherLogsRoutine(rg, bot);

  // bot.on('whisper', (...args) => {
  //   if (args[0] === bot.username || args[0] === 'you') { return };
  //   if (args[1] === 'wood') {
  //     rg.findAndDigBlock('spruce_log');
  //   }
  // })

}




exports.configureBot = configureBot