// This strategy is an intermediate example of how to craft and equip items, and harvest blocks.
// The Bot will create a pickaxe and use it to mine the bell in the starting village
function intermediateStrategy(rg, bot) {

    // This is our main loop. The Bot will invoke this on spawn.
    // goal: Gather wood, use it to craft a pickaxe, and then dig the Bell in the starting village.
    async function startRoutine() {

        // One of the houses in the starting village has a
        // chest containing logs as well as a crafting table.
        // This is the perfect place to quickly craft a pickaxe
        // so that the Bot can collect the village's Bell.
        // First, find and approach the nearest crafting table
        const craftingTable = await rg.findBlock('crafting_table');
        await rg.approachBlock(craftingTable);

        // Next, loot some logs from the chest in the same house.
        // The chest has three, but the Bot only needs two to craft the pickaxe,
        // so we won't let it be too greedy.
        const chest = rg.findBlock('chest', { maxDistance: 10 });
        await rg.approachBlock(chest);
        const chestInventoryWindow = await bot.openContainer(chest);
        await rg.withdrawItems(chestInventoryWindow, { itemName: 'spruce_log', quantity: 2 });

        // Craft the components the Bot will need for one pickaxe
        // Turn the logs into 8 planks, and then two of the planks into some sticks
        await rg.craftItem('spruce_planks', { quantity: 2 });
        await rg.craftItem('stick');

        // Now the Bot has enough materials to craft a pickaxe
        await rg.approachBlock(craftingTable);
        await rg.craftItem('wooden_pickaxe', { craftingTable: craftingTable });
        await rg.holdItem('wooden_pickaxe');

        // Finally, have the Bot collect the Bell using its new pickaxe
        await rg.findAndDigBlock('bell', { maxDistance: 100 });
        rg.chat(`I have collected the village's Bell!`);
    }

    // When spawned, start
    bot.on('spawn', async () => {
        rg.chat('Hello! I have arrived!');
        startRoutine();
    });

}

module.exports = intermediateStrategy;