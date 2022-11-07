// This strategy is an intermediate example of how to craft and equip items, and harvest blocks.
// The Bot will create a pickaxe and use it to mine the bell in the starting village
function intermediateStrategy(rg, bot) {

    // This function finds one of two chests in the starting village.
    // Each has at least 3 logs, which the Bot loots.
    async function lootWoodFromChest() {
        const chest = rg.findBlock('chest', { maxDistance: 100 });
        await rg.approachBlock(chest);
        const chestInventoryWindow = await bot.openContainer(chest);
        await rg.withdrawItems(chestInventoryWindow, { itemName: 'spruce_log' });
    }

    // This function has the Bot create a Wooden Pickaxe.
    // It will be able to use this to collect the Bell.
    async function createPickaxe() {

        // Craft 12 planks from 3 logs.
        // Use the planks to craft a table and sticks. Save the last 4 planks for the pickaxe.
        await rg.craftItem('spruce_planks', { quantity: 3 });
        await rg.craftItem('crafting_table');
        await rg.craftItem('stick');

        // place the crafting table, and use it to craft a Wooden Pickaxe
        const grassBlock = rg.findBlock('grass_block');
        await rg.placeBlock('crafting_table', grassBlock);
        const placedTable = await rg.findBlock('crafting_table');
        await rg.approachBlock(placedTable);
        await rg.craftItem('wooden_pickaxe', {craftingTable: placedTable});
        await rg.holdItem('wooden_pickaxe');
    }

    // This is our main loop. The Bot will invoke this on spawn.
    // goal: Gather wood, use it to craft a pickaxe, and then dig the Bell in the starting village.
    async function startRoutine() {

        // First, have the Bot collect some wood.
        // There are easily-accessible logs in some chests nearby.
        await lootWoodFromChest();

        // Now craft a pickaxe
        await createPickaxe();

        // Finally, collect the Bell using the pickaxe
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