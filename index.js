const mineflayer = require('mineflayer')
const routines = require('./routines');
// const TestRGBot = require('./TestRgBot');
const RGBot = require('rg-bot')
const {Vec3} = require("vec3");
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalNear, GoalPlaceBlock, GoalLookAtBlock, GoalXZ, GoalInvert, GoalFollow } = require('mineflayer-pathfinder').goals

/**
 * @param {RGBot} bot
 * @param {EventEmitter} matchInfoEmitter
 */
function configureBot(bot, matchInfoEmitter) {

  bot.setDebug(true);
  bot.allowParkour(true)
  bot.allowDigWhilePathing(false)

  // announce in chat when Bot spawns
  bot.mineflayer().on('spawn', function() {
    bot.chat('Hello World');
  })

  bot.on('chat', async function (username, message) {
    if(username === bot.mineflayer().username) return

    if(message === 'get flag') {
      const flag = bot.findBlock("white_banner", {maxDistance: 100})
      await bot.approachBlock(flag, {reach: 0}) // stand right on top of the flag
    }
    else if (message === 'go to base') {
      const coords = new Vec3(160, 63, -386)
      const goal = new GoalNear(coords.x, coords.y, coords.z, 0)
      await bot.mineflayer().pathfinder.goto(goal)
    }
  })
}


exports.configureBot = configureBot