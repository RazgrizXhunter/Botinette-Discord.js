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

const { Client, Intents } = require("discord.js");
const strings = require("./resources/strings").index;
const handler = require("./controller/handler");
const commandManager = require("./controller/commandManager");

const lang = process.env.APP_LANG || "es";
const token = process.env.TOKEN;

const database = require("./controller/mongoDB").connect(
	process.env.MONGOOSE_URI,
	process.env.MONGOOSE_PORT,
	process.env.MONGOOSE_USER,
	process.env.MONGOOSE_PASSWORD,
	process.env.NODE_ENV == "development" ? "Botinette-Dev" : "Botinette"
);

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_VOICE_STATES //Not necessary if the bot wont play music
	], partials: [
		"REACTION",
		"MESSAGE"
	]
});

commandManager.importCommands(client);

client.once("ready", () => {
	try {
		handler.revive(client);
	} catch (error) {
		console.log(`There was an error while reviving the bot.\n${error}`);
	}

	console.log(`The bot has been revived.`);
});

client.on("interactionCreate", async (interaction) => {
	const command = client.commands.get(interaction.commandName);
	if (!interaction.isCommand() && !command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.log(`There was a fatal error executing the command: ${command}`);
		await interaction.reply({ content: strings.default_execution_error[lang], ephemeral: true });
	}
});

client.on("messageReactionAdd", async (reaction, user) => {
	if (reaction.message.partial) {
		try {
			await reaction.message.fetch();
		} catch (error) {
			console.log(error);
		}
	}

	//check if the reaction was to the correct message
	//check if the reaction was a country flag, otherwise delete the reaction and send timed message warning the user to use a flag	

	console.log(`The user: ${user.username} has reacted with ${reaction.emoji}\nid:${user.id}`);
});

client.on("messageReactionRemove", async (reaction, user) => {
	if (reaction.message.partial) {
		try {
			await reaction.message.fetch();
		} catch (error) {
			console.log(error);
		}
	}

	//check if the reaction was to the correct message
	//check if the reaction was a country flag, otherwise delete the reaction and send timed message warning the user to use a flag	

	console.log(`A reaction has been removed from a message.\n${reaction.emoji}`);
});

client.on("guildCreate", (guild) => {
	//save ID and name to the db
	console.log(`The bot has been added to a guild: ${guild.id}`);
});

client.on("channelUpdate", (oldChannel, newChannel) => {
	//update name with said ID to the db
	console.log(`A guild the bot is in has been updated: ${oldChannel.id}`);
});

client.on("guildDelete", (guild) => {
	//remove channel from the db
	console.log(`The bot has been removed from a guild: ${guild.id}`);
});

client.login(token);
