/// <reference types="node" />
export = RGBot;
/**
 *
 * <h2><u>Glossary:</u></h2>
 *
 *  <b><u>Mineflayer and Pathfinder</u></b><br>
 *    Mineflayer is a high-level JavaScript API for creating Minecraft Bots.
 *    Mineflayer supports third-party plugins like Pathfinder - an advanced Pathfinding library to help your Bot navigate the world.
 *    Regression Games uses Mineflayer and Pathfinder to create a stable and user-friendly library. Create the best Bot you can with ease. <br>
 *    <i>Mineflayer API documentation - https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md </i><br>
 *    <i>Mineflayer Pathfinder API documentation - https://github.com/PrismarineJS/mineflayer-pathfinder/blob/master/readme.md </i><br>
 *
 *  <b><u>Vec3</u></b><br>
 *    Mineflayer indicates the position of an object as a point along 3 axes. These points are represented as Vec3 instances in the following format:
 *      {x (south), y (up), z(west)} <br>
 *    <i>Vec3 Documentation - https://github.com/PrismarineJS/node-vec3 </i><br>
 *
 *  <b><u>Entity</u></b><br>
 *    An Entity is anything that can be dynamically spawned into the Minecraft world.
 *    Common Entities include other players, enemy mobs, items in your inventory or floating on the ground, and objects you can interact with such as mine-carts or beds.
 *
 *  <b><u>Block</u></b><br>
 *    A Block is a specific type of Entity that exist in the environment.
 *    Some yield materials when collected, like blocks of Coal or Diamond, while others can be interacted with like ladders and vines. <br>
 *
 *  <b><u>Item</u></b><br>
 *    An Item represents any Entity that can be collected in the player's inventory or hands.
 *    These can be things like weapons and armor that the player equips, crafting materials, or items that can be placed to create a Block.
 *    This last example brings up an important distinction to keep in mind while creating your Bot: an object is an Item when in the bot inventory or hand, or when it has been tossed on the ground, but it is a Block once it is placed in the world.
 *
 *  <b><u>Name versus Display Name</u></b><br>
 *    An Entity's name is a unique identifier, and its display name is typically the same or similar identifier but in a human-readable format.
 *    As an example, the Ender Dragon is the readable name, or display name, of the Entity named ender_dragon. Likewise, Grass Block is the display name of the block named grass_block.
 *    This library provides functions to accept the name but not the display name for conciseness and efficiency
 */
declare class RGBot {
    /**
     *
     * @param {Bot} bot
     * @param {EventEmitter} matchInfoEmitter
     */
    constructor(bot: mineflayer.Bot, matchInfoEmitter: import("events"));
    /**
     * This is managed automatically by the craftItem(itemName, options) function.
     * This value is read by the handlePath function to know if the bot is busy crafting while evaluating if it is stuck or not.
     *
     * If you craft outside the handleCrafting function you should follow the example.
     *
     * @example
     * try {
     *     bot.isCrafting = true;
     *     //  do crafting actions
     * } finally {
     *     bot.isCrafting = false;
     * }
     *
     * @type {boolean}
     */
    isCrafting: boolean;
    /**
     * This is managed automatically by attackEntity(entity).  This is used to manage weapon cool-downs.
     *
     * If you attack outside the attackEntity function you should follow the example.
     *
     * @example
     * await bot.followEntity(entity, {reach: 2})
     * await bot.waitForWeaponCoolDown()
     * let attackItem = await bot.findAndEquipBestAttackItem()
     * bot.lastAttackTime = Date.now()
     * // actually perform the attack
     *
     * @type {number}
     */
    lastAttackTime: number;
    /**
     * This is managed automatically by attackEntity(entity).  This is used to manage weapon cool-downs.
     *
     * If you attack outside the attackEntity function you should follow the example.
     *
     * @example
     * await bot.followEntity(entity, {reach: 2})
     * await bot.waitForWeaponCoolDown()
     * let attackItem = await bot.findAndEquipBestAttackItem()
     * bot.lastAttackTime = Date.now()
     * bot.lastAttackItem = attackItem
     * // actually perform the attack
     *
     * @type {Item}
     */
    lastAttackItem: import("prismarine-item").Item;
    mcData: import("minecraft-data").IndexedData;
    debug: boolean;
    /**
     * Enable or disable debug logs.
     * @param {boolean} debug
     * @returns {void}
     */
    setDebug(debug: boolean): void;
    /**
     * Returns the mineflayer Bot instance controlled by the RGBot. Use this to interact with the mineflayer API directly.
     * @returns {Bot} The mineflayer Bot instance controlled by the RGBot
     * @see {@link https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md|MineFlayer API}
     *
     * @example <caption>Accessing mineflayer API through mineflayer()</caption>
     * // returns the bot username from mineflayer
     * rgBot.mineflayer().username
     */
    mineflayer(): mineflayer.Bot;
    /**
     * Listen for an event and invoke a function when it fires.
     * @param {string} event The event to listen for
     * @param {function} func Function that is invoked when event fires
     * @returns {void}
     *
     * @example <caption>Reacting to the spawn event</caption>
     * rgBot.on('spawn', () => { rgBot.chat('Hello World!') })
     */
    on(event: string, func: Function): void;
    /**
     * Enable or disable use of parkour while pathing to a destination. Parkour is disabled by default.
     * Parkour movements include moving vertically over trees and other structures rather than walking around them, and jumping over gaps instead of laying Blocks to cross them.
     * Enabling parkour may allow your Bot to reach destinations faster and place fewer blocks to achieve upwards movement.
     * However, this is more likely to cause the Bot to become stuck during pathing and may require additional logic to handle movement issues.
     * @param {boolean} allowParkour Whether the Bot is allowed to use parkour movements to reach a destination
     * @returns {void}
     */
    allowParkour(allowParkour: boolean): void;
    /**
     * Enable or disable the ability to dig blocks while pathing to a destination. Digging is enabled by default.
     * Disabling digging will allow your Bot to reach destinations without breaking important structures that stand between the bot and its goal.
     * @param {boolean} allowDig Whether the Bot is allowed to dig Blocks in order to remove obstacles that stand in the way of its destination
     * @returns {void}
     */
    allowDigWhilePathing(allowDig: boolean): void;
    /**
     * Bot sends a chat message in-game. Also outputs to console if debug is enabled.
     * @param {string} message The message to send
     * @returns {void}
     */
    chat(message: string): void;
    /**
     * Bot sends a whisper message in-game to a specific username.  Also outputs to console if debug is enabled.
     *
     * @param {string} username The username to whisper to
     * @param {string} message The message to send
     * @returns {void}
     */
    whisper(username: string, message: string): void;
    /**
     * Gets the current Regression Games match info.
     * This is updated every time a player_joined, player_left, match_started, match_ended, score_update event occurs on the matchInfoEmitter.
     *
     * You can also listen to these events in your own bot scripts.
     *
     * @example
     *
     *     matchInfoEmitter.on('player_joined', (matchInfo, playerName, team) => {
     *         console.log(`Player joined our match: ${playerName}-${team}`)
     *     })
     *
     *     matchInfoEmitter.on('match_ended', async(matchInfo) => {
     *         const points = matchInfo?.players.find(player => player.username === bot.userName())?.metadata?.score
     *         console.log(`The match has ended - I scored ${points} points`)
     *     })
     *
     * @returns {RGMatchInfo | null}
     */
    matchInfo(): RGMatchInfo | null;
    /**
     * Gets the username of this bot
     * @returns {string}
     */
    username(): string;
    /**
     * Gets the team name for the specific player
     *
     * @param {string} username Username of the player/bot
     *
     * @returns {string | null} Name of the team the player is on
     */
    teamForPlayer(username: string): string | null;
    /**
     * Gets the current position of the bot
     * @returns {Vec3}
     */
    position(): Vec3;
    /**
     * Waits for the specified number of in-game ticks before continuing.
     * Minecraft normally runs at 20 ticks per second, with an in-game day lasting 24,0000 ticks (20 minutes).
     * This is similar to the standard JavaScript setTimeout function but runs on the physics timer of the Bot specifically.
     * This is useful for waiting on the server to update a Block or spawn drops when you break a Block.
     * @param {number} ticks The number of in-game ticks to wait
     * @returns {Promise<void>}
     */
    wait(ticks: number): Promise<void>;
    /**
     * Represent a Vec3 position as a string in the format 'x, y, z'.
     * @param {Vec3} position A Vec3 object representing the position of some Entity
     * @returns {string} A string representation of the Vec3 position
     *
     * @example
     * // returns "15.0, 63, -22.2"
     * rgBot.vecToString(new Vec(15.0, 63, -22.2))
     */
    vecToString(position: Vec3): string;
    /**
     * Accepts a string in the format 'x, y, z' and returns a Vec3 object representing that position.
     * This is useful for creating chat commands that involve specific coordinates from the Player.
     * @param {string} positionString
     * @returns {Vec3 | null} A Vec3 representation of the position string, or null if the positionString was invalid
     *
     * @example
     * // returns new Vec(15.0, 63, -22.2)
     * rgBot.vecFromString("15.0, 63, -22.2")
     */
    vecFromString(positionString: string): Vec3 | null;
    /**
     * Accepts an Entity and returns the name of the Entity.  This does not consider displayName, only name.
     * If the entity has a 'username', returns username.
     * @param {Entity | Block | Item} entity
     * @returns {string | null}
     *
     * @example
     * // entity -> {username: "NinaTheDragon", name: "ender_dragon", displayName: "Ender Dragon"}
     * // returns "NinaTheDragon"
     * rgBot.getEntityName(entity)
     *
     * @example
     * // entity -> {username: undefined, name: "ender_dragon", displayName: "Ender Dragon"}
     * // returns "ender_dragon"
     * rgBot.getEntityName(entity)
     *
     * @example
     * // entity -> {username: undefined, name: "cocoa_beans", displayName: undefined}
     * // returns "cocoa_beans"
     * rgBot.getEntityName(entity)
     *
     * @example
     * // entity -> {username: undefined, name: undefined, displayName: undefined}
     * // returns null
     * rgBot.getEntityName(entity)
     */
    getEntityName(entity: import("prismarine-item").Item | import("prismarine-entity").Entity | import("prismarine-block").Block): string | null;
    /**
     * Accepts the name of an Item and returns the corresponding Entity definition for the Item.
     * If the Item isn't defined in minecraft's data, returns null instead.
     * @param {string} itemName The name of the Item to lookup (<i>not</i> its display name)
     * @returns {Item | null} The Item's definition (<i>not</i> an Item instance)
     *
     * @example
     * // returns {"id":102,"displayName":"Spruce Log","name":"spruce_log","stackSize":64}
     * rgBot.getItemDefinitionByName('spruce_log')
     */
    getItemDefinitionByName(itemName: string): import("prismarine-item").Item;
    /**
     * Accepts the id of an Item and returns the corresponding Entity definition for the Item.
     * If the Item isn't defined in minecraft's data, returns null instead.
     * @param {number} itemId The item's unique numerical id
     * @returns {Item | null} The Item's definition (<i>not</i> an Item instance)
     *
     * @example
     * // returns {"id":102,"displayName":"Spruce Log","name":"spruce_log","stackSize":64}
     * rgBot.getItemDefinitionByName(102)
     */
    getItemDefinitionById(itemId: number): import("prismarine-item").Item;
    /**
     * Determines whether an Entity's username or name is equal to a targetName string.  Does not consider displayName.
     * Matching is case-sensitive.
     *
     * @param {string} targetName
     * @param {Entity|Item} entity
     * @param {object} [options={}] Optional parameters
     * @param {boolean} [options.partialMatch=false] Allow partial matches. For example, '_planks' will match any Entity containing '_planks' in its name ('spruce_planks', 'oak_planks', etc.)
     * @returns {boolean}
     *
     * @example <caption>Full Match</caption>
     * const entity = rg.getItemDefinitionByName('iron_axe')
     * rgBot.entityNamesMatch('iron_axe', entity) // returns true
     * rgBot.entityNamesMatch('Iron Axe', entity) // returns false
     *
     * @example <caption>Partial Match</caption>
     * const entity = rg.getItemDefinitionByName('iron_axe')
     * rgBot.entityNamesMatch('_axe', entity, {partialMatch: true}) // returns true
     */
    entityNamesMatch(targetName: string, entity: import("prismarine-item").Item | import("prismarine-entity").Entity, options?: {
        partialMatch?: boolean;
    }): boolean;
    /**
     * Attempt pathfinding. If the Bot becomes 'stuck' then cancel pathfinding.
     * The Bot is considered 'stuck' if it fails to move or perform mining/crafting/chest-interaction actions during a specified interval.
     * @param {function()} [pathFunc] a function utilizing pathfinder to move the Bot
     * @param {object} [options={}] Optional parameters
     * @param {number} [options.interval=5000] how long in ms a Bot must be inactive to be considered 'stuck'
     * @returns {Promise<boolean>} true if pathing completes, or false if pathing is cancelled or otherwise interrupted
     *
     * @example
     * const goal = new GoalNear(entity.position.x, entity.position.y, entity.position.z, reach);
     * const success = await rgBot.handlePath(async () => {
     *  await rgBot.mineflayer().pathfinder.goto(goal);
     * });
     */
    handlePath(pathFunc?: () => any, options?: {
        interval?: number;
    }): Promise<boolean>;
    /**
     * Find the nearest entity matching the search criteria.
     * @param {object} [options={}] Optional parameters
     * @param {string} [options.targetName=undefined] Target a specific type of Entity. If not specified, then may return an Entity of any type
     * @param {boolean} [options.attackable=false] Only return entities that can be attacked
     * @returns {Entity | null} The nearest Entity matching the search criteria, or null if no matching Entity can be found
     *
     * @example <caption>Locate the nearest chicken</caption>
     * rgBot.findEntity({targetName: "chicken"})
     *
     */
    findEntity(options?: {
        targetName?: string;
        attackable?: boolean;
    }): import("prismarine-entity").Entity;
    /**
     * @callback FindEntitiesEntityValueFunction
     * @param {string} entityName
     * @returns {number}
     */
    /**
     * @callback FindEntitiesSortValueFunction
     * @param {number} distance
     * @param {number} pointValue
     * @param {number} health
     * @param {number} defense
     * @param {number} toughness
     * @returns {number}
     */
    /**
     * Find the nearest entity matching the search criteria.
     *
     * @param {object} [options={}]
     * @param {string[]} [options.entityNames=[]] List of targetNames to consider
     * @param {boolean} [options.attackable=false] Whether the entity must be attackable. If true finds only mob and player entities.
     * @param {boolean} [options.partialMatch=false] Consider entities whose username or name partially match one of the targetNames
     * @param {number} [options.maxDistance=undefined]  Max range to consider
     * @param {number} [options.maxCount=1]  Max count of matching entities to consider
     * @param {FindEntitiesEntityValueFunction} [options.entityValueFunction] Function to call to get the value of an entity based on its name (entityName). A good example function is { return scoreValueOf[entityUsername || entityName] }, where scoreValueOf is the point value or intrinsic value of the entity in the game mode being played.  If you don't want an entity considered, return a value < 0 for its value. Default value is 0 if no function is provided.
     * @param {FindEntitiesSortValueFunction} [options.sortValueFunction] Function to call to help sort the evaluation of results. Should return the best entity with the lowest sorting value.  Default is RGAlgorithms.DEFAULT_FIND_ENTITIES_SORT_VALUE_FUNCTION
     *
     * @return {Array<FindResult<Entity>>}
     *
     * To get only the 'best' entity result, call findEntities(...).shift().  Note that the result may be null if no entities were found
     */
    findEntities(options?: {
        entityNames?: string[];
        attackable?: boolean;
        partialMatch?: boolean;
        maxDistance?: number;
        maxCount?: number;
        entityValueFunction?: (entityName: string) => number;
        sortValueFunction?: (distance: number, pointValue: number, health: number, defense: number, toughness: number) => number;
    }): FindResult<import("prismarine-entity").Entity>[];
    /**
     * The Bot will approach the given Entity.
     * @param {Entity} entity The Entity to approach
     * @param {object} [options={}] Optional parameters
     * @param {number} [options.reach=1] The Bot will approach and stand within this reach of the Entity
     * @returns {Promise<boolean>} true if the Bot successfully reaches the Entity, else false
     */
    approachEntity(entity: import("prismarine-entity").Entity, options?: {
        reach?: number;
    }): Promise<boolean>;
    /**
     * <i><b>Experimental - The behaviour of this API can and almost certainly will change in a future API version.</b></i>
     *
     * The Bot will follow the given Entity.
     * @param {Entity} entity The Entity to follow
     * @param {object} [options={}] Optional parameters
     * @param {number} [options.reach=2] The Bot will follow and remain within this reach of the Entity
     * @returns {Promise<void>}
     */
    followEntity(entity: import("prismarine-entity").Entity, options?: {
        reach?: number;
    }): Promise<void>;
    /**
     * <i><b>Experimental - The behaviour of this API can and almost certainly will change in a future API version.</b></i>
     *
     * The Bot will avoid the given Entity.
     * @param {Entity} entity The Entity to avoid
     * @param {object} [options={}] Optional parameters
     * @param {number} [options.reach=5] The Bot will not move within this reach of the Entity
     * @returns {Promise<void>}
     */
    avoidEntity(entity: import("prismarine-entity").Entity, options?: {
        reach?: number;
    }): Promise<void>;
    /**
     *
     * This will move the bot to within range of the target, equip the most powerful weapon in the bot inventory,
     * and attack the target 1 time.  To finish off a target, this method must be called until the target is dead.
     *
     * Note: This currently only handles melee weapons
     *
     * @param {Entity} entity - The entity to attack
     * @param {object} [options={}] Optional parameters
     * @param {number} [options.reach=2] How close to get to the target before attacking
     * @param {Item} [options.attackItem=undefined] An item in the bot inventory to use for the attack
     * @returns {Promise<boolean>} - did we successfully attack
     *
     * @example
     * let target = //<someEntity>
     * while (target.isValid) {
     *     await attackEntity(target)
     * }
     *
     */
    attackEntity(entity: import("prismarine-entity").Entity, options?: {
        reach?: number;
        attackItem?: import("prismarine-item").Item;
    }): Promise<boolean>;
    /**
     * <i><b>Experimental - The behaviour of this API can and almost certainly will change in a future API version.</b></i>
     *
     * This uses lastAttackTime,lastAttackItem variables to manage weapon attack cool-downs.
     * This assumes that the weapon you just attacked with needs to cool-down before you can attack again,
     * even if that next attack is with a different weapon.
     *
     * Note: This currently only handles melee weapons
     *
     * @returns {Promise<void>}
     */
    waitForWeaponCoolDown(): Promise<void>;
    /**
     * Moves the bot to at least the specified distance away from the position indicated.
     * This draws a vector on the XZ plane from the position through the player and finds
     * the point at the specified distance.  The bot will move to that point unless it is
     * already further away than the distance.
     *
     * @param {Vec3} position The position to move away from
     * @param {number} distance How far away to move (minimum)
     * @returns {Promise<boolean>} True if the bot moved away or was already far enough away
     */
    moveAwayFrom(position: Vec3, distance: number): Promise<boolean>;
    /**
     * Choose a random point within a minimum and maximum radius around the Bot and approach it.
     * Points are calculated on the X and Z axes.
     * @param {number} [minDistance=10] The minimum distance the point may be from the Bot
     * @param {number} [maxDistance=10] The maximum distance the point may be from the Bot
     * @returns {Promise<boolean>} true if the Bot successfully reached its wander goal, else false
     */
    wander(minDistance?: number, maxDistance?: number): Promise<boolean>;
    /**
     * Attempt to locate the nearest block of the given type within a specified range from the Bot.
     * @param {string} blockType The name or name of the block to find
     * @param {object} [options={}] Optional parameters
     * @param {boolean} [options.partialMatch=false] Find blocks whose name contains blockType. (Ex. 'log' may find any of 'spruce_log', 'oak_log', etc.)
     * @param {boolean} [options.onlyFindTopBlocks=false] Will not return any blocks that are beneath another block
     * @param {number} [options.maxDistance=30] Find any Blocks matching the search criteria up to and including this distance from the Bot
     * @param {boolean} [options.skipClosest=false] Deprecated since 1.2.0 - If you want to skip a block from the result set, please use the findBlocks(options) function and process the results.  This method makes the best effort to still interpret this parameter, but is no longer skipping the closest block, but rather the best matching block.
     * @returns {Block | null}
     */
    findBlock(blockType: string, options?: {
        partialMatch?: boolean;
        onlyFindTopBlocks?: boolean;
        maxDistance?: number;
        skipClosest?: boolean;
    }): import("prismarine-block").Block;
    /**
     * @callback FindBlocksBlockValueFunction
     * @param {string} blockName
     * @returns {number}
     */
    /**
     * @callback FindBlocksSortValueFunction
     * @param {number} distance
     * @param {number} pointValue
     * @param {number} digTime
     * @returns {number}
     */
    /**
     * Returns the best block that is diggable within a maximum distance from the Bot.
     * @param {object} [options] optional parameters
     * @param {string[]} [options.blockNames=[]] List of blockNames to consider
     * @param {boolean} [options.partialMatch=false] Consider blocks whose name partially matches one of the blockNames
     * @param {boolean} [options.onlyFindTopBlocks=false] Only find blocks that don't have a block above them.
     * @param {number} [options.maxDistance=30] Max range to consider.  Be careful as large values have performance implications.  30 means up to 60x60x60 (216000) blocks could be evaluated.  50 means up to 100x100x100 (1000000) blocks could be evaluated
     * @param {number} [options.maxCount=1] Max count of matching blocks
     * @param {FindBlocksBlockValueFunction} [options.blockValueFunction] Function to call to get the value of a block based on its name (blockName). A good example function is { return scoreValueOf[blockName] }, where scoreValueOf is the point value or intrinsic value of the block in the game mode being played.  If you don't want a block considered, return a value < 0 for its value. Default value is 0 if no function is provided.
     * @param {FindBlocksSortValueFunction} [options.sortValueFunction] Function to call to help sort the evaluation of results. Should return the best entity with the lowest sorting value.  Default is RGAlgorithms.DEFAULT_FIND_BLOCKS_SORT_VALUE_FUNCTION
     * @returns {Array<FindResult<Block>>} - the best blocks found
     *
     * To get only the 'best' block result, call findBlocks(...).shift().  Note that the result may be null if no blocks were found
     */
    findBlocks(options?: {
        blockNames?: string[];
        partialMatch?: boolean;
        onlyFindTopBlocks?: boolean;
        maxDistance?: number;
        maxCount?: number;
        blockValueFunction?: (blockName: string) => number;
        sortValueFunction?: (distance: number, pointValue: number, digTime: number) => number;
    }): FindResult<import("prismarine-block").Block>[];
    /**
     * The Bot will approach and stand within reach of the given Block.
     * @param {Block} block The Block instance to approach
     * @param {object} [options={}] Optional parameters
     * @param {number} [options.reach=5] How close to get to the block
     * @returns {Promise<boolean>} true if pathing was successfully completed or false if pathing could not be completed
     */
    approachBlock(block: import("prismarine-block").Block, options?: {
        reach?: number;
    }): Promise<boolean>;
    /**
     * Move directly adjacent to a target Block and place another Block from the bot inventory against it.
     * @param {string} blockName The name of the Block to place. Must be available in the bot inventory
     * @param {Block} targetBlock The target Block to place the new Block on/against
     * @param {object} [options={}] Optional parameters
     * @param {Vec3} [options.faceVector=Vec3(0, 1, 0)] The face of the targetBlock to place the new block against (Ex. Vec3(0, 1, 0) represents the topmost face of the targetBlock)
     * @param {number} [options.reach=5] The Bot will stand within this reach of the targetBlock while placing the new Block
     * @returns {Promise<void>}
     */
    placeBlock(blockName: string, targetBlock: import("prismarine-block").Block, options?: {
        faceVector?: Vec3;
        reach?: number;
    }): Promise<void>;
    /**
     * Equip the best tool for harvesting the specified Block.
     * @param {Block} block A harvestable Block instance
     * @returns {Promise<Item | null>} The tool that was equipped or null if the Bot did not have the tool in its inventory
     */
    equipBestHarvestTool(block: import("prismarine-block").Block): Promise<import("prismarine-item").Item>;
    /**
     * Finds the best harvest tool in the bot inventory for mining the specified block.
     * If we don't have the best tool, also checks if dig time is infinite because it can't be harvested without a tool
     *
     * @param block {Block} The block to evaluate the best tool for
     * @returns {BestHarvestTool}
     */
    bestHarvestTool(block: import("prismarine-block").Block): BestHarvestTool;
    /**
     * <i><b>Experimental - The behaviour of this API can and almost certainly will change in a future API version.</b></i>
     *
     * This finds the most powerful melee attack item in the bot inventory
     *
     * Note: Today this only prioritizes weapon type, but does not prioritize weapon rarity/enchantments/etc
     *
     * @returns {Item|null}
     */
    bestAttackItemMelee(): import("prismarine-item").Item;
    /**
     * Dig the given Block.
     * This will equip the most appropriate tool in the bot inventory for this Block type.
     * This function does NOT approach the block.  It must already be in reach of the bot
     * @param {Block} block The Block instance to dig
     * @returns {Promise<boolean>} Whether the Block was successfully dug
     */
    digBlock(block: import("prismarine-block").Block): Promise<boolean>;
    /**
     * Locate and dig the closest Block of a given type within a maximum distance from the Bot.
     * This method will equip the most appropriate tool in the bot inventory for this Block type.
     *
     * Note: In more advanced bot code implementations, you will most likely want to pass skipCollection as true and handle the choice to collect or not as a decision in your main loop's next iteration.
     *
     * @param {string} blockType The name of the Block to find and dig
     * @param {object} [options={}] Optional parameters
     * @param {boolean} [options.partialMatch=false] Find blocks whose name contains blockType. (Ex. 'log' may find any of 'spruce_log', 'oak_log', etc.)
     * @param {boolean} [options.onlyFindTopBlocks=false] Will not attempt to dig any Blocks that are beneath another Block
     * @param {number} [options.maxDistance=30] Find any Blocks matching the search criteria up to and including this distance from the Bot
     * @param {boolean} [options.skipCollection=false] If true, the Bot will not explicitly attempt to collect drops from the broken Block. This allows the player to control which drops are collected and which ones are ignored
     * @param {boolean} [options.skipClosest=false] Deprecated since 1.2.0 - If you want to skip a block from the result set, please use the findBlocks(options) function and process the results before calling approachAndDigBlock(block, options).  This method makes the best effort to still interpret this parameter, but is no longer skipping the closest block, but rather the best matching block.
     * @returns {Promise<boolean>} true if a Block was found and dug successfully or false if a Block was not found or if digging was interrupted
     *
     */
    findAndDigBlock(blockType: string, options?: {
        partialMatch?: boolean;
        onlyFindTopBlocks?: boolean;
        maxDistance?: number;
        skipCollection?: boolean;
        skipClosest?: boolean;
    }): Promise<boolean>;
    /**
     * Approach (path-find to) and dig the specified block.
     * @param {Block} block The block instance to approach and dig
     * @param {object} [options={}] Optional parameters
     * @param {boolean} [options.skipCollection=false] If true, the Bot will not explicitly attempt to collect drops from the broken Block. This allows the player to control which drops are collected and which ones are ignored
     * @param {number} [options.reach=5] How close to get to the block
     * @returns {Promise<boolean>} true if a Block was found and dug successfully or false if a Block was not found or if digging was interrupted
     */
    approachAndDigBlock(block: import("prismarine-block").Block, options?: {
        skipCollection?: boolean;
        reach?: number;
    }): Promise<boolean>;
    /**
     * Locate the closest Item with the given name within a maximum distance from the Bot, or null if no matching Items are found.
     * @param {string} itemName The name of the item to find
     * @param {object} [options={}] Optional parameters
     * @param {boolean} [options.partialMatch=false] Locate any items whose name contains itemName. (Ex. 'wooden_axe', 'stone_axe', 'diamond_axe', etc. will all satisfy itemName 'axe')
     * @param {number} [options.maxDistance=30] Find any Items matching the search criteria up to and including this distance from the Bot
     * @returns {Item | null}
     *
     */
    findItemOnGround(itemName: string, options?: {
        partialMatch?: boolean;
        maxDistance?: number;
    }): import("prismarine-item").Item;
    /**
     * @callback FindItemsOnGroundItemValueFunction
     * @param {string} blockName
     * @returns {number}
     */
    /**
     * @callback FindItemsOnGroundSortValueFunction
     * @param {number} distance
     * @param {number} pointValue
     * @returns {number}
     */
    /**
     * Returns a list of all Items that are on the ground within a maximum distance from the Bot (can be empty).
     * @param {object} [options] optional parameters
     * @param {string[]} [options.itemNames=[]] Find only Items matching one of these names
     * @param {boolean} [options.partialMatch=false] If itemNames is defined, find Items whose name contains any of the itemNames. (Ex. '_boots' may find any of 'iron_boots', 'golden_boots', etc.)
     * @param {number} [options.maxDistance=undefined] find any Items matching the search criteria up to and including this distance from the Bot
     * @param {number} [options.maxCount=1] limit the number of items to find
     * @param {FindItemsOnGroundItemValueFunction} [options.itemValueFunction] Function to call to get the value of an item based on its name (itemName). A good example function is { return scoreValueOf[itemName] }, where scoreValueOf is the point value or intrinsic value of the item in the game mode being played.  If you don't want an item considered, return a value < 0 for its value.  Default value is 0.
     * @param {FindItemsOnGroundSortValueFunction} [options.sortValueFunction] Function to call to help sort the evaluation of results. Should return the best item with the lowest sorting value.  Default is RGAlgorithms.DEFAULT_FIND_ITEMS_ON_GROUND_SORT_VALUE_FUNCTION
     *
     * @returns {Array<FindResult<Item>>} - the best items found
     *
     * To get only the 'best' item to collect, call findItems(...).shift().  Note that the result may be null if no items were found
     */
    findItemsOnGround(options?: {
        itemNames?: string[];
        partialMatch?: boolean;
        maxDistance?: number;
        maxCount?: number;
        itemValueFunction?: (blockName: string) => number;
        sortValueFunction?: (distance: number, pointValue: number) => number;
    }): FindResult<import("prismarine-item").Item>[];
    /**
     * Collects the item from the ground if it exists and is on the ground.
     *
     * @param {Entity} item
     * @returns {Promise<boolean>} True if an item was collected
     */
    collectItemOnGround(item: import("prismarine-entity").Entity): Promise<boolean>;
    /**
     * Collects all Items on the ground within a maximum distance from the Bot.
     * @param {object} [options={}] Optional parameters
     * @param {string} [options.itemNames=[]] Find and collect only Items with this name
     * @param {boolean} [options.partialMatch=false] If itemNames is defined, find Items whose name contain any of the itemNames. (Ex. '_boots' may find any of 'iron_boots', 'golden_boots', etc.).
     * @param {number} [options.maxDistance=50] Find and collect any Items matching the search criteria up to and including this distance from the Bot
     * @returns {Promise<Item[]>} A list of Item definitions for each Item collected from the ground (can be empty)
     */
    findAndCollectItemsOnGround(options?: {
        itemNames?: string;
        partialMatch?: boolean;
        maxDistance?: number;
    }): Promise<import("prismarine-item").Item[]>;
    /**
     * Returns true if the Bot has one or more of a specified Item in its inventory, or false if it does not.
     * @param {string} itemName
     * @param {object} [options={}] Optional parameters
     * @param {boolean} [options.partialMatch=false] Check for any items whose name contains itemName. (Ex. 'wooden_axe', 'stone_axe', 'diamond_axe', etc. will all satisfy itemName 'axe')
     * @param {number} [options.quantity=1] The minimum amount of this Item the Bot must have
     * @returns {boolean}
     */
    inventoryContainsItem(itemName: string, options?: {
        partialMatch?: boolean;
        quantity?: number;
    }): boolean;
    /**
     * Return how many of a specific item the Bot currently holds in its inventory.
     * @param {string} itemName
     * @param {object} [options={}] Optional parameters
     * @param {boolean} [options.partialMatch=false] Count any items whose name contains itemName. (Ex. 'wooden_axe', 'stone_axe', 'diamond_axe', etc. will all be included in the quantity for itemName 'axe').
     * @returns {number}
     */
    getInventoryItemQuantity(itemName: string, options?: {
        partialMatch?: boolean;
    }): number;
    /**
     * Drop an inventory Item on the ground.
     * @param {string} itemName
     * @param {object} [options={}] Optional parameters
     * @param {boolean} [options.partialMatch=false] Drop items whose name contains itemName. (Ex. itemName 'stone' will drop 'stone', 'stone_axe', 'stone_sword', etc.)
     * @param {number} [options.quantity=1] The quantity of this Item to drop. To drop all, pass some number <0, or call `dropAllInventoryItem` instead
     * @returns {Promise<void>}
     */
    dropInventoryItem(itemName: string, options?: {
        partialMatch?: boolean;
        quantity?: number;
    }): Promise<void>;
    /**
     * Returns true if all inventory slots are occupied.  This does not necessarily mean it is completely/totally full,
     * but it means you would need to stack items of the same type to fit anything else in the inventory.
     * @returns {boolean}
     */
    isInventorySlotsFull(): boolean;
    /**
     * Get all items in the bot inventory.
     *
     * @returns {Item[]}
     */
    getAllInventoryItems(): import("prismarine-item").Item[];
    /**
     * Drops all stacks of an Item in the bot inventory matching itemName.
     * Alias for `dropAllInventoryItems({itemNames: [itemName]})`
     * @param {string} itemName The name or display name of the Item(s) to drop
     * @param {object} [options={}] Optional parameters
     * @param {boolean} [options.partialMatch=false] Drop items whose name contains itemName. (Ex. itemName 'stone' will drop 'stone', 'stone_axe', 'stone_sword', etc.)
     * @returns {Promise<void>}
     */
    dropAllInventoryItem(itemName: string, options?: {
        partialMatch?: boolean;
    }): Promise<void>;
    /**
     * Drops all stacks of an Item in the bot inventory matching itemName.
     * Alias for `dropInventoryItem(itemName, {quantity: -1})`
     * @param {object} [options={}] Optional parameters
     * @param {string[]} [options.itemNames] The name or display name of the Item(s) to drop, if not passed, all items will be dropped.
     * @param {boolean} [options.partialMatch=false] Drop items whose name contains itemName. (Ex. itemName 'stone' will drop 'stone', 'stone_axe', 'stone_sword', etc.)
     * @returns {Promise<void>}
     */
    dropAllInventoryItems(options?: {
        itemNames?: string[];
        partialMatch?: boolean;
    }): Promise<void>;
    /**
     * Craft an Item. The Bot must have enough materials to make at least one of these Items, or else recipe lookup will fail.
     * If the recipe requires a crafting station, then a craftingTable entity is required for success.  The craftingTable entity must be in reach of the bot via approachEntity.  This function does NOT approach the craftingTable.
     * @param {string} itemName The Item to craft
     * @param {object} [options={}] Optional parameters
     * @param {number} [options.quantity=1] The number of times to craft this Item. Note that this is NOT the total quantity that should be crafted (Ex. `craftItem('stick', {quantity:4})` will result in 16 sticks rather than 4)
     * @param {Block} [options.craftingTable=undefined] For recipes that require a crafting table/station. A Block Entity representing the appropriate station within reach of the Bot
     * @returns {Promise<Item | null>} The crafted Item or null if crafting failed
     */
    craftItem(itemName: string, options?: {
        quantity?: number;
        craftingTable?: import("prismarine-block").Block;
    }): Promise<import("prismarine-item").Item>;
    /**
     * Equips an Item to the hand. The Bot must have the Item in its inventory to hold it.
     * @param {string} itemName
     * @returns {Promise<Item | null>} The held Item or null if the Bot was unable to equip the Item
     */
    holdItem(itemName: string): Promise<import("prismarine-item").Item>;
    /**
     * Returns the contents of an open container.
     * If multiple stacks of the same Item are present in the container, they will not be collapsed in the result.
     * @param {Window} containerWindow The open container Window to withdraw items from
     * @returns {Item[]} The list of Items present in the container (can be empty)
     */
    getContainerContents(containerWindow: import("prismarine-windows").Window<any>): import("prismarine-item").Item[];
    /**
     * Withdraws one or more items from a container.
     * @param {Window} containerWindow The open container Window to withdraw items from
     * @param {object} [options={}] Optional parameters
     * @param {string} [options.itemName=undefined] An Item to withdraw from the container. If not specified, will withdraw all Items
     * @param {boolean} [options.partialMatch=false] Allow partial matches to itemName. For example, 'planks' will match any Item containing 'planks' in its name ('spruce_planks', 'oak_planks', etc.)
     * @param {number} [options.quantity=undefined] If itemName is specified, withdraw up to this quantity
     * @returns {Promise<void>}
     *
     * @deprecated Since 1.2.0, please use withdrawItemsFromContainer(containerWindow, options)
     *
     */
    withdrawItems(containerWindow: import("prismarine-windows").Window<any>, options?: {
        itemName?: string;
        partialMatch?: boolean;
        quantity?: number;
    }): Promise<void>;
    /**
     * Should be passed as the `useContainerFunction` to openAndUseContainer.  Withdraws the specified items from the container.
     * @param {Window} containerWindow The open container Window
     * @param {object} [options={}] Optional parameters
     * @param {string[]} [options.itemNames=[]] An Items to act on in the container.
     * @param {boolean} [options.partialMatch=false] Allow partial matches to itemNames. For example, '_planks' will match any Item containing '_planks' in its name ('spruce_planks', 'oak_planks', etc.)
     * @param {number} [options.quantity=undefined] Withdraw up to this quantity of each unique item name
     * @returns {Promise<boolean>}
     */
    withdrawItemsFromContainer(containerWindow: import("prismarine-windows").Window<any>, options?: {
        itemNames?: string[];
        partialMatch?: boolean;
        quantity?: number;
    }): Promise<boolean>;
    /**
     * Deposits one or more items into a container.
     * @param {Window} containerWindow The open container Window to deposit items into
     * @param {object} [options={}] Optional parameters
     * @param {string} [options.itemName=undefined] An Item to deposit into the container. If not specified, will deposit all Items.
     * @param {boolean} [options.partialMatch=false] Allow partial matches to itemName. For example, 'planks' will match any Item containing 'planks' in its name ('spruce_planks', 'oak_planks', etc.).
     * @param {number} [options.quantity=undefined] If itemName is specified, deposit up to this quantity.
     * @returns {Promise<void>}
     *
     * @deprecated Since 1.2.0, please use depositItemsToContainer(containerWindow, options)
     */
    depositItems(containerWindow: import("prismarine-windows").Window<any>, options?: {
        itemName?: string;
        partialMatch?: boolean;
        quantity?: number;
    }): Promise<void>;
    /**
     * Should be passed as the `useContainerFunction` to openAndUseContainer.   Deposits one or more items into the container.
     * @param {Window} containerWindow The open container Window
     * @param {object} [options={}] Optional parameters
     * @param {string} [options.itemNames=[]] The items to deposit into the container. If not specified, will deposit all Items.
     * @param {boolean} [options.partialMatch=false] Allow partial matches to itemNames. For example, '_planks' will match any Item containing '_planks' in its name ('spruce_planks', 'oak_planks', etc.).
     * @param {number} [options.quantity=undefined] If itemNames is specified, deposit up to this quantity of each itemName.
     * @returns {Promise<boolean>}
     */
    depositItemsToContainer(containerWindow: import("prismarine-windows").Window<any>, options?: {
        itemNames?: string;
        partialMatch?: boolean;
        quantity?: number;
    }): Promise<boolean>;
    /**
     * Open the specified container.  Works for chests and dispensers.
     * This function does NOT approach the block.  It must already be in reach of the bot
     *
     * @param {Block} containerBlock The chest or dispenser block to open
     * @returns {Promise<Window | null>} The open containerWindow or null if unable to open.
     */
    openContainer(containerBlock: import("prismarine-block").Block): Promise<import("prismarine-windows").Window<any>>;
    /**
     * Close the specified container.  Works for any container window type.
     *
     * @param {Window} containerWindow The window for the open container
     * @returns {Promise<boolean>} True if the container was closed
     */
    closeContainer(containerWindow: import("prismarine-windows").Window<any>): Promise<boolean>;
    #private;
}
import mineflayer = require("mineflayer");
import { RGMatchInfo } from "rg-match-info";
import { Vec3 } from "vec3";
import { FindResult } from "./RGModels";
import { BestHarvestTool } from "./RGModels";
