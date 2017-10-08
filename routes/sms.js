'use strict';

var express = require('express');
var router = express.Router();
var sms = require('../sms/sms');

router.post('/send', (req, res) => {
  var receiverPhone = req.body.receiverPhone;
  var message = req.body.message;

  sms.send(receiverPhone, message)
  .then(function (result) {
    console.log(result);
    return res.status(200).send();
  }, function(reason) {
    return res.status(500).send(reason);
  });
});

module.exports = router;
