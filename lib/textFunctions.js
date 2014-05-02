var User = require('../models/User.js');
var twilio = require('twilio')(process.env.TWILIO_ACCESS, process.env.TWILIO_TOKEN);
var twilioNumber = process.env.TWILIO_NUMBER

exports.subscribe = function(req, res, input) {
  input.splice(input.indexOf('SUBSCRIBE'), 1);
  var user = new User({name: input.join(' '), number: req.body['From']});
  user.save(function(err, mongoRes){
    if(err) {
      res.type('text/xml');
      res.end('<Response><Sms>There was an error subscribing, have you already subscribed?</Sms></Response>');
      console.log(err);
      return false;
    }
    res.type('text/xml');
    res.end('<Response><Sms>Thanks for subscribing to Pax Watch text SEND and your message to this number to send a message to the list</Sms></Response>');
  });
};

exports.globalSend = function(req, res, input) {
  input.splice(input.indexOf('SEND'), 1);
  var message = input.join(' ');
  var user;

  var queue = [
    function () {
      User.findOne({number: req.body['From']}, function(err, resUser){ 
        if( err ) {
          console.log(err);
          res.type('text/xml');
          res.send('<Response><Sms>Sorry, but you\'re not signed up please send SUBSCRIBE <nickname> to this number first</Sms></Response ');
          return false;
        }
        user = resUser
        queue.shift()();
      });
    },
    
    function () {
      User.find(function(err, users) {
        if( err ) {
          console.log(err);
          return false;
        }
        users.forEach(function(user){
          send(user, message);
        });
      });
    }
  ]
  queue.shift()();
};

function send(user, message) {
  twilio.sendMessage({
    to: user.number,
    from: twilioNumber,
    body: user.name + ': ' + message
  }, function(err, message) {
    if( err ) {
      console.log(err);
    } else {
      console.log('message sent to ' + user.name + ' at number: ' + user.number);
    }
  });
};



