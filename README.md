# MirrorBot 
#### Version 1.2

A discord bot that will convert any video posted in a channel with 'clips' in the name. Currently supports twitch clip conversion.

## Installation

`npm install`

## Necessary files

* `streamableauth.json` with `user` and `pass` fields
* `auth.json` with the discord `token` field

## Launching the bot
Launch with [`pm2`](https://www.npmjs.com/package/pm2)

`pm2 start bot.js`

## Updates

### Oct 27
* Added youtube support
* Added .help command 
* For youtube links you need .m 

### Oct 25
* Fixed bug where any twitch link would crash the app
* Updated to discord.js api
* Using pm2 for deployment
 * Cool bc now we can hot reload the app 
* Added a queue of messages that will be help for 5 mins until video is fully processed on streamable then the message will update with the thumbnail. :)




### TODO

* Add other mirror sites
* Format .help
* No duplicate links 
* Have a db of stuff thats been process as to not have to reupload something that's already done
