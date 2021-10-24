const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
	_id: String,
	userName: String,
	userTimezone: String
});

module.exports = mongoose.model("User", UserSchema);