export type Item = import('prismarine-item').Item;
/**
 * @typedef { import('prismarine-item').Item } Item
 */
/**
 *
 * A result model for finding the best harvesting tool including the tool if found and the digTime for that tool/block combo.
 * The digTime will be Infinity if the block is not diggable with any tool the bot has.
 *
 * @param  {Item|null} tool The Item best suited to dig the block.  Can be null if no tool is needed or if item is not diggable.
 * @param  {number} [digTime=Infinity] Time in milliseconds to dig the block, Infinity if not diggable
 */
export class BestHarvestTool {
    constructor(tool: any, digTime?: number);
    /**
     * @type {Item|null}
     */
    tool: Item | null;
    /**
     * @type {number}
     */
    digTime: number;
}
/**
 * The result of a findEntities, findBlocks, findItemsOnGround operation.
 *
 * @param {T} result The result object
 * @param {number} value The value computed for this result during evaluation
 * @template T
 */
export class FindResult<T> {
    constructor(result: any, value: any);
    /**
     * @type {T}
     */
    result: T;
    /**
     * @type {number}
     */
    value: number;
}
