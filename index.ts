import { RGBot } from "rg-bot";
import { EventEmitter } from "events";
import { simpleStrategy } from './routines';

export function configureBot(bot: RGBot, matchInfoEmitter: EventEmitter): void {
    bot.setDebug(true);
    simpleStrategy(bot)
}