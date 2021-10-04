const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core');
const {
	AudioPlayerStatus,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
} = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Reproduce música de YouTube!')
		.addStringOption(option =>
			option.setName('link')
				.setDescription('Link de YouTube.')
				.setRequired(true)
		),
		
		async execute(interaction) {
			const payload = interaction.options.get("link").value;
			const info = await ytdl.getInfo(payload.split("=")[1]);

			const connection = joinVoiceChannel({
				channelId: interaction.member.voice.channel.id,
				guildId: interaction.member.guild.id,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			});
			
			const stream = ytdl(payload, { filter: 'audioonly' });
			const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
			const player = createAudioPlayer();
			
			player.play(resource);
			connection.subscribe(player);
			
			player.on(AudioPlayerStatus.Idle, () => connection.destroy());

			await interaction.reply(`🎶 Reproduciendo ${info.videoDetails.title}`);
		}
}