var express    = require('express');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var textFunctions = require('./lib/textFunctions');
var app        = express();

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/pax-watch');

app.use(bodyParser());

app.post('/textIn', function(req, res){
  var input = req.body['Body'].split(' ');
  if(input[0] === 'SUBSCRIBE') {
    textFunctions.subscribe(req, res, input);
  } else if( input[0] === 'SEND') {
    textFunctions.globalSend(req, res, input);
  }
});

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function(){
  console.log("server started on port " + app.get('port'));
});
