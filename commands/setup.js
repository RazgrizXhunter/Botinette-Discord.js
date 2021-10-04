const { GuildChannelManager, MessageEmbed, MessageAttachment  } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const dotenv = require("dotenv").config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Creará un canal para identificar las nacionalidades de los usuarios.'),
		
		async execute(interaction) {
			const channelName = "botinette-paises";
			const channelSnowflake = await createChannelIfNotExists(interaction, channelName);

			let message;

			if (channelSnowflake) {
				sendSetupMessages(interaction, channelSnowflake);

				message = "✅ Se ha ejecutado con éxito el setup.";
			} else {
				message = "❌ El setup no se ha podido ejecutar.";
			}

			try {
				sendTimedMessage(interaction, message, 5);
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
			id: interaction.guild.id, //Same as @Everyone, don't know how to get it, but the function does the exact same
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

	const coverImage = new MessageAttachment("./resources/cover.png");

	const messageEmbed = new MessageEmbed()
	.setAuthor("¡Reacciona con la bandera de tu país!")
	.setDescription("Reaccionando con la bandera de tu país, cada vez que se use el comando /hora, convertiré la hora de españa a la hora de tu país.")
	.setImage("attachment://cover.png")
	.setColor("#6C9CF0");

	await selectedChannel.send({ files: ["./resources/banner.png"] });
	await selectedChannel.send({ embeds: [messageEmbed], files: [coverImage] });
}

function sendTimedMessage(interaction, message, seconds) {
	interaction.reply(message)
	.then(
		setTimeout(() => {
			interaction.deleteReply()
		}, seconds * 1000)
	).catch(err => console.log(err));
}

/* Requerimientos
	-si es posible debe limitar los emojis sólo a las banderas de países
	-crear un canal nuevo en el que nadie más que el bot pueda hablar, pero puedan reaccionar
	-si un usuario marca más de una bandera, que se guarde sólo la primera que marcó
	-añadir un servidor nosql para guardar los países, zona horaria y emoji
*/