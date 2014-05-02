var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  name : String,
  number : {type: String, unique: true}
});

module.exports = mongoose.model('User', userSchema);
