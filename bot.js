require('dotenv').config()
const getUrls = require('get-urls')
var Discord = require('discord.js')
var logger = require('winston')
const auth = require('./auth.json')
var streamableauth = require("./streamableauth.json")
var fs = require('fs')
var youtubedl = require('youtube-dl')
const request = require('request')
var messageQ = []

const streamableuser = process.env.S_USER
const streamablepass = process.env.S_PASS

const k = require('keyv');
const db = new k('postgresql://postgres:mypassword@localhost:5432/links');

db.on('error', err => console.log('Connection Error', err));


logger.remove(logger.transports.Console)
logger.add(new logger.transports.Console, {
    colorize: true
})
logger.level = 'debug'

const bot = new Discord.Client()
bot.login(process.env.DISCORD_TOKEN)

bot.on('ready', function(evt) {
    logger.info('Connected')
    logger.info('Logged in as: ')
    logger.info(bot.username + ' - (' + bot.id + ')')
    bot.user.setActivity(".help | by rush2sk8", { type: "STREAMING", url: "https://www.twitch.tv/rush2sk8" })
})



bot.on('message', async message => {

    const channelName = message.channel.name;

    //view all of the messages and look for a twitch clip link
    if (channelName.match(/clip/) != null) {

        if (message.content.startsWith(".status")) {
            sendStatusMessage(message)
	}else if(message.content.startsWith(".help")){
		message.channel.send("**.**m [youtube-link] works with smaller videos")
		message.channel.send("[twitch-clip-link]")
		message.channel.send("**.**status")
	} else {
            var urls = Array.from(getUrls(message.content))

            logger.info(message + " urls: " + urls)

            if (urls.length >= 1) {
                if (urls[0].match(/https:\/\/clips.twitch.tv\//) != null) {
			const fromDB = await db.get(urls[0])
			console.log(fromDB)
			if(fromDB === undefined){
				uploadToStreamable(urls[0], message)
			}else{
				message.channel.send(fromDB)
			}
                } else if (urls[0].match(/https:\/\/twitch.tv\//) != null &&

			   urls[0].match(/clip/) != null) {

                        const regex = /https:\/\/twitch.tv\/[a-zA-Z]*\/clip\//;
                        const newUrl = urls[0].replace(regex, 'https://clips.twitch.tv/')

   			const fromDB = await db.get(newUrl)

			if(fromDB === undefined){
                             uploadToStreamable(newUrl, message)
                        }else{
                                message.channel.send(fromDB)
                        }

                }
		else if(ytVidId(urls[0]) != false && message.content.startsWith(".m")){
			uploadToStreamable(urls[0], message)
		}
            }
        }
    }
})


function uploadToStreamable(url, message) {
	var s_request = request.defaults({
	headers: {'User-Agent': "mirrorbotdiscord"}
	})

    s_request.get("https://api.streamable.com/import?url="+url, async (err, resp, body) => {
        if (err) {
            console.log('Error!');
        } else if(isJson(body)){
            var shortcode = JSON.parse(body).shortcode
            if (shortcode == null || shortcode == "") {
                message.channel.send("Video failed to upload to streamable please try again")
            } else {
		//store the promise
		const s_url = "https://www.streamable.com/" + shortcode
		await db.set(url, s_url)
                messageQ.push([message.channel.send(s_url), s_url])
	    }
        }
    }).auth(streamableuser, streamablepass)
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

function isJson(item) {
    item = typeof item !== "string"
        ? JSON.stringify(item)
        : item;

    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }

    if (typeof item === "object" && item !== null) {
        return true;
    }

    return false;
}

setInterval(()=>{
	if(messageQ.length > 0){
		var message = messageQ.shift()
		message[0].then((newMessage) => {
        		newMessage.edit(message[1])
       		 })
	}
}, 5000*60*1)
