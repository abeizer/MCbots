function gatherLogsRoutine(rg, bot) {

  // This method gathers enough wood to create two axes 
  // (creating two at once is more efficient than waiting for the first to break before we create the second)
  const craftAxes = async () => {

    // if we don't have all the materials we need to craft two axes, then gather them now.
    // First, the crafting table:
    // If we don't have one, then we need 4 planks to craft it.
    // We can get our planks from one log if needed.
    if (!rg.inventoryContainsItem('crafting_table')) {
      if (!rg.inventoryContainsItem('spruce_planks', {quantity: 4})) {
        if (!rg.inventoryContainsItem('spruce_log')) {
          await rg.findAndDigBlock('spruce_log', {exactMatch: true});
        }
        await rg.craftItem('spruce_planks');
      }
      await rg.craftItem('crafting_table');
    }

    // Next, sticks:
    // If we don't have 4 of them, then we need 2 planks to craft them.
    // We can get our planks from one log if needed.
    if (!rg.inventoryContainsItem('stick', {quantity: 4})) {
      if (!rg.inventoryContainsItem('spuce_planks', {quantity: 2})) {
        if (!rg.inventoryContainsItem('spruce_log')) {
          await rg.findAndDigBlock('spruce_log', {exactMatch: true});
        }
        await rg.craftItem('spruce_planks');
      }
      await rg.craftItem('stick'); // and 4 sticks
    }

    // Lastly, planks:
    // If we don't have 6 of them, then we need 2 logs to craft them.
    if (!rg.inventoryContainsItem('spruce_planks', {quantity: 6})) {
      const logsCarried = rg.getInventoryItemQuantity('spruce_log');
      const logsNeeded = (rg.getInventoryItemQuantity('spruce_planks')) >= 2 ? 1 : 2;
      for (let i = logsCarried; i < logsNeeded; i++) {
        await rg.findAndDigBlock('spruce_log', {exactMatch: true});
      }
      await rg.craftItem('spruce_planks', {quantity: logsNeeded});
    }

    // Now we are going to make the axes
    // Locate a spot to place the craftingTable, place it, then stand next to it 
    const ground = rg.findBlock('grass', {onlyFindTopBlocks: true}) || rg.findBlock('dirt', {onlyFindTopBlocks: true});
    await rg.placeBlock('crafting_table', ground);
    const placedTable = await rg.findBlock('crafting_table');
    await rg.approachBlock(placedTable);

    // Craft 2 axes and equip one of them, then gather the crafting table
    await rg.craftItem('wooden_axe', {quantity: 2, craftingTable: placedTable});
    await rg.holdItem('wooden_axe');
    await rg.findAndDigBlock('crafting_table');
  }

  const searchForLog = async (skipCurrentLog = false) => {
    let logGathered = false;
    while (!logGathered) {
      // attempt to find a log
      const locatedLog = await rg.findBlock('spruce_log', {exactMatch: true, skipClosest: skipCurrentLog});
      if (locatedLog) {
        const completedDig = await rg.findAndDigBlock('spruce_log', {exactMatch: true, skipClosest: skipCurrentLog});
        if (completedDig) {
          logGathered = true;
        }
      }
      if (!logGathered) {
        // If the bot failed to collect a log, 
        // have it wander for a bit and find another one
        await rg.wander();
        await rg.wait(50);
      }
    }
  }

  bot.on('spawn', async () => {
    if (!rg.inventoryContainsItem('wooden_axe')) {
      await craftAxes();
    }
    searchForLog();
  });

  // Whenever we collect a log, check inventory
  // if we have 100 Spruce logs + apples, then we win! (100pts @ 1pt/log & 1pt/apple)
  // If we haven't yet 'won' then make sure we have an axe in our hand, and then gather another log
  bot.on('playerCollect', async (collector, collected) => {
    const itemCollected = rg.getItemName(collected);
    console.log('item collected ', itemCollected)
    if (collector.username === bot.username && (itemCollected === 'spruce_log' || itemCollected === 'apple')) {
      rg.chat(`I collected ${itemCollected}`);
      const totalLogs = rg.getInventoryItemQuantity('spruce_log');
      const totalApples = rg.getInventoryItemQuantity('apple');
      if ((totalLogs + totalApples) < 100) {
        rg.chat('On to the next log...');
        if (!rg.inventoryContainsItem('wooden_axe')) {
          await craftAxes();
        }
        else {
          await rg.holdItem('wooden_axe');
        }
        searchForLog();
      }
      else {
        rg.chat(`Wow! I have ${totalLogs} logs and ${totalApples} apples`);
      }
    }
  });

}

module.exports = gatherLogsRoutine;