import { RGBot } from "@jmerle/rg-bot";

export function configureBot(bot: RGBot): void {
    bot.setDebug(true);

    bot.on('spawn', async () => {
        bot.chat('Hello, I have arrived!');
    });

}