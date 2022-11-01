const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalNear, GoalBlock, GoalPlaceBlock, GoalLookAtBlock, GoalXZ, GoalY, GoalInvert, GoalFollow } = require('mineflayer-pathfinder').goals
const { Vec3 } = require('vec3');


/**
 * Mineflayer is a high-level JavaScript API based on the for creating Minecraft Bots. 
 * Mineflayer supports third-party plugins like Pathfinder - an advanced Pathfinding library to help your Bot navigate the world.
 * Regression Games uses Mineflayer and Pathfinder to create a stable and user-friendly library. Create the best Bot you can with ease.     
 *
 * Mineflayer API documentation - https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md
 * Mineflayer Pathfinder API documentation - https://github.com/PrismarineJS/mineflayer-pathfinder/blob/master/readme.md
 */
const RGBot = class {

  constructor(bot) {

    this.mcData = require('minecraft-data')(bot.version);

    // load pathfinder plugin and setup default Movements. 
    // The player can override this by setting new Movements.
    bot.loadPlugin(pathfinder);
    bot.pathfinder.setMovements(new Movements(bot, this.mcData));

    this.bot = bot;
    this.debug = false;
  }

  /**
   * Enable or disable debug logs
   * @param debug
   * @return { void }
   */
  setDebug(debug) {
    this.debug = debug;
  }

  /**
   * Log a message if debug is enabled
   * @param message
   * @return { void }
   */
  #log(message) {
    if (this.debug) {
      console.log(message);
    }
  }

  /**
   * Bot sends a chat message in-game. If debug is enabled, also outputs to log.
   * @param message
   * @return { void }
   */
  chat(message) {
    this.bot.chat(message);
    this.#log(message);
  }

  /**
   * Choose a random point within a minimum and maximum radius around the bot and approach it.
   * Points are calculated on the X and Z axes 
   * Returns true if the bot successfully reached its wander goal, else returns false.
   * @param minDistance
   * @param minDistance
   * @return { Promise<boolean> }
   */
  async wander(minDistance = 10, maxDistance = 10) {
    if (minDistance < 1) {
      minDistance = 1;
    }
    if (maxDistance < minDistance) {
      maxDistance = minDistance;
    }
    let xRange = (minDistance + (Math.random() * (maxDistance - minDistance))) * (Math.random() < 0.5 ? -1 : 1);
    let zRange = (minDistance + (Math.random() * (maxDistance - minDistance))) * (Math.random() < 0.5 ? -1 : 1);
    let newX = this.bot.entity.position.x + xRange;
    let newZ = this.bot.entity.position.z + zRange;

    const pathFunc = async () => {
      await this.bot.pathfinder.goto(new GoalXZ(newX, newZ));
    };
    return await this.handlePath(pathFunc);
  }

  /**
   * Returns the player with this username if they exist in the current match. If they do not exist, returns null.
   * @param username
   * @return { Entity | null }
   */
  getPlayerEntity(username) {
    return this.bot.players[username] ? this.bot.players[username].entity : null
  }

  /**
   * Find the nearest entity with the specified name or null if no matching entity can be found.
   * Only locates entities that can be engaged in combat.
   * @targetName The name of the target entity. If not specified, then returns the closest attackable entity of any type.
   * @return { Entity | null }
   */
  findAttackableEntity(targetName) {
    return this.bot.nearestEntity(entity => {
      if (!targetName || this.entityNamesMatch(targetName, entity)) {
        this.chat(`Evaluating attack target: ${(entity.displayName || entity.name)}, isValid: ${entity.isValid}, isMobOrPlayer: ${(entity.type === 'mob' || entity.type === 'player')}`)
        return (entity.isValid && (entity.type === 'mob' || entity.type === 'player'))
      }
      return false
    });
  }

  /**
   * Represent a Vec3 position as a string in the format `x, z, y`
   * @param position
   * returns { string }
   */
  positionString(position) {
    return `${position.x}, ${position.z}, ${position.y}`
  }

  /**
   * Accepts an Item Entity and returns the displayName of the Item, or its name if it has no displayName.
   * @param item
   * @return { string | undefined }
   */
  getItemName(item) {
    return item.displayName || item.name;
  }

  /**
   * Accepts the name of an Item and returns the corresponding Entity definition for the Item. 
   * If the Item isn't defined in minecraft's data, returns null instead.
   * @param itemName
   * @return { Item | null }
   */
  getItemByName(itemName) {
    try {
      return this.mcData.itemsByName[itemName];
    } catch (err) {
      console.error(`Couldn't find item in notch data: ${err.message}`);
      return null;
    }
  }

  /**
   * Accepts the id of an Item and returns the corresponding Entity definition for the Item.
   * If the Item isn't defined in minecraft's data, returns null instead.
   * @param itemId - the item's numerical id
   * @return { Item | null }
   */
  getItemById(itemId) {
    try {
      return this.mcData.items[itemId];
    } catch (err) {
      console.error(`Couldn't find item in notch data: ${err.message}`);
      return null;
    }
  }

  /**
   * Compares two Entities and returns true if either their names or displayNames match.
   * By default, performs a partial match. For example, 'planks' will match any Entity containing 'planks' in its name ('spruce_planks', 'oak_planks', etc.).
   * To force exact matches use `exactMatch`.
   * @param targetName
   * @param entity
   * @param exactMatch
   * @return { boolean }
   */
  entityNamesMatch(targetName, entity, exactMatch = false) {
    const text = targetName.toLowerCase();
    const namesMatch = entity.name && ((entity.name.toLowerCase() == text) || (!exactMatch && entity.name.toLowerCase().includes(text)));
    const displayNamesMatch = entity.displayName && ((entity.displayName.toLowerCase() == text) || (!exactMatch && entity.displayName.toLowerCase().includes(text)));
    return namesMatch || displayNamesMatch;
  }

  /**
   * The bot will approach the given Entity. Returns true if the bot successfully reaches the Entity, else returns false.
   * @param entity - the Entity to approach
   * @param maxDistance - the max distance the bot may stand from its target
   * @return { Promise<boolean> }
   */
  async approachEntity(entity, maxDistance = 1) {
    if (!entity) {
      console.error(`approachEntity: Entity was null or undefined`);
      return false;
    } else {
      this.#log(`Approaching ${(entity.displayName || entity.name)} at a max distance of ${maxDistance}`);
      const goal = new GoalNear(entity.position.x, entity.position.y, entity.position.z, maxDistance);
      const pathFunc = async () => {
        await this.bot.pathfinder.goto(goal);
      };
      return await this.handlePath(pathFunc);
    }
  }

  /**
   * Experimental
   *
   * The bot will follow the given Entity within a maximum distance.
   * @param entity - the Entity to follow
   * @param maxDistance - the max distance the bot may be from its target
   * @return { Promise<void> }
   */
  async followEntity(entity, maxDistance = 2) {
    if (!entity) {
      console.error(`followEntity: Entity was null or undefined`);
    } else {
      this.#log(`Following ${(entity.displayName || entity.name)} at a max distance of ${maxDistance}`);
      this.bot.pathfinder.setGoal(new GoalFollow(entity, maxDistance), true);
    }
  }

  /**
   * Experimental
   *
   * The bot will avoid the given Entity, and must remain a minumum distance from it.
   * @param entity - the Entity to avoid
   * @param minDistance - the minimum distance the bot must remain from its target
   * @return { Promise<void> }
   */
  async avoidEntity(entity, minDistance = 5) {
    if (!entity) {
      console.error(`avoidEntity: Entity was null or undefined`);
    } else {
      this.#log(`Avoiding ${(entity.displayName || entity.name)} at a minumum distance of ${minDistance}`);
      this.bot.pathfinder.setGoal(new GoalInvert(new GoalFollow(entity, minDistance)), true);
    }
  }

  /**
   * Experimental
   *
   * The bot will attack the given Entity
   * @param entity
   * @return { Promise<void> }
   */
  async attackEntity(entity) {
    if (!entity) {
      console.error(`attackEntity: Entity was null or undefined`);
    } else {
      try {
        this.#log(`Attacking ${(entity.displayName || entity.name)}`);
        this.bot.attack(entity, true);
      } catch (err) {
        console.error(`Error attacking target: ${(entity.displayName || entity.name)}`, err)
      }
    }
  }

  /**
   * Attempt to locate the nearest block of the given type within a specified range from the bot.
   * @param blockType - the displayName or name of the block to find
   * @param exactMatch - only find blocks whose name / displayName match the blockType exactly.
   * @param onlyFindTopBlocks - will not return any blocks that are beneath another block
   * @param maxDistance - entities beyond this distance from the bot will not be found
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
      this.#log(`Found Block of type ${blockType} within a maximum distance of ${maxDistance}`);
    }
    else {
      this.#log(`I did not find any Blocks of type ${blockType} within a maximum distance of ${maxDistance}`);
    }
    return result;
  }


  /**
   * Attempt pathfinding. If the bot becomes 'stuck' then cancel pathfinding.
   * The bot is considered 'stuck' if it fails to move or perform mining/building actions during a specified interval. 
   * Returns true if that path is allowed to complete, else returns false.
   * @param pathFunc - a function utilizing pathfinder to move the bot
   * @param interval - How long in ms a bot must be inactive to be considered 'stuck' 
   * @return { Promise<boolean> }
   */
  async handlePath(pathFunc, interval = 5000) {

    let previousPosition = this.bot.entity.position;
    let wasActive = true;
    let stuck = false;

    const checkPosition = () => {
      let currentPosition = this.bot.entity.position;
      let isActive = this.bot.pathfinder.isMining() || this.bot.pathfinder.isBuilding();
      if (currentPosition.equals(previousPosition, 0.005) && !wasActive && !isActive) {
        // if the bot hasn't moved or performed other actions then we are stuck
        // stop pathfinder and remove its current goal
        this.#log('Bot is stuck. Stopping current path.');
        stuck = true;
        this.bot.pathfinder.stop();
        this.bot.pathfinder.setGoal(null);
      } else {
        previousPosition = currentPosition;
        wasActive = isActive;
      }
    }

    const timer = setInterval(checkPosition, interval);
    try {
      await pathFunc();
    } finally {
      clearInterval(timer);
      return !stuck;
    }
  }

  /**
   * The bot will approach and stand within reach of the given Block.
   * Returns true if pathing was successfully completed or false if pathing could not be completed.
   * @param block - the Block instance to approach
   * @param reach
   * @return { Promise<boolean> }
   */
  async approachBlock(block, reach = 10) {
    try {
      const pathFunc = async () => {
        await this.bot.pathfinder.goto(new GoalLookAtBlock(block.position, this.bot.world, { reach: reach }))
      };
      return await this.handlePath(pathFunc);
    } catch (err) {
      console.error('Error approaching block', err);
    }
  }

  /**
   * Place a Block from the bot's inventory against a target Block
   * @param blockName The name of the Block to place. Must be available in the bot's inventory.
   * @param targetBlock The target Block to place the new Block on/against
   * @param faceVector The face of the targetBlock to place the new block against. (Ex. Vec3(0, 1, 0) represents the topmost face of the targetBlock)
   * @param reach The maximum distance the bot may be from the Block while placing it
   * @return { Promise<void> }
   */
  async placeBlock(blockName, targetBlock, faceVector = new Vec3(0, 1, 0), reach = 20) {
    this.#log(`Moving to position ${this.positionString(targetBlock.position)} to place ${blockName}`);
    await this.bot.pathfinder.goto(new GoalPlaceBlock(targetBlock.position.plus(new Vec3(3, 1, 3)), this.bot.world, { reach: reach }))
    await this.bot.equip(this.getInventoryItemId(blockName), 'hand'); // equip block in hand
    await this.bot.placeBlock(targetBlock, faceVector); // place it
  }

  /**
   * Equip the best tool for harvesting the specified Block.
   * Returns the tool that was equipped or null if the bot did not have the tool in its inventory.
   * @param block - a harvestable Block instance
   * @return { Promise<Item> | Promise<null>}
   */
  async equipBestHarvestTool(block) {
    const bestHarvestTool = this.bot.pathfinder.bestHarvestTool(block);
    if (bestHarvestTool) {
      try {
        await this.bot.equip(bestHarvestTool, 'hand');
        return this.bot.heldItem;
      } catch (err) {
        console.error('Unable to equip a better tool', err);
        return null;
      }
    }
  }

  /**
   * Harvest the given Block.
   * This will equip the most appropriate tool in the bot's inventory for this Block type.
   * @param block - the Block instance to dig
   * @return { Promise<void> }
   */
  async digBlock(block) {
    if (!block) {
      console.error(`digBlock: Block was null or undefined`);
    } else {
      await this.equipBestHarvestTool(block);
      const checkForInfiniteDig = async (reason) => {
        if (reason == 'block_updated' || reason == 'dig_error') {
          // if bot is still digging but the target block no longer exists then stop the bot
          if (this.bot.pathfinder.isMining() && !this.bot.targetDigBlock) {
            this.#log('Cancelling current dig because target block no longer exists.');
            this.bot.stopDigging();
            this.bot.pathfinder.stop();
            this.bot.pathfinder.setGoal(null);
          }
        }
      }
      this.bot.on('path_reset', checkForInfiniteDig);
      this.#log(`Digging ${block.displayName || block.name}`);
      await this.bot.dig(block);
      this.bot.off('path_reset', checkForInfiniteDig);
    }
  }

  /**
   * Locate and harvest the closest Block of a given type within a maximum distance from the bot. 
   * This method will equip the most appropriate tool in the bot's inventory for this Block type.
   * Returns true if a Block was found and digging was successful.
   * Returns false if a Block was not found or if digging was interrupted.
   * @param block - the name of the Block to find and dig
   * @param exactMatch - only find Blocks whose name / displayName match the blockType exactly
   * @param onlyFindTopBlocks - will not attempt to harvest any Blocks that are beneath another Block
   * @param maxDistance - Blocks further than this distance from the bot will not be found
   * @param skipClosest - will attempt to locate the next-closest Block. This can be used to skip the closest Block when the bot encounters an issue collecting it
   * @return { Promise<boolean> }
   */
  async findAndDigBlock(blockType, exactMatch = false, onlyFindTopBlocks = false, maxDistance = 50, skipClosest = false) {
    let result = false;
    const block = this.findBlock(blockType, exactMatch, onlyFindTopBlocks, maxDistance, skipClosest);
    if (block) {
      try {
        if (await this.approachBlock(block)) {
          await this.digBlock(block);

          // collect any dropped items
          let droppedItem = null;
          await this.bot.waitForTicks(25); // give the server time to create drops
          if (block.drops && block.drops.length > 0) {
            droppedItem = await this.findItemOnGround(block.drops[0]);
          } else {
            droppedItem = await this.findItemOnGround(block.name || block.displayName);
          }

          if (droppedItem) {
            await this.approachItem(droppedItem);
          }
          result = true;
        }
      }
      catch (err) {
        console.error('Error finding and digging block', err)
      }
    }
    return result;
  }

  /**
   * Locate the closest Item with the given name within a maximum distance from the bot, or null if no matching Items are found.
   * @param itemName
   * @param maxDistance
   * @return { Item | null }
   */
  findItemOnGround(itemName, maxDistance = 30) {
    this.#log(`Detecting items with ${itemName} within a max distance of ${maxDistance}`);
    return this.bot.nearestEntity((entity) => {
      if (entity.type === "object" && entity.objectType === "Item" && entity.onGround) {
        const itemEntity = this.getItemById(entity.metadata[8].itemId);
        const matchedName = !itemName || this.entityNamesMatch(itemName, itemEntity);
        if (matchedName && this.bot.entity.position.distanceTo(entity.position) < maxDistance) {
          return entity;
        }
      }
    });
  }

  /**
  * Approach an Item. If the bot has space in its inventory, the Item will be picked up.
  * Returns true if pathing was successfully completed or false if pathing could not be completed.
  * @param item
  * @return { Promise<boolean> }
  */
  async approachItem(item) {
    if (!item) {
      console.error(`approachItem: Item was null or undefined`);
      return false;
    } else {
      this.#log(`Approaching ${(item.displayName || item.name)}`);
      const pathFunc = async () => {
        await this.bot.pathfinder.goto(new GoalBlock(item.position.x, item.position.y, item.position.z));
      }
      return await this.handlePath(pathFunc);
    }
  }

  /**
   * Experimental
   * 
   * Drop an inventory Item. By default, drops all items containing the itemName.
   * Ex. dropping 'planks', drops any item contaiing 'planks' in its name ('sruce_planks', 'oak_planks', etc.).
   * To specify a quantity to drop, use `quantity`.
   * @param itemName
   * @param quantity - the quantity of this Item to drop. -1 drops all.
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
  * Return the id of an Item in the bot's inventory.
  * If the Item isn't defined in minecraft's data or is not in the bot's inventory, returns null instead.
  * @param itemName
  * @return { number | null }
  */
  getInventoryItemId(itemName) {
    const itemId = (this.getItemByName(itemName)).id;
    if (itemId) {
      return this.bot.inventory.findInventoryItem((itemId));
    } else {
      return null;
    }
  }

  /**
   * Return how many of a specific item the bot currently holds in its inventory. 
   * @itemName
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
    this.#log(`Bot has ${quantityAvailable} of item ${itemName}`);
    return quantityAvailable;
  }

  /**
   * Returns true if the bot has at least a specific quantity of an Item in its inventory, or false if it does not.
   * By default, checks for a quantity of at least 1.
   * @param quantity
   * @return { boolean }
   */
  inventoryContainsItem(itemName, quantity = 1) {
    if (quantity < 1) {
      quantity = 1;
    }
    return this.getInventoryItemQuantity(itemName) >= quantity;
  }

  /**
   * Craft an Item. Returns the crafted Item or null if crafting fails.
   * The bot must have enough materials to make at least one of these Items, or else recipe lookup will fail.
   * If the recipe requires a crafting station, then a craftingTable entity is required for success.
   * @param itemName - the Item to craft
   * @param quantity - The number of times to craft this Item. Note: this is NOT the total quantity that should be crafted (Ex. `craftItem('stick', 4)` will result in 16 sticks rather than 4) 
   * @param craftingTable - For recipes that require a crafting table/station. A Block Entity representing the appropriate station within reach of the Bot. 
   * @return { Promise<Item> | Promise<null> }
   */
  async craftItem(itemName, quantity = 1, craftingTable = null) {
    let result = null;
    const itemId = (this.getItemByName(itemName)).id;
    const recipes = await this.bot.recipesFor(itemId, null, null, craftingTable);
    if (recipes.length == 0) {
      this.#log(`Failed to create ${itemName}. Either the item is not valid, or the bot does not possess the required materials to craft it.`);
    }
    else {
      try {
        await this.bot.craft(recipes[0], quantity, craftingTable);
        result = this.bot.inventory.findInventoryItem((itemId));
        this.#log(`Crafted ${quantity} of ${itemName}`);
      }
      catch (err) {
        console.error(`Failed to craft ${itemName}: ${err}`);
      }
    }
    return result;
  }

  /**
   * Equips an Item to the Bot's hand. The Bot must have the Item in its inventory to hold it.
   * Returns the held Item or null if the Bot was unable to equip the item.
   * @param itemName
   * @return { Promise<Item> | Promise<null>}
   */
  async holdItem(itemName) {
    const itemId = this.getInventoryItemId(itemName);
    if (itemId) {
      await this.bot.equip(itemId, 'hand');
      return this.bot.heldItem;
    }
    else {
      console.error(`Equip failed: inventory does not contain ${itemName}`);
      return null;
    }
  }

}

module.exports = RGBot