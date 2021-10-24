

module.exports = {
	wait: async (seconds) => {
		return new Promise((resolve) => {
			setTimeout(resolve, seconds * 1000);
		});
	}
}