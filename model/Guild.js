const mongoose = require("mongoose");
const { Schema } = mongoose;

const GuildSchema = new Schema({
	_id: String,
	guildName: String,
	interactionChannel: {
		_id: String,
		interactionMessageId: String
	},
	users: [{ type: String, ref: "User" }]
});

module.exports = mongoose.model("Guild", GuildSchema);