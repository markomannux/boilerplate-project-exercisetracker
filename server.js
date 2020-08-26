require('dotenv').config();
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
const Schema = mongoose.Schema;
console.log(`Connecting to ${process.env.MLAB_URI}`)
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


const userSchema = new Schema({
  username: {
    type: String
  }
})

const AppUser = mongoose.model('AppUser', userSchema);


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

/*
 * I can create a user by posting form data username to /api/exercise/new-user and returned will be an object with username and _id.
 */

app.post('/api/exercise/new-user', (req, res) => {
  const username = req.body.username;
  console.log(`posting new user: ${username}`);
  
  const user = new AppUser({
    username: username
  })

  user.save((err, data) => {
    if (err) {
      console.log('Error saving user', err);
      return;
    }
    res.json({
      _id: data._id,
      username: data.username
    })
  })

});


/*
 * I can get an array of all users by getting api/exercise/users with the same info as when creating a user.
 */
app.get('/api/exercise/users', (req, res) => {
  const username = req.body.username;
  console.log(`getting all users`)

  AppUser.find({}, (err, data) => {
    if (err) {
      console.log(err);
      return;
    }

    res.json(data);
  })
});

app.post('/api/exercise/add', (req, res) => {
  console.log(`posting new exercise:`, req.body)
  res.json({
    _id: 123,
    username: 'testuser',
    description: 'test test',
    duration: 6,
    date: '2020-01-01'
  });
});

app.get('/api/exercise/log', (req, res) => {
  const userId = req.params.userId;
  console.log(`getting log: ${userId}`)
  res.json({
    _id: 123,
    username: 'testuser',
    log: [
      {
        description: 'test test',
        duration: 6,
        date: '2020-01-01'
      },
      {
        description: 'test test',
        duration: 6,
        date: '2020-01-01'
      }
    ],
    count: 2
  })
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
