var csrf = require('csrf-lite');
var Cookies = require('cookies');
var qs = require('querystring');
var http = require('http');

http.createServer(function (req, res) {
  var c = new Cookies(req, res);

  // use the session id as the token
  var token = c.get('sessid');

  // if the user doesn't have one, then give them one.
  // it's just a random string anyway.
  if (!token) {
    token = csrf(token);
    c.set('sessid', token);
  }

  switch (req.method) {
    case 'GET': return showForm(req, res, token);
    case 'POST': return validForm(req, res, token);
  }
}).listen(8080)

function showForm(req, res, token) {
  res.end('<html><form method=post>' +
          '<label>Name <input name=name></label>' +
          // add the csrf token html
          csrf.html(token) +
          '<input type=submit value=GO>' +
          '</form></html>');
}

function validForm(req, res, token) {
  // note: this won't work for 
  req.setEncoding('utf8');
  var data = '';
  req.on('data', function(c) {
    data += c;
  });
  req.on('end', function() {
    data = qs.parse(data);

    // validate with the user's token
    var valid = csrf.validate(data, token);
    if (valid)
      res.end('ok\n');
    else {
      res.statusCode = 403;
      res.end('csrf detected!\n');
    }
  });
}