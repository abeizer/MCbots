const RGBot = require('rg-bot').RGBot;

/**
 * @param {RGBot} rg
 */
async function testStrat(rg) {

    console.log("Starting test strat")
    await cleanupInventory(rg)
}

/**
 * Throw out anything not in the keeper list, we might pick it back up by accident, but keep trying
 * @param {RGBot} bot RGBot instance
 * @param {object} [options] - optional parameters
 * @param {number} [options.itemNames=[]] Item names to keep
 * @param {number} [options.partialMatch=false] Allow partial matches to itemNames. For example, '_planks' will match any Item containing '_planks' in its name ('spruce_planks', 'oak_planks', etc.)
 * @param {number} [options.opponentRange=undefined] - optional for throwing things at opponents in range; if not specified items will just be dropped
 * @param {number} [options.reach=3] - how close to get before throwing at opponent
 */
const cleanupInventory = async (bot, options={}) => {
    console.log("Starting cleanup")
    const theMatchInfo = bot.matchInfo()
    console.log("Matchinfo?", theMatchInfo)
    bot.chat(JSON.stringify(theMatchInfo))
}

module.exports = testStrat