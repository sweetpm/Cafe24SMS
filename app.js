'use strict';

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', require('./routes/sms'));

var port = process.env.PORT || 8051;

console.log('Cafe24SMS 서버 시작 (' + port + ')');
app.listen(port);

module.exports = app;
