'use strict';

var express = require('express');
var router = express.Router();
var sms = require('../sms/sms');

router.get('/', (req, res) => {
  return res.send('Use POST /send');
});

router.post('/send', (req, res) => {
  var receiverPhone = req.body.receiverPhone;
  var title = req.body.title;
  var message = req.body.message;

  sms.send(receiverPhone, title, message)
  .then(function (result) {
    console.log(result);
    return res.status(200).send();
  }, function(reason) {
    return res.status(500).send(reason);
  });
});

module.exports = router;
