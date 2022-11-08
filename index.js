const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { GoalNear, GoalBlock, GoalGetToBlock, GoalLookAtBlock, GoalXZ, GoalY, GoalInvert, GoalFollow } = require('mineflayer-pathfinder').goals
const { Vec3 } = require('vec3');

const RGBot = require('rg-bot').RGBot;
const routines = require('./routines');

function configureBot(bot) {

  const rg = new RGBot(bot);
  rg.setDebug(true);

  // announce in chat when Bot spawns
  bot.on('spawn', function() {
    rg.chat('Hello World');
  })

  // use in-game chat to make the Bot collect or drop wood for you
  bot.on('chat', async function (username, message) {
    if(username === bot.username) return

    if(message === 'collect wood') {
      await rg.findAndDigBlock('log', {partialMatch: true});
    }
    else if (message === 'drop wood') {
      await rg.dropInventoryItem('log', {partialMatch: true, quantity: 1});
    }
  })

}




exports.configureBot = configureBot