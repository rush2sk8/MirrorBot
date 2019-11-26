const getUrls = require('get-urls')
var Discord = require('discord.js')
var logger = require('winston')

var fs = require('fs')
var youtubedl = require('youtube-dl')
const request = require('request')
var messageQ = []

logger.remove(logger.transports.Console)
logger.add(new logger.transports.Console, {
    colorize: true
})
logger.level = 'debug'

const bot = new Discord.Client()
bot.login(process.env.BOT_TOKEN)

bot.on('ready', function(evt) {
    logger.info('Connected')
    logger.info('Logged in as: ')
    logger.info(bot.username + ' - (' + bot.id + ')')
    bot.user.setActivity(".help | by rush2sk8", { type: "STREAMING", url: "https://www.twitch.tv/rush2sk8" })
})


bot.on('message', (message) => {

    const channelName = message.channel.name;

    //view all of the messages and look for a twitch clip link
    if (channelName.match(/clip/) != null) {

        if (message.content.startsWith(".status")) {
            sendStatusMessage(message)
        } else if (message.content.startsWith(".help")) {
            message.channel.send("**.**m [youtube-link] works with smaller videos")
            message.channel.send("[twitch-clip-link]")
            message.channel.send("**.**status")
        } else {
            var urls = Array.from(getUrls(message.content))

            logger.info(message + " urls: " + urls)

            if (urls.length >= 1) {
                if (urls[0].match(/https:\/\/clips.twitch.tv\//) != null) {

                    downloadClip(urls[0], message)
                } else if (urls[0].match(/https:\/\/twitch.tv\//) != null &&

                    urls[0].match(/clip/) != null) {

                    const regex = /https:\/\/twitch.tv\/[a-zA-Z]*\/clip\//;
                    const newUrl = urls[0].replace(regex, 'https://clips.twitch.tv/')

                    downloadClip(newUrl, message)
                } else if (ytVidId(urls[0]) != false && message.content.startsWith(".m")) {
                    const ytUrl = "https://youtube.com/watch?v=" + ytVidId(urls[0])
                    downloadClip(ytUrl, message)
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
        if (err || body == null || body == "") {
            console.log('Error! ' + err );
        } else {
            console.log("body: " + body)
     
            if (body == null || body == "") {
                message.channel.send("Video failed to upload to streamable please try again")
            } else {
                //store the promise
                var shortcode = JSON.parse(body).shortcode
                const url = "https://www.streamable.com/" + shortcode
                messageQ.push([message.channel.send(url), url])
            }
            fs.unlink(filename, (err) => {
                if (err) throw err;
            });
        }
    }).auth(process.env.STREAM_USER, process.env.STREAM_PASS)
    var form = req.form()
    form.append(filename, fs.createReadStream(filename))
}

function sendStatusMessage(message) {
    const embedStatus = new Discord.RichEmbed()
        .setColor("#2cf00e")
        .setTitle("Mirror Bot Status")
        .setThumbnail("https://cdn.discordapp.com/avatars/633350391706288129/65a3e41172164066d8f80c1df028b286.png?size=128")
        .addField("Status", "Online")
    message.channel.send(embedStatus)
}

function ytVidId(url) {
    var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    return (url.match(p)) ? RegExp.$1 : false;
}

setInterval(() => {
    if (messageQ.length > 0) {
        var message = messageQ.shift()
        message[0].then((newMessage) => {
            newMessage.edit(message[1])
        })
    }
}, 5000 * 60 * 1)
