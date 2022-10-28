const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalNear, GoalBlock, GoalPlaceBlock, GoalLookAtBlock, GoalXZ, GoalY, GoalInvert, GoalFollow } = require('mineflayer-pathfinder').goals
const { Vec3 } = require('vec3');


/**
 * Mineflayer API docs - https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md
 * Mineflayer Pathfinder API docs - https://github.com/PrismarineJS/mineflayer-pathfinder/blob/master/readme.md
 */
const RGBot = class {

  constructor(bot) {

    this.mcData = require('minecraft-data')(bot.version);

    // load pathfinder plugin and setup default Movements. 
    // The player can override this by setting new Movements.
    bot.loadPlugin(pathfinder);
    bot.pathfinder.setMovements(new Movements(bot, this.mcData));

    // add command to report bot position
    bot.on('whisper', (...args) => {
      if (args[0] === bot.username || args[0] === 'you') { return };
      if (args[1] === 'location') {
        this.bot.whisper(args[0], this.positionString(this.bot.entity.position));
      }
    })

    this.bot = bot;
  }


  /**
   * Bot sends a chat message in-game and outputs it to log
   */
  chat(message) {
    this.bot.chat(message);
    console.log(message);
  }

  /**
   * Make the bot randomly wander around.
   * minRange -> maxRange X and minRange -> maxRange Z from the current position
   * @return { Promise<void> }
   */
  async wander(minRange = 10, maxRange = 10) {
    if (minRange < 1) {
      minRange = 1;
    }
    if (maxRange < minRange) {
      maxRange = minRange;
    }
    let xRange = (minRange + (Math.random() * (maxRange - minRange))) * (Math.random() < 0.5 ? -1 : 1);
    let zRange = (minRange + (Math.random() * (maxRange - minRange))) * (Math.random() < 0.5 ? -1 : 1);
    let newX = this.bot.entity.position.x + xRange;
    let newZ = this.bot.entity.position.z + zRange;
    await this.bot.pathfinder.goto(new GoalXZ(newX, newZ));
  }

  /**
   * If a player with this username exists in the current match, the bot will return 
   * that player entity. This includes information about the player's position, equipment, etc.
   * @return { Entity | null }
   */
  getPlayerEntity(username) {
    return this.bot.players[username] ? this.bot.players[username].entity : null
  }

  /**
   * Find the nearest entity of the specified type. 
   * Only locates entities that can be engaged in combat.
   * @return { Entity | null }
   */
  findAttackableEntity(targetType) {
    return this.bot.nearestEntity(entity => {
      if (!targetType || this.entityNamesMatch(targetType, entity)) {
        this.chat(`Evaluating attack target: ${(entity.displayName || entity.name)}, isValid: ${entity.isValid}, isMobOrPlayer: ${(entity.type === 'mob' || entity.type === 'player')}`)
        return (entity.isValid && (entity.type === 'mob' || entity.type === 'player'))
      }
      return false
    });
  }

  /**
   * Represent an entity's position as a string 
   * returns { string }
   */
  positionString(position) {
    return `${position.x}, ${position.z}, ${position.y}`
  }

  /**
   * Accepts an Entity representing an item and returns the displayName of the Item.
   * If the item does not have a displayName, then returns the name instead.
   * @return { string | undefined }
   */
  getItemName(item) {
    return item.displayName || item.name;
  }

  /**
   * Accepts the name of an item and returns the corresponding Item object
   * @return { Item | undefined }
   */
  getItemByName(itemName) {
    try {
      return this.mcData.itemsByName[itemName];
    } catch (err) {
      console.error(`Couldn't find item in notch data: ${err.message}`)
    }
  }

  /**
   * Accepts the id of an item and returns the corresponding Item object
   * @return { Item | undefined }
   */
  getItemById(itemId) {
    try {
      return this.mcData.items[itemId];
    } catch (err) {
      console.error(`Couldn't find item in notch data: ${err.message}`)
    }
  }

  /**
   * Compares two entities and returns true if either their names or displayNames match.
   * This is used very often to locate entities/items in the world + inventory by name.
   * @param targetName
   * @param entity
   * @param exactMatch - if false, will return true if entity contains the targetName. Otherwise, entity must match the targetName exactly.
   * @return { boolean }
   */
  entityNamesMatch(targetName, entity, exactMatch = false) {
    const text = targetName.toLowerCase();
    const namesMatch = entity.name && ((entity.name.toLowerCase() == text) || (!exactMatch && entity.name.toLowerCase().includes(text)));
    const displayNamesMatch = entity.displayName && ((entity.displayName.toLowerCase() == text) || (!exactMatch && entity.displayName.toLowerCase().includes(text)));
    return namesMatch || displayNamesMatch;
  }

  /**
   * The bot will approach the given entity and stop within the specified range.
   * @return { Promise<void> }
   */
  async approachEntity(entity, range = 1) {
    if (!entity) {
      this.chat(`I cannot see ${(entity.displayName || entity.name)}`);
    } else {
      this.chat(`I am approaching ${(entity.displayName || entity.name)} at range ${range}`);
      const goal = new GoalNear(entity.position.x, entity.position.y, entity.position.z, range);
      this.bot.pathfinder.goto(goal);
    }
  }

  /**
   * The bot will follow the given entity, and stay within the specified range.
   * @return { Promise<void> }
   */
  async followEntity(entity, range = 2) {
    if (!entity) {
      this.chat(`I cannot see ${(entity.displayName || entity.name)}`);
    } else {
      this.chat(`I am following ${(entity.displayName || entity.name)} at range ${range}`);
      this.bot.pathfinder.setGoal(new GoalFollow(entity, range), true);
    }
  }

  /**
   * The bot will avoid the given entity, and not approach it within the given range.
   * @return { Promise<void> }
   */
  async avoidEntity(entity, range = 5) {
    if (!entity) {
      this.chat(`I cannot see ${(entity.displayName || entity.name)}`);
    } else {
      this.chat(`I am staying at range ${range} away from ${(entity.displayName || entity.name)}`);
      this.bot.pathfinder.setGoal(new GoalInvert(new GoalFollow(entity, range)), true);
    }
  }

  /**
   * The bot will attack the given entity
   * @return { Promise<void> }
   */
  async attackEntity(entity) {
    if (!entity) {
      this.chat('There is no target to attack');
    } else {
      try {
        this.chat(`I am attacking ${(entity.displayName || entity.name)}`, err)
        this.bot.attack(entity, true);
      } catch (err) {
        console.log(`Error attacking target: ${(entity.displayName || entity.name)}`, err)
      }
    }
  }

  /**
   * Attempt to locate the nearest block of the given type within a specified range from the bot.
   * @param exactMatch - only find blocks whose name / displayName match the blockType exactly.
   * @param onlyFindTopBlocks - will not return any blocks that are beneath another block
   * @param skipClosest - will attempt to locate the next-closest Block. This can be used to skip the closest Block when the bot encounters an issue collecting it.
   * @return { Block | null }
   */
  findBlock(blockType, exactMatch = false, onlyFindTopBlocks = false, maxDistance = 50, skipClosest = false) {
    let nearbyBlocks = this.bot.findBlocks({
      point: this.bot.entity.position, // from the bot's current position
      maxDistance: maxDistance, // find blocks within range
      count: (skipClosest ? 2 : 1),
      matching: (block) => {
        let blockFound = false;
        if (blockType) {
          blockFound = (this.entityNamesMatch(blockType, block, exactMatch));
        }
        else if (block.type !== 0) {
          blockFound = true; // if nothing specified... try anything but air
        }
        return blockFound;
      },
      useExtraInfo: (block) => {
        if (onlyFindTopBlocks) {
          const blockAbove = this.bot.blockAt(block.position.offset(0, 1, 0));
          return !blockAbove || blockAbove.type === 0 // only find if clear or 'air' above
        }
        return true;
      },
    });

    let result = null;
    if (nearbyBlocks.length > 0) {
      if (!skipClosest) {
        result = this.bot.blockAt(nearbyBlocks[0]);
      }
      else if (nearbyBlocks.length > 1) {
        result = this.bot.blockAt(nearbyBlocks[1]);
      }
    }

    if (result) {
      console.log(`Found block of type ${blockType} within a range of ${maxDistance}`);
    }
    else {
      this.chat(`I did not find any blocks of type ${blockType} within a range of ${maxDistance}`);
    }
    return result;
  }

  /**
   * The bot will approach the given block and stop within the specified range.
   * @return { Promise<void> }
   */
  async approachBlock(block, range = 4.5) {
    try {
      // this.chat(`I am approaching block at ${this.positionString(block.position)} at range ${range}`);
      await this.bot.pathfinder.goto(new GoalLookAtBlock(block.position, this.bot.world, { reach: range }))
    } catch (err) {
      console.error('Error going to a block', err)
    }
  }

  /**
   * Place a block from the bot's inventory on a target block
   * @param blockName The name of the block to place. Must be available in the bot's inventory.
   * @param targetBlock The block to place the new block on/against
   * @param faceVector The side of the targetBlock to place the new block against
   * @param range The maximum range the bot can be from the block while placing it
   * @return { Promise<void> }
   */
  async placeBlock(blockName, targetBlock, faceVector = new Vec3(0, 1, 0), range = 20) {
    // navigate to target block
    console.log('going to ', this.positionString(targetBlock.position));
    await this.bot.pathfinder.goto(new GoalPlaceBlock(targetBlock.position.plus(new Vec3(3, 1, 3)), this.bot.world, { reach: range }))

    // hold item in hand and place on block
    console.log('equipping ', blockName);
    await this.bot.equip(this.getInventoryItemId(blockName), 'hand');
    console.log('now holding ', JSON.stringify(this.bot.heldItem));

    console.log('standing at ', this.positionString(this.bot.entity.position))
    await this.bot.placeBlock(targetBlock, faceVector);
  }

  /**
   * Equip the best tool for harvesting the specified block.
   * Returns the 
   * @return { Promise<Item> }
   */
  async equipBestHarvestTool(block) {
    const bestHarvestTool = this.bot.pathfinder.bestHarvestTool(block);
    if (bestHarvestTool) {
      try {
        await this.bot.equip(bestHarvestTool, 'hand');
        return bestHarvestTool;
      } catch (err) {
        console.error('Unable to equip a better tool', err)
      }
    }
  }

  /**
   * Harvest the given Block. 
   * This method will equip the most appropriate tool in the bot's inventory for this block type.
   * @return { Promise<void> }
   */
  async digBlock(block) {
    if (block) {
      console.log(`I am digging ${block.displayName || block.name}`);

      // dig the block
      this.equipBestHarvestTool(block);
      await this.bot.dig(block);
    }
  }

  /**
   * Locate and harvest the closest Block of a given type within the specified range from the bot. 
   * This method will equip the most appropriate tool in the bot's inventory for this block type.
   * Returns true if a block was found and digging was successful.
   * Returns false if a block was not found or if digging was interrupted.
   * @param exactMatch - only find blocks whose name / displayName match the blockType exactly.
   * @param onlyFindTopBlocks - will not attempt to harvest any blocks that are beneath another block
   * @param skipClosest - will attempt to locate the next-closest Block. This can be used to skip the closest Block when the bot encounters an issue collecting it.
   * @return { Promise<boolean> }
   */
  async findAndDigBlock(blockType, exactMatch = false, onlyFindTopBlocks = false, maxDistance = 50, skipClosest = false) {
    let result = false;
    const block = this.findBlock(blockType, exactMatch, onlyFindTopBlocks, maxDistance, skipClosest);
    if (block) {
      try {
        await this.approachBlock(block);
        await this.digBlock(block);

        // pick up the block
        await this.bot.waitForTicks(25); // give the server time to create drops
        let droppedItem = null;
        if (block.drops && block.drops.length > 0) {
          droppedItem = await this.findItemOnGround(block.drops[0]);
        }
        else {
          droppedItem = await this.findItemOnGround(block.name || block.displayName);
        }
        if (droppedItem) {
          await this.approachItem(droppedItem);
        }
        result = true;
      }
      catch (err) {
        console.error('Error digging a block', err)
      }
    }
    return result;
  }

  /**
   * Locate the closest item with the given name within the specified range.
   * If item was not found, will return null.
   * @return { Item | null }
   */
  findItemOnGround(itemName, range = 30) {
    console.log(`Looking for item ${itemName} in range ${range}`)
    return this.bot.nearestEntity((entity) => {
      if (entity.type === "object" && entity.objectType === "Item" && entity.onGround) {
        const itemEntity = this.getItemById(entity.metadata[8].itemId);
        const matchedName = !itemName || this.entityNamesMatch(itemName, itemEntity);
        if (matchedName && this.bot.entity.position.distanceTo(entity.position) < range) {
          return entity;
        }
      }
    });
  }


  /**
  * Approach the item. If the bot has space in its inventory, the item will be picked up.
  * @param item
  * @return { Promise<void> }
  */
  async approachItem(item) {
    if (item) {
      this.chat('I am approaching item ' + (item.displayName || item.name));
      await this.bot.pathfinder.goto(new GoalBlock(item.position.x, item.position.y, item.position.z));
    } else {
      this.chat('No Item to approach')
    }
  }

  /**
   * This will drop up to the quantity requested of any inventory item matching itemName.  
   * Ex. If you request to drop 'log', any type of log will be dropped to fulfill this request.
   * To drop all of an item, call this method using the default quantity of -1 
   * @param itemName
   * @param quantity
   * @return { Promise<void> } 
   */
  async dropInventoryItem(itemName, quantity = -1) {
    let quantityAvailable = 0;
    let itemsToDrop = this.bot.inventory.items().filter((item) => {
      // don't drop an 'axe' unless it has explicitly requested... this prevents the bot from dropping stone tools when dropping stone
      const isAxe = itemName.toLowerCase().includes('axe');
      const itemNameMatches = (item.name && item.name.toLowerCase().includes(itemName.toLowerCase()) && (isAxe || !item.name.toLowerCase().includes('axe')));
      const displayNameMatches = (item.displayName && item.displayName.toLowerCase().includes(itemName.toLowerCase()) && (isAxe || !item.displayName.toLowerCase().includes('axe')));
      if (itemNameMatches || displayNameMatches) {
        quantityAvailable += item.count
        return true;
      }
      return false;
    })
    if (quantityAvailable > 0) {
      let quantityToDrop = (quantity < 0 ? quantityAvailable : quantity);
      this.chat('I am dropping ' + quantityToDrop + ' ' + itemName)
      try {
        let i = 0;
        while (quantityToDrop > 0 && i < itemsToDrop.length) {
          let theItem = itemsToDrop[i];
          let qty = (theItem.count > quantityToDrop ? quantityToDrop : theItem.count);
          await this.bot.toss(theItem.type, theItem.metadata, qty)
          quantityToDrop -= qty;
          ++i;
        }
      } catch (err) {
        console.error(`I encountered an error while dropping ${itemName}`, err)
      }
    }
    else {
      this.chat(`I don't have any ${itemName} to drop`)
    }
  }

  /**
  * Return the id of an item in the bot's inventory.
  * @return { number | null }
  */
  getInventoryItemId(itemName) {
    const itemId = (this.getItemByName(itemName)).id;
    if (itemId) {
      return this.bot.inventory.findInventoryItem((itemId));
    }
  }

  /**
   * Return how many of a specific item the bot is holding in its inventory. 
   * @return { int }
   */
  getInventoryItemQuantity(itemName) {
    let quantityAvailable = 0;
    this.bot.inventory.items().filter((item) => {
      if (this.entityNamesMatch(itemName, item, true)) {
        quantityAvailable += item.count;
        return true;
      }
      return false;
    });
    console.log(`Bot has ${quantityAvailable} of item ${itemName}`);
    return quantityAvailable;
  }

  /**
   * Returns true if the bot has at least one of this item in its inventory. 
   * Otherwise, returns false.
   * @param quantity check if inventory contains at least the specified quantity
   * @return { boolean }
   */
  inventoryContainsItem(itemName, quantity = 1) {
    if (quantity < 1) {
      quantity = 1;
    }
    return this.getInventoryItemQuantity(itemName) >= quantity;
  }

  /**
   * Attempts to craft an item. Returns the created item's instance in the bot's inventory.
   * The bot must have enough materials to make at least one of these items, or else recipe lookup will fail.
   * @param itemName
   * @param quantity - The number of items to craft this item
   * @param craftingTable - For recipes that require a crafting table/station. A Block Entity representing the appropriate station. Bot must be within range. 
   * @return { number | null } The id of the crafted item in the bot's inventory.
   */
  async craftItem(itemName, quantity = 1, craftingTable = null) {
    let result = null;
    const itemId = (this.getItemByName(itemName)).id;
    const recipes = await this.bot.recipesFor(itemId, null, null, craftingTable);
    if (recipes.length == 0) {
      console.log(`Failed to create ${itemName} - either this item is not valid, or the bot does not possess the required materials to craft it.`);
    }
    else {
      try {
        await this.bot.craft(recipes[0], quantity, craftingTable);
        result = this.bot.inventory.findInventoryItem((itemId));
        console.log(`Crafted ${itemName}`)
      }
      catch (err) {
        console.log(`Failed to craft ${itemName}: ${err}`);
      }
    }
    return result;
  }

  /**
   * Attempts to equip an item to the bot's hand. The bot must have the item in its inventory to equip it.
   * @param itemName
   * @return { Promise<void> }
   */
  async holdItem(itemName) {
    const itemId = await this.getInventoryItemId(itemName);
    if (itemId) {
      await this.bot.equip(itemId, 'hand');
    }
    else {
      console.log(`Could not equip item ${itemName} to hand`);
    }
  }

}

module.exports = RGBot