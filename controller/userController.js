require("dotenv").config();

const User = require("../model/User");

const strings = require("../resources/strings");
const lang = process.env.APP_LANG;

module.exports = {
	create: createUser,
	findById: findUserById,
	getAll: async () => {
		return await User.find({});
	},
	insert: async (userDocument) => {
		try {
			return await userDocument.save();
		} catch (error) {
			console.error(error);
		}
	},
	update: async (userDocument) => {
		const filter = { "_id" : userDocument.id };
		const update = userDocument;

		try {
			return await User.findOneAndUpdate(filter, update);
		} catch (error) {
			console.error(error);
		}
	},
	delete: async (userDocument) => {
		const filter = { "_id": userDocument.id }

		try {
			return await User.findOneAndDelete(filter);
		} catch (error) {
			console.error(error);
		}
	}
}

async function findUserById(userId) {
	return await User.findOne({ userId });
}

function createUser(user) {
	return new User({
		_id: user.id,
		userName: user.name || user.username,
		userTimezone: user.timezone ? user.timezone : null
	})
}