const mineflayer = require('mineflayer')
const routines = require('./routines');
// const TestRGBot = require('./TestRgBot');
const RGBot = require('rg-bot').RGBot;

/**
 * @param { RGBot } bot
 * @param { EventEmitter } eventInfoEmitter
 */
function configureBot(bot, eventInfoEmitter) {

  bot.setDebug(true);

  // announce in chat when Bot spawns
  bot.mineflayer().on('spawn', function() {
    bot.chat('Hello World');
  })

  // do nothing, just stand there...
}


exports.configureBot = configureBot