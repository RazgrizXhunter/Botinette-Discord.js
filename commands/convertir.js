const dotenv = require("dotenv").config();
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DateTime } = require("luxon");

const lang = process.env.APP_LANG || "es";
const strings = require("../resources/strings.json").command_convertir;
const locale = require("../resources/strings.json").shared.locale[lang];

module.exports = {
	data: new SlashCommandBuilder()
		.setName(strings.name[lang])
		.setDescription(strings.description[lang])
		.addStringOption(option =>
			option.setName(strings.option_name[lang])
				.setDescription(strings.option_description[lang])
				.setRequired(true)
		),
		
		async execute(interaction) {
			const dateTime = getDateTime(interaction.options.get(strings.option_name[lang]).value);
			const registeredTimezones = getRegisteredTimezones();
			const message = constructMessage(dateTime, registeredTimezones) || "Mensaje no definido";

			if (!dateTime || !dateTime.isValid) {
				await interaction.reply({ content: strings.execution_error[lang] , ephemeral: true });
				return;
			}
			
			await interaction.reply(message);
		}
}

function getDateTime(unformattedString) {
	const args = unformattedString.split(" ");

	const hour = args.filter(arg => arg.includes(":")).toString();
	const date = args.filter(arg => arg.includes("/")).toString();
	const timezone = args.filter(arg => !arg.includes(":") && !arg.includes("/")).toString() || "CET";
	
	if (!hour) { return false }
	
	unformattedObject = {
		year: 		date.split("/")[2] || "1",
		month: 		date.split("/")[1] || "1",
		day: 		date.split("/")[0] || "1",
		hour: 		hour.split(":")[0] || "0",
		minute: 	hour.split(":")[1] || "0"
	}

	console.log(JSON.stringify(unformattedObject));
	
	try {
		return DateTime.fromObject(unformattedObject, { zone: timezone, locale: locale });
	} catch (error) {
		console.log(error);
		return false;
	}
}

function getRegisteredTimezones() { //This one should check the database for registered timezones and return an array of timezones, hopefully in Continent/City notation

	return false;
}

function constructMessage(dateTime, objectiveTimezones) { //return required timezones in a unique string
	
	return "pos si";
	return false;
}