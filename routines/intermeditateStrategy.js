// This strategy is stupid but easy to test - don't actually do this
// Gathers 50 poppies and relies on the player to help the bot navigate if it can't find more poppies...
function intermediateStrategy(rg, bot) {

    const startRoutine = async () => {

        // first we need a pickaxe
        // should start with one, so equip it
        const equippedItem = await rg.holdItem('wooden_pickaxe');
        console.log(`EQUIPPED: ${equippedItem}`);

        // collect the bell
        await rg.findAndDigBlock('bell', {maxDistance: 100});

        console.log(`INVENTORY: ${JSON.stringify(bot.inventory)}`);

    }

    // When spawned, start looking for Poppies
    bot.on('spawn', async () => {
        rg.chat('I have arrived!');
        startRoutine();
    });

}

module.exports = intermediateStrategy;