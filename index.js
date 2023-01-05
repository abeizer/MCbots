
export function configureBot(rgBot) {
    bot.setDebug(true);

    bot.on('spawn', async () => {
        bot.chat('Hello, I have arrived!');
    });
}