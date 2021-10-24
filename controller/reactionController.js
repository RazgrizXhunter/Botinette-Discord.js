require("dotenv").config();

const { GuildChannelManager, MessageManager, MessageActionRow, MessageSelectMenu } = require("discord.js");
const guildController = require("./guildController");
const countryController = require("./countryController");
const dateController = require("./dateController");

const strings = require("../resources/strings").reactionController;
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

		let options = []

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

		const dropdownDM = new MessageActionRow()
		.addComponents(
			new MessageSelectMenu()
			.setCustomId(user.id)
			.setPlaceholder(strings.placeholder[lang])
			.addOptions(options)
		);
		
		const message = { content: strings.timezone_prompt[lang], components: [dropdownDM] }

		user.send(message)
		.then((message) => {
			setTimeout(() => {
				message.delete();
			}, 60 * 1000);
		});
		
		// TODO: wait some time and if the user doesnt respond, remove the dm and unregister the user from the database

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
