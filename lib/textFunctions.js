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
    res.end('<Response><Sms>Thanks for subscribing to Pax Watch text your message to this number to send a message to the list. Text UNSUBSCRIBE to unsubscribe</Sms></Response>');
  });
};

exports.unSubscribe = function(req, res, input) {
  input.splice(input.indexOf('UNSUBSCRIBE'), 1);
  User.remove({number: req.body['From']}, function(err) {
    if(err) {
      console.log(err);
      res.type('text/xml');
      res.end('<Response><Sms>There was an error in unsubscribing, contact toastyi<Response><Sms>');
      return false;
    }
    res.type('text/xml');
    res.end('<Response><Sms>You have been unsubscribed<Response><Sms>');
  });
};

exports.globalSend = function(req, res, input) {
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
        users.forEach(function(toUser){
          send(toUser, message, user);
        });
      });
    }
  ]
  queue.shift()();
};

function send(user, message, fromUser) {
  twilio.sendMessage({
    to: user.number,
    from: twilioNumber,
    body: fromUser.name + ': ' + message
  }, function(err, message) {
    if( err ) {
      console.log(err);
    } else {
      console.log('message sent to ' + user.name + ' at number: ' + user.number);
    }
  });
};



