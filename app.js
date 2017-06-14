// This file simulations a buggy login server.
// https://github.com/oakmac/jquery-login-form

var express = require('express')
var bodyParser = require('body-parser')

var app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const defaultPort = 7979
const port = process.argv[2] ? parseInt(process.argv[2], 10) : defaultPort

app.use(enableCors)
app.use(slowItDown)
app.use(express.static('public'))
app.post('/api/login', loginRequest)
app.listen(port)

console.log('HTTP server running on port ' + port)

// -----------------------------------------------------------------------------
// Functions
// -----------------------------------------------------------------------------

function randomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function slowItDown (req, res, nextFn) {
  if (req.query && req.query['_slow']) {
    setTimeout(nextFn, randomInt(400, 1000))
  } else {
    nextFn()
  }
}

function enableCors (req, res, nextFn) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  nextFn()
}

const testUsers = {
  'testuser1': 'ilovebananas',
  'testadmin5': 'always_name_your_functions',
  'qauser3': 'luv2manage5tate'
}

function loginRequestError (req, res) {
  res.status(500)
     .send(JSON.stringify({error: 'Server error :('}))
}

function loginRequestResponse (req, res) {
  var username = req.body.username
  var password = req.body.password

  if (!testUsers.hasOwnProperty(username)) {
    res.status(400)
       .send(JSON.stringify({error: 'Invalid username.'}))
  } else if (testUsers[username] !== password) {
    res.status(400)
       .send(JSON.stringify({error: 'Invalid password.'}))
  } else {
    res.status(200)
       .send(JSON.stringify({message: 'Login successful!'}))
  }
}

function loginRequest (req, res) {
  var dice = randomInt(1, 10)
  var normalWait = randomInt(150, 3500)
  var longWait = randomInt(20 * 1000, 40 * 1000)
  var normalResponse = loginRequestResponse.bind(null, req, res)
  var errorResponse = loginRequestError.bind(null, req, res)

  if (dice === 1) { // 1/10 requests take 20-40 seconds to respond
    setTimeout(normalResponse, longWait)
  } else if (dice === 2 || dice === 3) { // 2/10 requests fail with a 500 error
    setTimeout(errorResponse, normalWait)
  } else { // the rest of the requests are handled normally after a brief wait time
    setTimeout(normalResponse, normalWait)
  }
}
