require("dotenv").config();
const mongoose = require("mongoose");

const connectionParams = {
	uri:		process.env.MONGOOSE_URI || "localhost",
	port:		process.env.MONGOOSE_PORT || 27017,
	user:		process.env.MONGOOSE_USER,
	password:	process.env.MONGOOSE_PASSWORD,
	dbName:		process.env.NODE_ENV == "production" ? "Botinette" : "Botinette-Dev"
}

module.exports = {
	connect: async () => {
		try {			
			const database = await mongoose.connect(`mongodb://${connectionParams.uri}:${connectionParams.port}/`, {
				user: connectionParams.user,
				pass: connectionParams.password,
				dbName: connectionParams.dbName,
				useNewUrlParser: true,
				useUnifiedTopology: true
			});
			return database;
		} catch (error) {
			throw Error("There has been an error while connecting to mongoDB.\nShutting down the bot to preserve data integrity.", { cause: error });
		}
	},
	close: async () => {
		try {
			if (mongoose.connection.readyState) {
				mongoose.connection.close();
			} else {
				console.error("Connection to the database is not open, therefore it could not be closed.");
			}
		} catch (error) {
			console.error(error);
		}
	}
}