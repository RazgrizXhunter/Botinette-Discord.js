const luxon = require("luxon");
const DateTime = luxon.DateTime;

module.exports = {
	getNowFromTimezone : (timezone) => {
		const date = DateTime.fromISO(DateTime.now().toJSDate().toISOString(), { zone: timezone });
		return date;
	}
}
