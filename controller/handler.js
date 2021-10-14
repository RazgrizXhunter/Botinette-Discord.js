const mongoose = require("mongoose");
const strings = require("../resources/strings").index;
const Guild = require("../model/Guild");

module.exports = {
	revive: async (client) => {
		const guilds = client.guilds.cache; //get the servers the bot is in
		
		guilds.forEach(guild => {
			let result = Guild.findOne({ guildId: guild.id });

			if (result) {
				console.log("oops, it exists");
			} else {
				console.log("nope, it doesnt exist");
			}
		});

		return;


		
		try {
			updateGuildDatabase(guilds, database);
		} catch (error) {
			console.log(`There was an error while updating the database.\n${error}`);
		}

		//update database object with new guilds if it isnt done automatically

		const interactionChannels = [];
		guilds.forEach( guild => {
			const interactionChannel = guild.channels.cache.find(channel => channel.name == strings.command_setup.channel_name[lang]);
			interactionChannels.push(channel.id);
		});
	}
}

function getDatabase() {
	return false;
}

function updateGuildDatabase(guilds, database) {
	//check if the given guild list is synced with the db, if not, update it
	guilds.forEach( guild => {
		if (!database.guilds.find(guild.id)) {
			insertGuild(guild);
		}
		//check if database has any stray guild and delete it
	});
}

function insertGuild(guild) {
	//get guild name and id
	//insert the required fields to the db
}
