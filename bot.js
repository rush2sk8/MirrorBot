const getUrls = require('get-urls')
var Discord = require('discord.io')
var logger = require('winston')
const auth = require('./auth.json')
var streamableauth = require("./streamableauth.json")
var fs = require('fs')
var youtubedl = require('youtube-dl')
const request = require('request')

const streamableuser = streamableauth.user
const streamablepass = streamableauth.pass

var finishedQueue = []

logger.remove(logger.transports.Console)
logger.add(new logger.transports.Console, {
    colorize: true
})
logger.level = 'debug'

const bot = new Discord.Client({
    token: auth.token,
    autorun: true
})
bot.on('ready', function(evt) {
    logger.info('Connected')
    logger.info('Logged in as: ')
    logger.info(bot.username + ' - (' + bot.id + ')')
})

bot.on('message', function(user, userID, channelID, message, evt) {

    //view all of the messages and look for a twitch clip link
    if (channelID == "633351348838072320" || channelID == "423939714723348510") {
        var urls = Array.from(getUrls(message))

        logger.info(message + " urls: " + urls)

        if (urls.length >= 1) {
            if (urls[0].match(/https:\/\/clips.twitch.tv\//) != null) {

                downloadClip(urls[0], channelID)
            } else if (urls[0].match(/https:\/\/twitch.tv\//) != null) {

                const regex = /https:\/\/twitch.tv\/[a-zA-Z]*\/clip\//;
                const newUrl = urls[0].replace(regex, 'https://clips.twitch.tv/')

                downloadClip(newUrl, channelID)
            }
        }
    }
})

function downloadClip(url, channelID) {
    sendMsgToBot(channelID, "Downloading Clip....")
    var video = youtubedl(
        url,
        ['--format=mp4'], { cwd: __dirname }
    )

    var filename = null

    video.on('info', function(info) {
        console.log('Download started')
        console.log('filename: ' + info._filename)
        console.log('size: ' + info.size)
        filename = info._filename
        video.pipe(fs.createWriteStream(filename))
    })

    video.on('end', () => {
        console.log(filename)
        uploadToStreamable(filename, channelID)
    })
}

function uploadToStreamable(filename, channelID) {
    sendMsgToBot(channelID, "Uploading to streamable....")

    var req = request.post("https://api.streamable.com/upload", (err, resp, body) => {
        if (err) {
            console.log('Error!');
        } else {
            var shortcode = JSON.parse(body).shortcode
            if (shortcode == null || shortcode == "") {
                sendMsgToBot(channelID, "Video failed to upload to streamable please try again")
            } else {
                sendMsgToBot(channelID, "https://www.streamable.com/" + shortcode + " Please note the video may still be processing")
            }
            fs.unlink(filename, (err) => {
                if (err) throw err;
                console.log(filename + ' was deleted');
            });
        }
    }).auth(streamableuser, streamablepass)
    var form = req.form()
    form.append(filename, fs.createReadStream(filename))
}

function sendMsgToBot(channelID, msg) {
    console.log("Sending msg: " + msg)
    bot.sendMessage({
        to: channelID,
        message: msg
    })
}