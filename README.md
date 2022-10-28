# RG Bot Template

This template is used to create a very simple bot for the Regression Games: Ultimate Collector challenge.

## Getting Started - Connecting Replit to Git

In order to push our code to Git (and therefore to Regression Games), we need to set some **secrets** within Replit. These secrets can be set by clicking the lock icon in the left hand pane in Replit.

* `GITHUB_REPO` - The https link to your GitHub repo. This repository **should be empty**, and it should be the https link, not SSH link (i.e. click the Clone button in GitHub, and click the HTTPS tab)
* `GITHUB_EMAIL` - The email you use for your GitHub account, which can be found in your profile
* `GITHUB_USERNAME` - Your GitHub username
* `GITHUB_TOKEN` - A personal access token, generated from https://github.com/settings/tokens. Make sure to select all permissions for "repo".

## Getting Started - Your First Bot

Take a look at `index.js` - every bot must have this file, with at minimum, the following code:

```javascript
function configureBot(bot) {
  // Bot logic here
}

exports.configureBot = configureBot
```

Don't worry if you don't understand this code exactly - all it does is define a function and exposes that function to Regression Games.

Now, let's make our bot do something really simple - have it speak back what it hears from other players.

```javascript
// New to JavaScript? Check out this intro from Mineflayer:
//  https://github.com/PrismarineJS/mineflayer/blob/master/docs/tutorial.md#javascript-basics

// Full Mineflayer docs: https://mineflayer.prismarine.js.org/#/

import { Bot } from 'mineflayer';

/**
 * @param {Bot} bot - The Mineflayer bot
 */
function configureBot(bot) {
  
  bot.on('chat', (username, message) => { // line 1
    if (username === bot.username) return // line 2
    bot.chat("This is what I heard in chat: " + message) // line 3
  })
  
}

exports.configureBot = configureBot
```

Here is what each line does:
* `line 1` - Every time a player says something in the game, do something with the speaker's username and their message.
* `line 2` - If the username of the speaker is equal to the username of this bot, don't do anything else. This is because we don't want the bot to repeat something that it says itself, or else it will spam the chat and be kicked from the game!
* `line 3` - Have the bot speak out what it heard from the player.


_Not sure what this is? Visit https://regression.gg for some programming fun!_

When you are ready to push this code, just click the "Run" button in Replit! Or push your code to a github repository.

## Notes on Automatic Update
Within Replit, you can use the "Run" button to automatically update your bot. Please note that this assumes a very simple workflow with the current limitations:
* We expect that the GitHub repo starts as EMPTY
* You need to provide the following secrets within Replit:
  * GITHUB_REPO - The repo that you are pushing to, which must be empty
  * GITHUB_USERNAME - Your username on GitHub
  * GITHUB_EMAIL - The email you use on GitHub
  * GITHUB_TOKEN - A token generated from https://github.com/settings/tokens

If you **really want to override your remote repository**, (i.e. the console fails to push due to remote changes), you can run the following command, but this will overwrite everything in your GitHub repo!

```
git push -u origin main -f
```

Otherwise, we can also pull the remote into this local repository, and overwrite all changes here, with the following command: 

```
git pull origin main --allow-unrelated-histories
# Then address git issues / merge conflicts, and run:
git commit -am "My message"
git push -u origin main
```
