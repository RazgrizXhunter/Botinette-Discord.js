const mongoose = require("mongoose");

module.exports = {
	connect: async (uri, port) => {
		try {
			return await mongoose.connect(`mongodb://${uri}:${port}/`);
		} catch (error) {
			console.log(`There has been an error while connecting to the mongoDB.\n${port}`);
			return false;
		}
	}
}