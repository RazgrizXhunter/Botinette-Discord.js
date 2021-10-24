const countryFlagEmoji = require("country-flag-emoji");
const ct = require("countries-and-timezones");

module.exports = {
	getCountryByEmoji: (emoji) => {
		const flagData = findFlag(emoji);

		if (!flagData) return false;
		
		const countryAlpha2 = flagData[1].code;
		
		return ct.getCountry(countryAlpha2);
	},
	findFlag: findFlag
}

function findFlag(emoji) {
	const flagData = Object.entries(countryFlagEmoji.data).find( (country) => {
		if (country[1].emoji == emoji) {
			return country[1].code;
		}
	});

	return flagData;
}