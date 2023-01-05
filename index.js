
export function configureBot(bot) {
    bot.setDebug(true);

    bot.on('spawn', async () => {
        bot.chat('Hello, I have arrived!');
    });

    require('./routines').simpleStrategy(bot)
}