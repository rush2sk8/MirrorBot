var streamableauth = require("./streamableauth.json")
var fs = require('fs')

const request = require('request')

const streamableuser = streamableauth.user
const streamablepass = streamableauth.pass

function uploadToStreamable(url, message) {

    var req = request.get("https://api.streamable.com/import?url="+ url, (err, resp, body) => {
//	console.log(resp)
console.log("b" + body.shortcode)

	}).auth(streamableuser, streamablepass)
    
}

uploadToStreamable("https://clips.twitch.tv/ConsiderateDirtyPigChocolateRain", "")
