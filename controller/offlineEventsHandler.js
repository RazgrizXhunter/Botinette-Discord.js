const guildController = require("./guildController");
const reactionController = require("./reactionController");

module.exports = {
	updateDatabase: async (client) => {
		const cachedGuilds = client.guilds.cache;
		
		await purgeDatabase(cachedGuilds);
		
		await addNewGuilds(cachedGuilds);

		console.log("Database is now up-to-date.");
	},
	removeUnhandledReactions: removeUnhandledReactions
}

async function purgeDatabase(cachedGuilds) { // This name does not represent what this function does.
	const guildDocuments = await guildController.getAll();
	if (!guildDocuments.length) return;

	guildDocuments.forEach((guildDocument) => {
		const cachedGuild = cachedGuilds.get(guildDocument.id);

		if (cachedGuild) {
			updateIfNecessary(cachedGuild, guildDocument).then((hasChanged) => {
				if (hasChanged) {
					guildController.update(guildDocument);
				}
			});
		} else {
			guildController.delete(guildDocument);
		}
	});
}

async function updateIfNecessary(cachedGuild, guildDocument) {
	let hasChanged = false;

	if (cachedGuild.name != guildDocument.name) {
		guildDocument.name = cachedGuild.name;

		hasChanged = true;
	}

	const interactionChannel = await cachedGuild.channels
	.fetch(guildDocument.interactionChannel._id)
	.catch((error) => { return undefined });

	if (!interactionChannel) {
		guildDocument.interactionChannel._id = null;
		guildDocument.interactionChannel.interactionMessageId = null;

		hasChanged = true;
	}
	
	return hasChanged;
}

async function addNewGuilds(cachedGuilds) {
	if (!cachedGuilds.size) return;
	
	await cachedGuilds.forEach((cachedGuild) => {
		guildController.findById(cachedGuild.id)
		.then((guildDocument) => {
			if (!guildDocument) {
				cachedGuild = guildController.create(cachedGuild);
				guildController.insert(cachedGuild);
			}
		});
	});
}

async function removeUnhandledReactions(client) {
	const guildDocuments = await guildController.getAll();

	guildDocuments.forEach((guildDocument) => {
		if (guildDocument.interactionChannel._id) {
			fetchInteractionMessages(client, guildDocument).then((interactionMessages) => {
				interactionMessages.forEach((message) => {
					message.reactions.removeAll();
				});
			});
		}
	});
}

async function fetchInteractionMessages(client, guildDocument) {
	const cachedGuild = await client.guilds.fetch(guildDocument._id);
	const interactionChannel = await cachedGuild.channels.fetch(guildDocument.interactionChannel._id);
	return await interactionChannel.messages.fetch({ limit: 50 });
}