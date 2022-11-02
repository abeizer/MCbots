const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalNear, GoalBlock, GoalPlaceBlock, GoalLookAtBlock, GoalXZ, GoalInvert, GoalFollow } = require('mineflayer-pathfinder').goals
const { Vec3 } = require('vec3');

/**
 *
 * <h2><u>Glossary:</u></h2>
 *
 *  <b><u>Mineflayer and Pathfinder</u></b><br>
 *    Mineflayer is a high-level JavaScript API based on the for creating Minecraft Bots.
 *    Mineflayer supports third-party plugins like Pathfinder - an advanced Pathfinding library to help your Bot navigate the world.
 *    Regression Games uses Mineflayer and Pathfinder to create a stable and user-friendly library. Create the best Bot you can with ease. <br>
 *    <i>Mineflayer API documentation - https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md </i><br>
 *    <i>Mineflayer Pathfinder API documentation - https://github.com/PrismarineJS/mineflayer-pathfinder/blob/master/readme.md </i><br>
 *
 *
 *  <b><u>Vec3</u></b><br>
 *    Mineflayer indicates the position of an object as a point along 3 axes. These points are represented as Vec3 instances in the following format:
 *      {x (south), y (up), z(west)} <br>
 *    <i>Vec3 Documentation - https://github.com/PrismarineJS/node-vec3 </i><br>
 *
 *  <b><u>Entity</u></b><br>
 *    An Entity is anything that can be dynamically spawned into the Minecraft world.
 *    Common Entities include other players, enemy mobs, items in your inventory or floating on the ground, and objects you can interact with such as minecarts or beds.
 *
 *  <b><u>Block</u></b><br>
 *    A Block is a specific type of Entity that exist in the environment.
 *    Some yield materials when collected, like blocks of Coal or Diamond, while others can be interacted with like ladders and vines. <br>
 *  
 *  <b><u>Item</u></b><br>
 *    An Item represents any item that can be collected in the player's inventory or hands.
 *    These can be things like weapons and armor that the player equips, crafting materials, or items that can be placed to create a Block.
 *    This last example brings up an important distinction to keep in mind while creating your Bot: an object is an Item when in the Bot's inventory or hand, but a Block once it is placed in the world.
 *
 *  <b><u>Name versus Display Name</u></b><br>
 *    An Entity's name is a unique identifier, and its display name is typically the same or similar identifier but in a human-readable format.
 *    As an example, the Ender Dragon is the readable name, or display name, of the Entity named ender_dragon. Likewise, Grass Block is the display name of the block named grass_block. 
 *    This library attempts to accept both the name and display name interchangeably wherever possible, so the identifier you use is up to your own personal tastes. 
 */
const RGBot = class {

  constructor(bot) {

    // load pathfinder plugin and setup default Movements.
    // The player can override this by setting new Movements.
    this.mcData = require('minecraft-data')(bot.version);
    bot.loadPlugin(pathfinder);
    bot.pathfinder.setMovements(new Movements(bot, this.mcData));

    this.bot = bot;
    this.debug = false;
  }

  /**
   * Enable or disable debug logs
   * @param debug {boolean}
   * @return {void}
   */
  setDebug(debug) {
    this.debug = debug;
  }

  /**
   * Log a message if debug is enabled
   * @param message {string}
   * @return {void}
   */
  #log(message) {
    if (this.debug) {
      console.log(message);
    }
  }

  /**
   * Bot sends a chat message in-game. If debug is enabled, also outputs to log.
   * @param message {string}
   * @return {void}
   */
  chat(message) {
    this.bot.chat(message);
    this.#log(message);
  }

  /**
  * Waits for the specified number of in-game ticks before continuing.
  * This is similar to the standard JavaScript setTimeout function but runs on the physics timer of the Bot specifically. 
  * @param ticks {number} - the number of in-game ticks to wait
  * @return {Promise<void>}
  */
  async wait(ticks) {
    await this.bot.waitForTicks(ticks);
  }

  /**
   * Choose a random point within a minimum and maximum radius around the Bot and approach it.
   * Points are calculated on the X and Z axes 
   * @param minDistance {number}
   * @param maxDistance {number}
   * @return {Promise<boolean>} - true if the Bot successfully reached its wander goal, else false
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
   * @param username {string}
   * @return {Entity | null}
   */
  getPlayerEntity(username) {
    return this.bot.players[username] ? this.bot.players[username].entity : null
  }

  /**
   * Find the nearest entity with the specified name or null if no matching entity can be found.
   * Only locates entities that can be engaged in combat.
   * @param targetName {string} - the name of the target entity. If not specified, then returns the closest attackable entity of any type.
   * @return {Entity | null}
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
   * Represent a Vec3 position as a string in the format 'x, z, y'
   * @param position {vec3}
   * @returns {string}
   */
  positionString(position) {
    return `${position.x}, ${position.z}, ${position.y}`
  }

  /**
   * Accepts an Item Entity and returns the displayName of the Item, or its name if it has no displayName.
   * @param item {Item}
   * @return {string | undefined}
   */
  getItemName(item) {
    return item.displayName || item.name;
  }

  /**
   * Accepts the name of an Item and returns the corresponding Entity definition for the Item. 
   * If the Item isn't defined in minecraft's data, returns null instead.
   * @param itemName {string}
   * @return {Item | null}
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
   * @param itemId {number} - the item's numerical id
   * @return {Item | null}
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
   * @param targetName {string}
   * @param entity {Entity}
   * @param options {object} - optional parameters
   * @param options.exactMatch {boolean}
   * @return {boolean}
   */
  entityNamesMatch(targetName, entity, options = {}) {
    const exactMatch = options.exactMatch || false;
    const text = targetName.toLowerCase();
    const namesMatch = entity.name && ((entity.name.toLowerCase() == text) || (!exactMatch && entity.name.toLowerCase().includes(text)));
    const displayNamesMatch = entity.displayName && ((entity.displayName.toLowerCase() == text) || (!exactMatch && entity.displayName.toLowerCase().includes(text)));
    return namesMatch || displayNamesMatch;
  }

  /**
   * The Bot will approach the given Entity.
   * @param entity {Entity} - the Entity to approach
   * @param options {object} - optional parameters
   * @param options.maxDistance {number} - the max distance the Bot may stand from its target
   * @return {Promise<boolean>} - true if the Bot successfully reaches the Entity, else false
   */
  async approachEntity(entity, options = {}) {
    const maxDistance = options.maxDistance || 1;
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
   * <i><b>Experimental</b></i>
   *
   * The Bot will follow the given Entity within a maximum distance.
   * @param entity {Entity} - the Entity to follow
   * @param options {object} - optional parameters
   * @param options.maxDistance {number} - the max distance the Bot may be from its target
   * @return {Promise<void>}
   */
  async followEntity(entity, options = {}) {
    const maxDistance = options.maxDistance || 2;
    if (!entity) {
      console.error(`followEntity: Entity was null or undefined`);
    } else {
      this.#log(`Following ${(entity.displayName || entity.name)} at a max distance of ${maxDistance}`);
      this.bot.pathfinder.setGoal(new GoalFollow(entity, maxDistance), true);
    }
  }

  /**
   * <i><b>Experimental</b></i>
   *
   * The Bot will avoid the given Entity, and must remain a minumum distance from it.
   * @param entity {Entity} - the Entity to avoid
   * @param options {object} - optional parameters
   * @param options.minDistance {number} - the minimum distance the Bot must remain from its target
   * @return {Promise<void>}
   */
  async avoidEntity(entity, options = {}) {
    const minDistance = options.minDistance || 5;
    if (!entity) {
      console.error(`avoidEntity: Entity was null or undefined`);
    } else {
      this.#log(`Avoiding ${(entity.displayName || entity.name)} at a minumum distance of ${minDistance}`);
      this.bot.pathfinder.setGoal(new GoalInvert(new GoalFollow(entity, minDistance)), true);
    }
  }

  /**
   * <i><b>Experimental</b></i>
   *
   * The Bot will attack the given Entity
   * @param entity {Entity}
   * @return {Promise<void>}
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
   * Attempt to locate the nearest block of the given type within a specified range from the Bot.
   * @param blockType {string} - the displayName or name of the block to find
   * @param options - optional parameters
   * @param options.exactMatch {boolean} - only find blocks whose name / displayName match the blockType exactly.
   * @param options.onlyFindTopBlocks {boolean} - will not return any blocks that are beneath another block
   * @param options.maxDistance {number} - entities beyond this distance from the Bot will not be found
   * @param options.skipClosest {boolean} - will attempt to locate the next-closest Block. This can be used to skip the closest Block when the Bot encounters an issue collecting it.
   * @return {Block | null}
   */
  findBlock(blockType, options = {}) {
    const exactMatch = options.exactMatch || false;
    const onlyFindTopBlocks = options.onlyFindTopBlocks || false;
    const maxDistance = options.maxDistance || 50;
    const skipClosest = options.skipClosest || false;
    let nearbyBlocks = this.bot.findBlocks({
      point: this.bot.entity.position, // from the bot's current position
      maxDistance: maxDistance, // find blocks within range
      count: (skipClosest ? 2 : 1),
      matching: (block) => {
        let blockFound = false;
        if (blockType) {
          blockFound = (this.entityNamesMatch(blockType, block, { exactMatch }));
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
   * Attempt pathfinding. If the Bot becomes 'stuck' then cancel pathfinding.
   * The Bot is considered 'stuck' if it fails to move or perform mining/building actions during a specified interval. 
   * @param pathFunc {function} - a function utilizing pathfinder to move the Bot
   * @param options {object} - optional parameters
   * @param options.interval {number} - how long in ms a Bot must be inactive to be considered 'stuck'
   * @return {Promise<boolean>} -  true if pathing completes, or false if pathing is cancelled or otherwise interrupted
   */
  async handlePath(pathFunc, options = {}) {
    const interval = options.interval || 5000;
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
   * The Bot will approach and stand within reach of the given Block.
   * @param block {Block} - the Block instance to approach
   * @param options {object} - optional parameters
   * @param options.reach {number}
   * @return {Promise<boolean>} - true if pathing was successfully completed or false if pathing could not be completed
   */
  async approachBlock(block, options = {}) {
    const reach = options.reach || 10;
    const pathFunc = async () => {
      await this.bot.pathfinder.goto(new GoalLookAtBlock(block.position, this.bot.world, { reach: reach }))
    };
    try {
      this.#log(`Approaching ${block.displayName || block.name}`);
      return await this.handlePath(pathFunc);
    } catch (err) {
      console.error('Error approaching block', err);
    }
  }

  /**
   * Experimental
   *
   * Place a Block from the Bot's inventory against a target Block
   * @param blockName {string} - the name of the Block to place. Must be available in the Bot's inventory.
   * @param targetBlock  {Block} - the target Block to place the new Block on/against
   * @param options {object} - optional parameters
   * @param options.faceVector {Vec3} - the face of the targetBlock to place the new block against. (Ex. Vec3(0, 1, 0) represents the topmost face of the targetBlock)
   * @param options.reach {number} - the maximum distance the Bot may be from the Block while placing it
   * @return { Promise<void> }
   */
  async placeBlock(blockName, targetBlock, options = {}) {
    const faceVector = options.faceVector || new Vec3(0, 1, 0);
    const reach = options.reach || 5;
    this.#log(`Moving to position ${this.positionString(targetBlock.position)} to place ${blockName}`);
    await this.bot.pathfinder.goto(new GoalPlaceBlock(targetBlock.position.plus(new Vec3(3, 1, 3)), this.bot.world, { reach: reach }))
    await this.bot.equip(this.getInventoryItemId(blockName), 'hand'); // equip block in hand
    await this.bot.placeBlock(targetBlock, faceVector); // place it
  }

  /**
   * Equip the best tool for harvesting the specified Block.
   * @param block {Block} - a harvestable Block instance
   * @return {Promise<Item | null>} - the tool that was equipped or null if the Bot did not have the tool in its inventory
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
   * This will equip the most appropriate tool in the Bot's inventory for this Block type.
   * @param block {Block} - the Block instance to dig
   * @return {Promise<void>}
   */
  async digBlock(block) {
    if (!block) {
      console.error(`digBlock: Block was null or undefined`);
    } else {
      await this.equipBestHarvestTool(block);
      const checkForInfiniteDig = async (reason) => {
        if (reason == 'block_updated' || reason == 'dig_error') {
          // if Bot is still digging but the target block no longer exists then stop the Bot
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
   * Locate and harvest the closest Block of a given type within a maximum distance from the Bot. 
   * This method will equip the most appropriate tool in the Bot's inventory for this Block type.
   * @param blockType {string} - the name of the Block to find and dig
   * @param options {object} - optional parameters
   * @param options.exactMatch {boolean} - only find Blocks whose name / displayName match the blockType exactly
   * @param options.onlyFindTopBlocks {boolean} - will not attempt to harvest any Blocks that are beneath another Block
   * @param options.maxDistance {number} - Blocks further than this distance from the Bot will not be found
   * @param options.skipClosest {number} - will attempt to locate the next-closest Block. This can be used to skip the closest Block when the Bot encounters an issue collecting it
   * @return {Promise<boolean>} - true if a Block was found and dug successfully or false if a Block was not found or if digging was interrupted
   */
  async findAndDigBlock(blockType, options = {}) {
    const exactMatch = options.exactMatch || false;
    const onlyFindTopBlocks = options.onlyFindTopBlocks || false;
    const maxDistance = options.maxDistance || 50;
    const skipClosest = options.skipClosest || false;

    let result = false;
    const block = this.findBlock(blockType, { exactMatch, onlyFindTopBlocks, maxDistance, skipClosest });
    if (block) {
      try {
        if (await this.approachBlock(block)) {
          await this.digBlock(block);

          // collect any dropped items
          let droppedItem = null;
          await this.wait(25); // give the server time to create drops
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
   * Locate the closest Item with the given name within a maximum distance from the Bot, or null if no matching Items are found.
   * @param itemName {string}
   * @param options {object} - optional parameters
   * @param options.maxDistance {number}
   * @return {Item | null}
   */
  findItemOnGround(itemName, options = {}) {
    const maxDistance = options.maxDistance || 30;
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
  * Approach an Item. If the Bot has space in its inventory, the Item will be picked up.
  * @param item {Item}
  * @return {Promise<boolean>} - true if pathing was successfully completed or false if pathing could not be completed
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
   * <i><b>Experimental</i></b>
   * 
   * Drop an inventory Item containing the given itemName.
   *
   * Ex. dropping 'planks', drops any Item containing 'planks' in its name ('spruce_planks', 'oak_planks', etc.).
   * @param itemName {string}
   * @param options {object} - optional parameters
   * @param options.quantity {number} - the quantity of this Item to drop. Defaults to 1. To drop all, use -1 or call `dropAllInventoryItem` instead.
   * @return {Promise<void>}
   */
  async dropInventoryItem(itemName, options = {}) {
    const quantity = options.quantity || 1;
    let quantityAvailable = 0;
    let itemsToDrop = this.bot.inventory.items().filter((item) => {
      // don't drop an 'axe' unless it has explicitly requested... this prevents the Bot from dropping stone tools when dropping stone
      const isAxe = itemName.toLowerCase().includes('axe');
      const itemNameMatches = (item.name && item.name.toLowerCase().includes(itemName.toLowerCase()) && (isAxe || !item.name.toLowerCase().includes('axe')));
      const displayNameMatches = (item.displayName && item.displayName.toLowerCase().includes(itemName.toLowerCase()) && (isAxe || !item.displayName.toLowerCase().includes('axe')));
      if (itemNameMatches || displayNameMatches) {
        quantityAvailable += item.count
        return true;
      }
      return false;
    });

    if (quantityAvailable > 0) {
      let quantityToDrop = (quantity < 0 ? quantityAvailable : quantity);
      this.#log('I am dropping ' + quantityToDrop + ' ' + itemName)
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
      this.#log(`I don't have any ${itemName} to drop`)
    }
  }

  /**
   * <i><b>Experimental</i></b>
   * 
   * Drops all stacks of an Item in the Bot's inventory containing the itemName.
   *
   * Ex. dropping 'planks', drops any Item containing 'planks' in its name ('spruce_planks', 'oak_planks', etc.).
   *
   * Alias for `dropInventoryItem(itemName, {quantity: -1})`
   * @param itemName {string}
   * @return {Promise<void>}
   */
  async dropAllInventoryItem(itemName) {
    await this.dropInventoryItem(itemName, { quantity: -1 });
  }

  /**
  * Return the id of an Item in the Bot's inventory.
  * If the Item isn't defined in minecraft's data or is not in the Bot's inventory, returns null instead.
  * @param itemName {string}
  * @return {number | null}
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
   * Return how many of a specific item the Bot currently holds in its inventory.
   * @param itemName {string}
   * @return {int}
   */
  getInventoryItemQuantity(itemName) {
    let quantityAvailable = 0;
    this.bot.inventory.items().filter((item) => {
      if (this.entityNamesMatch(itemName, item, { exactMatch: true })) {
        quantityAvailable += item.count;
        return true;
      }
      return false;
    });
    this.#log(`Bot has ${quantityAvailable} of item ${itemName}`);
    return quantityAvailable;
  }

  /**
   * Returns true if the Bot has at least a specific quantity of an Item in its inventory, or false if it does not.
   * By default, checks for a quantity of at least 1.
   * @param itemName {string}
   * @param options {object} - optional parameters
   * @param options.quantity {number}
   * @return {boolean}
   */
  inventoryContainsItem(itemName, options = {}) {
    const quantity = options.quantity || 1;
    if (quantity < 1) {
      console.error(`inventoryContainsItem: invalid quantity ${quantity}`);
      return false;
    }
    return this.getInventoryItemQuantity(itemName) >= quantity;
  }

  /**
   * Craft an Item. The Bot must have enough materials to make at least one of these Items, or else recipe lookup will fail.
   * If the recipe requires a crafting station, then a craftingTable entity is required for success.
   * @param itemName {string} - the Item to craft
   * @param options {object} - optional parameters
   * @param options.quantity {string} - the number of times to craft this Item. Note: this is NOT the total quantity that should be crafted (Ex. `craftItem('stick', 4)` will result in 16 sticks rather than 4)
   * @param options.craftingTable {Block} - for recipes that require a crafting table/station. A Block Entity representing the appropriate station within reach of the Bot.
   * @return {Promise<Item | null>} - the crafted Item or null if crafting failed
   */
  async craftItem(itemName, options = {}) {
    const quantity = options.quantity || 1;
    const craftingTable = options.craftingTable || null;
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
   * @param itemName {string}
   * @return {Promise<Item | null>} - the held Item or null if the Bot was unable to equip the Item
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