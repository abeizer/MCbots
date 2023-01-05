const mineflayer = require('mineflayer')
const routines = require('./routines');
// const TestRGBot = require('./TestRgBot');
const RGBot = require('rg-bot')

/**
 * @param {RGBot} bot
 * @param {EventEmitter} matchInfoEmitter
 */
function configureBot(bot, matchInfoEmitter) {

  bot.setDebug(true);

  // announce in chat when Bot spawns
  bot.mineflayer().on('spawn', function() {
    bot.chat('Hello World');
  })

  bot.on('chat', async function (username, message) {
    if(username === bot.mineflayer().username) return

    if(message === 'parkour on') {
      bot.allowParkour(true);
    }
    else if (message === 'parkour off') {
      bot.allowParkour(false);
    }
    else if (message === 'dig on') {
      bot.allowDigWhilePathing(true);
    }
    else if (message === 'dig off') {
      bot.allowDigWhilePathing(false);
    }
    else if(message === 'dig wood') {
      await bot.findAndDigBlock('log', {partialMatch: true, skipCollection: true});
    }
    else if(message === 'collect wood') {
      await bot.findAndDigBlock('log', {partialMatch: true});
    }
    else if (message === 'to string') {
      bot.chat(bot.vecToString(bot.mineflayer().entity.position))
    }
    else if (message === 'to vec') {
      bot.chat(bot.vecFromString("1.0, 2.0, 3.0").toString())
    }
    else if (message === 'find item') {
      bot.findItemOnGround('log', {partialMatch: true})
    }
    else if (message === 'find me') {
      const entity = bot.findEntity({targetName: 'FatalCrux', attackable: true})
      await bot.approachEntity(entity)
    }
    else if(message === 'item') {
      const item = bot.getItemDefinitionByName('spruce_log')
      console.log('ITEM', JSON.stringify(item))
    }
    else if(message === 'find chicken') {
      const entity = bot.findEntity({targetName: 'chicken'})
      console.log('found entity ', JSON.stringify(entity))
    }
  })
}


exports.configureBot = configureBot