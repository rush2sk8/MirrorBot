const getUrls = require('get-urls')
var Discord = require('discord.js')
var logger = require('winston')
const auth = require('./auth.json')
var streamableauth = require("./streamableauth.json")
var fs = require('fs')
var youtubedl = require('youtube-dl')
const request = require('request')

const streamableuser = streamableauth.user
const streamablepass = streamableauth.pass

logger.remove(logger.transports.Console)
logger.add(new logger.transports.Console, {
    colorize: true
})
logger.level = 'debug'

const bot = new Discord.Client()
bot.login(auth.token)

bot.on('ready', function(evt) {
    logger.info('Connected')
    logger.info('Logged in as: ')
    logger.info(bot.username + ' - (' + bot.id + ')')
    bot.user.setActivity("Made by rush2sk8", { type: "STREAMING", url: "https://www.twitch.tv/rush2sk8" })
})

bot.on('message', (message)=> {

    const channelName = message.channel.name;

    //view all of the messages and look for a twitch clip link
    if (channelName.match(/clip/) != null) {

        if (message.content.match(/\.status/) != null) {
            //sendStatusMessage(message);
message.channel.send("Online")
        } else {
            var urls = Array.from(getUrls(message.content))

            logger.info(message + " urls: " + urls)

            if (urls.length >= 1) {
                if (urls[0].match(/https:\/\/clips.twitch.tv\//) != null) {

                    downloadClip(urls[0], message)
                } else if (urls[0].match(/https:\/\/twitch.tv\//) != null) {

                    const regex = /https:\/\/twitch.tv\/[a-zA-Z]*\/clip\//;
                    const newUrl = urls[0].replace(regex, 'https://clips.twitch.tv/')

                    downloadClip(newUrl, message)
                }
            }
        }
    }
})

function downloadClip(url, message) {

    var video = youtubedl(
        url,
        ['--format=mp4'], { cwd: __dirname }
    )

    var filename = null

    video.on('info', function(info) {
        filename = info._filename
        video.pipe(fs.createWriteStream(filename))
    })

    video.on('end', () => {
        uploadToStreamable(filename, message)
    })
}

function uploadToStreamable(filename, message) {

    var req = request.post("https://api.streamable.com/upload", (err, resp, body) => {
        if (err) {
            console.log('Error!');
        } else {
            var shortcode = JSON.parse(body).shortcode
            if (shortcode == null || shortcode == "") {
                message.channel.send("Video failed to upload to streamable please try again")
            } else {
                message.channel.send("https://www.streamable.com/" + shortcode)
            }
            fs.unlink(filename, (err) => {
                if (err) throw err;
            });
        }
    }).auth(streamableuser, streamablepass)
    var form = req.form()
    form.append(filename, fs.createReadStream(filename))
}

function sendStatusMessage(channelID) {
    bot.sendMessage({
        to: channelID,
        msg: "",
        embed: {
            color: 448323,
            author: {
                "name": "Mirror Bot status",
                "icon_url": "https://cdn.discordapp.com/avatars/633350391706288129/65a3e41172164066d8f80c1df028b286.png?size=128"
            },
            fields: [{
                "name": "Status",
                "value": "Online"
            }]
        }
    });
}
