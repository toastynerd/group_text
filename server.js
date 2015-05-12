var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var textFunctions = require('./lib/textFunctions');
var app = express();

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/pax-watch');

app.use(bodyParser());

app.post('/textIn', function(req, res){
  var input = req.body['Body'].split(' ');
  if(input[0] === 'SUBSCRIBE') {
    textFunctions.subscribe(req, res, input);
  } else if(input[0] === 'STOPTHEMADNESS' && input.length === 1) {
    textFunctions.unSubscribe(req, res, input);
  } else {
    textFunctions.globalSend(req, res, input);
  }
});

app.get('/style.css', function(req, res) {
  res.set('Content-Type', 'text/css');
  var readStream = fs.createReadStream('./static/style.css');
  readStream.pipe(res);
});

app.get('*', function(req, res) {
  var readStream = fs.createReadStream('./static/welcome.html');
  readStream.pipe(res);
});

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function(){
  console.log("server started on port " + app.get('port'));
});
