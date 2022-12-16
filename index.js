const mineflayer = require('mineflayer')
const routines = require('./routines');
const TestRGBot = require('./TestRgBot');

/**
 * @param {RGBot} realBot
 */
function configureBot(realBot) {

  let bot = new TestRGBot(realBot.mineflayer());
  bot.setDebug(true);

  // announce in chat when Bot spawns
  // bot.mineflayer().on('spawn', function() {
  //   bot.chat('Hello World');
  // })

  // do nothing, just stand there...
}


exports.configureBot = configureBot