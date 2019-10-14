// const getUrls = require('get-urls');
// var Discord = require('discord.io');
// var logger = require('winston');
// var auth = require('./auth.json');
// // Configure logger settings
// logger.remove(logger.transports.Console);
// logger.add(new logger.transports.Console, {
//     colorize: true
// });
// logger.level = 'debug';
// // Initialize Discord Bot
// var bot = new Discord.Client({
//    token: auth.token,
//    autorun: true
// });
// bot.on('ready', function (evt) {
//     logger.info('Connected');
//     logger.info('Logged in as: ');
//     logger.info(bot.username + ' - (' + bot.id + ')');
// });
// bot.on('message', function (user, userID, channelID, message, evt) {
//     //logger.info("message: " + message + " user: " + user + " channelID: " + channelID + " evt: " + evt + " user id : " + userID)
//     console.log(message)
//     //view all of the messages and look for a twitch clip link
//     if (channelID == "633351348838072320") {
//         var urls = Array.from(getUrls(message))
//         console.log(urls)
//       //  logger.info("URLS: " + urls.text)
//         // bot.sendMessage({
//         //     to: channelID,
//         //     message: "urls"
//         // });
            
      
//      }
// });
 
var fs = require('fs');
var youtubedl = require('youtube-dl');
var video = youtubedl('https://clips.twitch.tv/StrangeTemperedNoodlePeteZaroll',
  // Optional arguments passed to youtube-dl.
  ['--format=mp4'],
  // Additional options can be given for calling `child_process.execFile()`.
  { cwd: __dirname });
 
// Will be called when the download starts.
video.on('info', function(info) {
  console.log('Download started');
  console.log('filename: ' + info._filename);
  console.log('size: ' + info.size);
});
 
video.pipe(fs.createWriteStream('myvideo.mp4'));