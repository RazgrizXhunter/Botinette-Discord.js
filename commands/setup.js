const { GuildChannelManager, MessageEmbed, MessageAttachment  } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const dotenv = require("dotenv").config();
const strings = require("../resources/strings.json").command_setup;
const lang = "es";

module.exports = {
	data: new SlashCommandBuilder()
		.setName(strings.name[lang])
		.setDescription(strings.description[lang]),
		
		async execute(interaction) {
			const channelName = strings.channel_name[lang];
			const channelSnowflake = await createChannelIfNotExists(interaction, channelName);

			let reply;

			if (channelSnowflake) {
				sendSetupMessages(interaction, channelSnowflake);
				reply = strings.setup_succesfull[lang];
			} else {
				reply = strings.setup_error[lang];
			}

			try {
				await sendTimedMessage(interaction, reply, 5);
			} catch (error) {
				console.log(error);
			}

			return;
		}
}

async function createChannelIfNotExists(interaction, channelName) {
	const guildChannelManager = new GuildChannelManager(interaction.guild);
	const channelNames = interaction.guild.channels.cache.map(channel => channel.name);
	const channelAlreadyExists = channelNames.includes(channelName);

	if (channelAlreadyExists) return false;

	return await guildChannelManager.create(channelName, {
		type: "text",
		permissionOverwrites: [{
			id: interaction.guild.id, //Same as @Everyone, don't know how to get it, but the function does the exact same. Apparently the owner of the server isn't part of @everyone
			deny: ["SEND_MESSAGES"]
		}]
	})
	.then(channel => {
		return channel.id;
	})
	.catch(error => {
		console.log(error);
		return false;
	});
}

async function sendSetupMessages(interaction, channelSnowflake) {
	const selectedChannel = interaction.guild.channels.cache.find(channel => channel.id == channelSnowflake);

	const coverImage = new MessageAttachment("./resources/embed_cover.png");

	const messageEmbed = new MessageEmbed()
	.setAuthor(strings.embed.author[lang])
	.setDescription(strings.embed.description[lang])
	.setImage("attachment://embed_cover.png")
	.setColor("#6C9CF0");

	await selectedChannel.send({ files: ["./resources/embed_banner.png"] });
	await selectedChannel.send({ embeds: [messageEmbed], files: [coverImage] });
}

async function sendTimedMessage(interaction, message, seconds) {
	interaction.reply(message)
	.then(
		setTimeout(() => {
			interaction.deleteReply()
		}, seconds * 1000)
	).catch(err => console.log(err));
}

/* Requerimientos
	-añadir un servidor nosql para guardar los países, zona horaria y emoji
	-si un usuario marca más de una bandera, que se guarde sólo la primera que marcó
*/