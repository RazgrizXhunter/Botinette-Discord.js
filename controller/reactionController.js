require("dotenv").config();

const { GuildChannelManager, MessageManager, MessageActionRow, MessageSelectMenu } = require("discord.js");
const guildController = require("./guildController");
const userController = require("./userController");
const countryController = require("./countryController");
const dateController = require("./dateController");
const utils = require("./utils");

const strings = require("../resources/strings").reaction_controller;
const lang = process.env.APP_LANG || "es";

module.exports = {
	isInTheRightChannel: async (reaction) => {
		reaction = await fetchMessageFromPartial(reaction);

		const guild = await guildController.findById(reaction.message.guild.id);

		if (!guild) {
			return false;
		}

		if (reaction.message.channelId != guild.interactionChannel._id) {
			return false;
		}

		return true;
	},
	isToTheRightMessage: async (reaction) => {
		reaction = await fetchMessageFromPartial(reaction);

		const guild = await guildController.findById(reaction.message.guild.id);

		if (!guild) {
			return false;
		}
		
		if (reaction.message.id != guild.interactionChannel.interactionMessageId) {
			return false;
		}

		return true;
	},
	isAValidFlag: async (emoji) => {
		const flagInfo = await countryController.findFlag(emoji);

		if (!flagInfo) {
			return false;
		}

		return true;
	},
	sendTimezonesDM: async (emoji, user) => {
		const country = countryController.getCountryByEmoji(emoji);

		if (!country) return;

		let options = getTimeZonesPayload(country);

		const dropdownDM = new MessageActionRow()
		.addComponents(
			new MessageSelectMenu()
			.setCustomId(user.id)
			.setPlaceholder(strings.placeholder[lang])
			.addOptions(options)
		);
		
		const message = { content: strings.timezone_prompt[lang], components: [dropdownDM] }

		return user.send(message);
	}
}

async function fetchMessageFromPartial(reaction) {
	if (reaction.message.partial) {
		try {
			await reaction.message.fetch();
		} catch (error) {
			console.error(error);
		}
	}

	return reaction;
}

function getTimeZonesPayload(country) {
	let options = [];

	for (const timezone of country.timezones) {
		const date = dateController.getNowFromTimezone(timezone);
		const city = timezone.split("/")[timezone.split("/").length - 1].replace("_", " ");

		const payload = {
			label: city,
			description: date.toFormat("HH:mm").toString(),
			value: timezone
		} 

		options.push(payload);
	}
	
	return options;
}