const mongoose = require("mongoose");
const { Schema } = mongoose;

const GuildSchema = new Schema({
	guildId: String,
	guildName: String,
	users: [{
		userId: String,
		userName: String,
		userTimezone: String
	}]
});

module.exports = mongoose.model("guild", GuildSchema);