require("dotenv").config();

const { GuildChannelManager, MessageEmbed, MessageAttachment  } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

const guildController = require("../controller/guildController");
const utils = require("../controller/utils");

const strings = require("../resources/strings.json").command_setup;
const lang = process.env.APP_LANG || "es";

module.exports = {
	data: new SlashCommandBuilder()
		.setName(strings.name[lang])
		.setDescription(strings.description[lang]),
		
		async execute(interaction) {
			const guildId = interaction.guild.id;
			const guildDocument = await guildController.findById(guildId);
			console.log(`The setup has been called for the guild: ${guildId}`);

			const channelName = strings.channel_name[lang];
			const channelId = await createChannelIfNotExists(interaction, channelName);

			let reply;

			if (channelId) {
				console.log(`The channel has been created, and it's snowflake is: ${channelId}`);
				const interactionMessageId = await sendSetupMessages(interaction, channelId);

				guildDocument.interactionChannel._id = channelId;
				guildDocument.interactionChannel.interactionMessageId = interactionMessageId;

				guildController.update(guildDocument);

				reply = strings.setup_succesfull[lang];

			} else {
				reply = strings.setup_error[lang];
			}

			try {
				await interaction.reply(reply);
				await utils.wait(5);
				interaction.deleteReply();
			} catch (error) {
				console.error(error);
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
		console.error(error);
		return false;
	});
}

async function sendSetupMessages(interaction, channelId) {
	const selectedChannel = interaction.guild.channels.cache.find(channel => channel.id == channelId);

	const coverImage = new MessageAttachment("./resources/images/embed_cover.png");

	const messageEmbed = new MessageEmbed()
		.setAuthor(strings.embed.author[lang])
		.setDescription(strings.embed.description[lang])
		.setImage("attachment://embed_cover.png")
		.setColor("#6C9CF0");

	const coverMessage = await selectedChannel.send({ files: ["./resources/images/embed_banner.png"] });
	const reactionMessage = await selectedChannel.send({ embeds: [messageEmbed], files: [coverImage] });

	// reactionMessage.react("❌")

	return reactionMessage.id;
}
