// This strategy is an intermediate example of how to craft and equip items, and harvest blocks.
// The Bot will create a pickaxe and use it to mine the bell in the starting village
function intermediateStrategy(rg, bot) {

    // This function creates a pickaxe which the Bot will use to mine the starting bell
    const createPickaxe = async () => {

        // Gather enough logs to creaft a crafting table, some planks, and sticks
        const logsRequired = 3;
        while(!rg.inventoryContainsItem('spruce_log', {quantity: logsRequired})) {
            await rg.findAndDigBlock('spruce_log');
        }

        await rg.craftItem('spruce_planks', {quantity: logsRequired});
        await rg.craftItem('crafting_table');
        await rg.craftItem('stick');

        // place the crafting table, and use it to craft a wooden pickaxe
        const grassBlock = rg.findBlock('grass_block');
        await rg.placeBlock('crafting_table', grassBlock);
        const placedTable = await rg.findBlock('crafting_table');
        await rg.approachBlock(placedTable);
        await rg.craftItem('wooden_pickaxe', {craftingTable: placedTable});
    }

    const startRoutine = async () => {

        // first we need a pickaxe
        await createPickaxe();

        // now collect the bell
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