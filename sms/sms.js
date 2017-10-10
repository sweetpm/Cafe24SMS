'use strict';

var q = require('q');
var request = require('request');
var config = require('./config');

var encodeBase64 = function (str) {
  return new Buffer(str).toString('base64');
};

exports.send = function (receiverPhone, title, message) {
  // Make receiverPhone format to fit Cafe24 SMS hosting service.
  if ((/^\d{3}-\d{3,4}-\d{4}$/).test(receiverPhone)) {
    receiverPhone = receiverPhone;
  } else if ((/^\d{10}$/).test(receiverPhone)) {
    receiverPhone = receiverPhone.substr(0, 3) + '-' + receiverPhone.substr(3, 3) + '-' + receiverPhone.substr(6, 4)
  } else if ((/^\d{11}$/).test(receiverPhone)) {
    receiverPhone = receiverPhone.substr(0, 3) + '-' + receiverPhone.substr(3, 4) + '-' + receiverPhone.substr(7, 4)
  } else {
    receiverPhone = undefined;
  }
  
  if (!title) {
    title = '';
  }
  title = title.replace('\\n', '\r\n');

  if (!message) {
    message = '';
  }
  message = message.replace('\\n', '\r\n');
  
  var parameters = {
    user_id: encodeBase64(config.cafe24SMS.userId),                 // SMS 아이디
    secure: encodeBase64(config.cafe24SMS.secure),                  // 인증키
    msg: encodeBase64(message),                                     // 메세지
    rphone: encodeBase64(receiverPhone),                            // 수신번호 ('-' 포함)
    sphone1: encodeBase64(config.cafe24SMS.senderPhone.phone1),     // 발신번호1
    sphone2: encodeBase64(config.cafe24SMS.senderPhone.phone2),     // 발신번호2
    sphone3: encodeBase64(config.cafe24SMS.senderPhone.phone3),     // 발신번호3
    rdate: encodeBase64(''),                                        // 예약날짜 (예. 20171009)
    rtime: encodeBase64(''),                                        // 예약시간 (예. 오후 5시 30분 -> 173000), 예약시간은 최소 10분 이상으로 설정하여야 한다.
    mode: encodeBase64('1'),                                        // Base64 사용시 모드값 1
    testflag: encodeBase64(''),                                     // 테스트시 Y
    destination: encodeBase64(''),                                  // 이름삽입번호 (예. 010-0000-0000|홍길동, msg에서 {name} 으로 사용)
    repeatFlag: encodeBase64(''),                                   // 반복 설정할 경우 Y
    repeatNum: encodeBase64(''),                                    // 반복 횟수 (1~10회)
    repeatTime: encodeBase64(''),                                   // 반복 시간 (15분 이상부터 가능)
    returnurl: encodeBase64(''),                                    // 메세지 전송 후 이동할 페이지 (http:// 붙여야 함)
    nointeractive: encodeBase64('')                                 // 사용할 경우 1 (성공시 alert를 사용하지 않게 함)
  };

  if (message.length > 80) {
    parameters.subject = encodeBase64(title);
    parameters.smsType = encodeBase64('L');
  } else {
    parameters.smsType = encodeBase64('S');
  }

  var deferred = q.defer();
  
  // Validate parameters
  if (!(parameters && parameters.user_id && parameters.secure && parameters.msg && parameters.rphone)) {
    deferred.reject('Invalid parameters.');
  }

  var smsRequest = request.post(config.cafe24SMS.url, function (err, res, body) {
    if (err) {
      deferred.reject(err);
    } else {
      if (body.substr(0, 7) === 'success') {
        deferred.resolve(body);
      } else {
        deferred.reject(body);
      }
    }
  });

  var requestForm = smsRequest.form();
  for (var parameter in parameters) {
    requestForm.append(parameter, parameters[parameter]);
  }

  return deferred.promise;
};
