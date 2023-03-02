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
  bot.on('spawn', async function() {
    //
  })
  //
  // bot.mineflayer().on('playerCollect', (collector, collected) => {
  //   console.log("COLLECT EVENT: ", collector, collected)
  // })
  //
  // bot.mineflayer().on('blockUpdate', (oldBlock, newBlock) => {
  //   if(newBlock.position.equals(new Vec3(96,63,-386))) {
  //     console.log("BLOCK UPDATE EVENT: ", oldBlock, newBlock)
  //   }
  // })
  //
  // bot.mineflayer().on('entitySpawn', (entity) => {
  //   console.log("ENTITY SPAWN EVENT: ", entity)
  // })

  bot.on('chat', async function (username, message) {
    if(username === bot.mineflayer().username) return

    if(message === 'get flag') {
      const flag = bot.findBlock("white_banner", {maxDistance: 150})
      await bot.approachBlock(flag, {reach: 0}) // stand right on top of the flag
      //
    }
    else if (message === 'go to base') {
      const coords = new Vec3(160, 63, -386)
      const goal = new GoalNear(coords.x, coords.y, coords.z, 0)
      await bot.mineflayer().pathfinder.goto(goal)
    }
    else if(message === 'drop flag') {
      await bot.dropAllInventoryItem("_banner", {partialMatch: true})
    }
    else if(message === 'drop all') {
      await bot.dropAllInventoryItems()
    }
    else if(message === 'f') {
      bot.chat("/ff")
    }
    else if(message === 'dc') {
      bot.mineflayer().quit("ta ta for now!")
    }
    else if(message === 'lava') {
      const lava = bot.findBlock("Lava")
      await bot.approachBlock(lava, {reach: 1})
    }
    else if(message === 'attack') {
      const entity = bot.findEntity({targetName: "R_Digger"})
      bot.followEntity(entity)
      while(entity.isValid) {
        await bot.attackEntity(entity)
      }
    }
  })
}


exports.configureBot = configureBot