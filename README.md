# MirrorBot 

## Installation

You need to have postgresql up and running 

`npm install`

## Necessary files

* `.env` with the following fields
  - `DISCORD_TOKEN` Discord api token
  - `S_USER` Streamable user name
  - `S_PASS` Streamable password
  - `DB_HOST` Host ip of the Database
  - `DB_USER` Username of the database user
  - `DB_PASS` Password of the database user
  - `DB_DATABASE_NAME` Name of the database to use
  - `DB_PORT` Port of the running database
  
## Launching the bot
Launch with [`pm2`](https://www.npmjs.com/package/pm2)

`pm2 start bot.js`

## Updates

### Version 2.0.1

Added .env for ease of deployment

### Version 2.0

The bot now will keep a track of videos submitted. Using postresql

#### Version 1.2

A discord bot that will convert any video posted in a channel with 'clips' in the name. Currently supports twitch clip conversion.

#### Legacy 1.0.2
* Added youtube support
* Added .help command 
* For youtube links you need .m 

#### Legacy 1.0.1
* Fixed bug where any twitch link would crash the app
* Updated to discord.js api
* Using pm2 for deployment
 * Cool bc now we can hot reload the app 
* Added a queue of messages that will be help for 5 mins until video is fully processed on streamable then the message will update with the thumbnail. :)
