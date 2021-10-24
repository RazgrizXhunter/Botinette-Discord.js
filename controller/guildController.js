require("dotenv").config();

const Guild = require("../model/Guild");

const strings = require("../resources/strings");
const lang = process.env.APP_LANG;

module.exports = {
	create: createGuild,
	findById: findGuildById,
	getAll: async () => {
		return await Guild.find({});
	},
	insert: async (guildDocument) => {
		try {
			return await guildDocument.save();
		} catch (error) {
			console.error(error);
		}
	},
	update: async (guildDocument) => {
		const filter = { "_id" : guildDocument.id };
		const update = guildDocument;

		try {
			return await Guild.findOneAndUpdate(filter, update);
		} catch (error) {
			console.error(error);
		}
	},
	delete: async (guildDocument) => {
		const filter = { "_id" : guildDocument.id }

		try {
			return await Guild.findOneAndDelete(filter);
		} catch (error) {
			console.error(error);
		}
	},
	addUser: async (guildDocument, userDocument) => {
		await guildDocument.users.push({ _id : userDocument._id });

		try {
			guildDocument.save();
		} catch (error) {
			console.error(error);
		}
	},
	removeUser: async (guildDocument, userDocument) => {
		await guildDocument.users.pull({ _id : userDocument._id });

		try {
			guildDocument.save();
		} catch (error) {
			console.error(error);
		}

	}
}

async function findGuildById(guildId) {
	return await Guild.findOne({ guildId });
}


function createGuild(guild) {
	return new Guild({
		_id: guild.id,
		guildName: guild.name,
		interactionChannel: {
			_id: guild.interactionChannel ? guild.interactionChannel.id : null,
			interactionMessageId: guild.interactionChannel ? guild.interactionChannel.interactionMessageId : null
		}
	});
}



