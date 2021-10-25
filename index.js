/* MIT License

Copyright (c) 2021 Aldo Tapia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

require("dotenv").config();

const mongoose = require("mongoose");

const { Client, Intents, ReactionManager } = require("discord.js");

const strings = require("./resources/strings");

const offlineEventsHandler = require("./controller/offlineEventsHandler");
const guildController = require("./controller/guildController");
const userController = require("./controller/userController");
const reactionController = require("./controller/reactionController");
const commandManager = require("./controller/commandManager");
const database = require("./controller/database");

const lang = process.env.APP_LANG || "es";
const token = process.env.TOKEN;



const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_VOICE_STATES //Not necessary if the bot wont play music
	], partials: [
		"REACTION",
		"MESSAGE",
		"USER",
		"GUILD_MEMBER",
		"CHANNEL"
	]
});

commandManager.importCommands(client);

client.once("ready", async () => {
	console.log("Bot awoken, trying to connect to the database...");
	database.connect();
});

mongoose.connection.on("connected", () => {
	console.log("database connected, handling offline events:");
	try {
		offlineEventsHandler.updateDatabase(client);
	} catch (error) {
		throw error;
	}
});

client.on("interactionCreate", async (interaction) => {
	const command = client.commands.get(interaction.commandName);
	if (interaction.isCommand() && command) {
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(`There was a fatal error executing the command: ${command}`);
			await interaction.reply({ content: strings.index.default_execution_error[lang], ephemeral: true });
		}
	} else if (interaction.isSelectMenu()) {
		const userDocument = await userController.findById(interaction.user.id);

		if (!userDocument) return;

		const selectMenu = await interaction.user.dmChannel.messages.fetch(interaction.message.id);
		const timezone = interaction.values[0];
		userDocument.userTimezone = timezone;
		userController.update(userDocument);

		selectMenu.delete();
	}
});

client.on("messageReactionAdd", async (reaction, user) => {
	// this doesnt register the dm choice TODO: check how to register the dm choice.
	// there's <t:UNIXTIMESTAMP> to convert automatically a datetime to the user's location, check how it does it and if it is reliable
	if (user.bot) return;

	if ( !(await reactionController.isInTheRightChannel(reaction)) ) return;

	let userDocument = await userController.findById(user.id);
	const guildDocument = await guildController.findById(reaction.message.guild.id);
	
	const isToTheRightMessage = await reactionController.isToTheRightMessage(reaction);
	const isRegistered = userDocument ? true : false;
	
	if (!isRegistered && isToTheRightMessage) {
		userDocument = userController.create(user);
	}
	
	if (isToTheRightMessage && isRegistered && reaction.emoji.name == "❌") {
		console.log(`The user with ID: ${user.id} has opted-out. Removing...`);

		await guildController.removeUser(guildDocument, userDocument);
		await userController.delete(userDocument);
	}

	if (isToTheRightMessage && await reactionController.isAValidFlag(reaction.emoji.name)) {
		console.log(`The user with ID: ${user.id} sent a valid flag, saving to the database`);

		if (!isRegistered) {
			await userController.insert(userDocument);
			await guildController.addUser(guildDocument, userDocument);
		}
		
		const directMessage = await reactionController.sendTimezonesDM(reaction.emoji.name, user);

		await utils.wait(10);

		try {
			await directMessage.delete(); // if the user makes a choice, this message gets deleted and raises an error when trying to delete it again
			
			await guildController.removeUser(guildDocument, userDocument);
			await userController.delete(userDocument)
		} catch (error) {
			if (error.message != "Unknown Message") {
				console.error(error);
			}
		}
	}

	reaction.users.reaction.remove();
});

client.on("channelDelete", async (channel) => {
	const guildDocument = await guildController.findById(channel.guild.id);

	if (!guildDocument.interactionChannel._id) return;

	if (channel.id == guildDocument.interactionChannel._id) {
		guildDocument.interactionChannel = {
			_id: null,
			interactionMessageId: null
		};

		guildController.update(guildDocument);
	}
});

client.on("guildCreate", async (guild) => {
	guild = guildController.create(guild);

	guildController.insert(guild);

	console.log(`The bot has been added to a guild: ${guild.id}`);
});

client.on("guildUpdate", (oldGuild, newGuild) => {
	newGuild = guildController.create(newGuild);

	guildController.update(newGuild);

	console.log(`A guild the bot is in has been updated: ${newGuild.id}`);
});

client.on("guildDelete", (guild) => {
	guild = guildController.create(guild);
	
	guildController.delete(guild);

	console.log(`The bot has been removed from a guild: ${guild.id}`);
});

client.login(token);
