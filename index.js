const mineflayer = require('mineflayer')
const routines = require('./routines');

/**
 * @param {RGBot} bot
 */
function configureBot(bot) {

  bot.setDebug(true);

  // announce in chat when Bot spawns
  bot.mineflayer().on('spawn', function() {
    bot.chat('Hello World');
  })

  // use in-game chat to make the Bot collect or drop wood for you
  bot.on('chat', async function (username, message) {
    if(username === bot.mineflayer().username) return

    if(message === 'collect wood') {
      await bot.findAndDigBlock('log', {partialMatch: true});
    }
    else if (message === 'drop wood') {
      await bot.dropInventoryItem('log', {partialMatch: true, quantity: 1});
    }
  })

}




exports.configureBot = configureBot