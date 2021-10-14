const mongoose = require("mongoose");

module.exports = {
	connect: async (uri, port, user, password, dbName) => {
		try {
			return await mongoose.connect(`mongodb://${uri}:${port}/`, {
				user: user,
				pass: password,
				dbName: dbName
			});
		} catch (error) {
			console.log(`There has been an error while connecting to the mongoDB.\nShutting down the bot to preserve data.`);
			console.log(error);
			process.exit(1);
		}
	}
}