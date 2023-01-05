import { RGBot } from "@jmerle/rg-bot";
import { simpleStrategy } from './routines';

export function configureBot(bot: RGBot): void {
    bot.setDebug(true);

    bot.on('spawn', async () => {
        bot.chat('Hello, I have arrived!');
    });

    simpleStrategy(bot)

}