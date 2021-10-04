const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hora')
		.setDescription('Convierte la hora de España a Hispanoamérica!')
		.addStringOption(option =>
			option.setName('hora')
				.setDescription('La hora que se requiere para convertir')
				.setRequired(true)
		),
		
		async execute(interaction) {
			const payload = interaction.options.get("hora").value;
			await interaction.reply(`🇪🇸: ${payload}`);
		}
}