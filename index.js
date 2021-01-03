var express = require('express')
var mongoDAO = require('./components/mongoDAO')
var bodyParser = require('body-parser')
const { body, validationResult, check } = require('express-validator');
var mySQLDAO = require('./components/mySQLDAO')
const { addCountries, updateCountry } = require('./components/mySQLDAO')

// access to express
var app = express()

// set bodyParser
app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'ejs')

// get method to main page with links
app.get('/', function (req, res) {
  res.sendFile(__dirname + "/views/index.html")
})

// shows the table of all cities
app.get('/listCities', (req, res) => {
  mySQLDAO.getCities()
    .then((result) => {
      // renders the view and passes in result
      res.render('showCities', { cities: result })
    })
    .catch((error) => {
      res.send(error)

    })
})

// displays the details of all countries
app.get('/listCountries', (req, res) => {
  mySQLDAO.getCountries()
    .then((result) => {
      // renders the view and passes in result
      res.render('showCountries', { countries: result })
    })
    .catch((error) => {
      //res.send(error)
      res.send("<h1>Error Message</h1>" + "<h3>Error: connect ECONNREFUSED 127.0.0.1:3306</h3>" + "<a href=/>Home Page</a>")
    })
})

// displays the details for heads of state
app.get('/listHeadsOfState', (req, res) => {
  mongoDAO.getHeadOfState()
    .then((documents) => {
      // renders the view and passes in documents
      res.render('showHeadsOfState', { headsOfState: documents })

    })
    .catch((error) => {
      //res.send(error)
      res.send("<h1>Error Message</h1>" + "<h3>Error: connect ECONNREFUSED 127.0.0.1:3306</h3>" + "<a href=/>Home Page</a>")
    })
})

// displays the form to add a country to database
app.get('/addCountries', (req, res) => {
  // renders the view and set errors as undefined
  res.render('addCountries', { errors: undefined })
})

//Post method for adding a country
// error validation to check if the name is at least 3 characters and code is exactly 3 characters
app.post('/addCountries',
  [check('name').isLength({ min: 3 }).withMessage("Country Name must be at least 3 characters"),
  check('code').isLength({ min: 3, max: 3 }).withMessage("Country Code must be 3 characters"),
  ],

  (req, res) => {
    //to check for errors
    var errors = validationResult(req)

    // if there is errors 
    if (!errors.isEmpty()) {
      // renders the view and passes in errors
      res.render("addCountries", { errors: errors.errors })
    } else {
      // adds the country if no errors and redirects back to the listCountries page
      mySQLDAO.addCountries(req.body.code, req.body.name, req.body.details)
        .then((result) => {
          res.redirect('/listCountries')
        })
        .catch((error) => {
          // if there is still an error must mean code exists 
          // use push method to pass error object
          // renders the view and passes in errors
          errors.errors.push({ msg: "Error: " + req.body.code + " already exists" });
          res.render("addCountries", { errors: errors.errors });
          res.send(error);
        })
    }
  })
// update country page takes in parameter to display details of particular country
app.get('/updateCountry/:code', (req, res) => {
  mySQLDAO.displayCountry(req.params.code)
    .then((result) => {
      // renders the view 
      res.render('updateCountry', { countries: result, errors: undefined })
    })
    .catch((error) => {
      res.send(error)
    })
})

// delete country takes in parameter so it can delete the specific country
app.get('/deleteCountry/:code', (req, res) => {
  mySQLDAO.deleteCountry(req.params.code)
    .then((result) => {
      res.redirect('/listCountries')
    })
    .catch((error) => {
      // cant delete country because its referenced by a foreign key
      res.send("<h1>Error Message</h1><br><br> <h2>" + req.params.code + " has cities, it cannot be deleted<h2><br> " + "<a href=/>Home Page</a>")
    })

})

// post method for update country
// checks to see if the name is at least one character
app.post('/updateCountry',
  [check('name').isLength({ min: 1 }).withMessage("Please enter a Country Name"),
  ],

  (req, res) => {
    // checks for errors
    var errors = validationResult(req)

    // if there is errors 
    if (!errors.isEmpty()) {
      // renders the view and passes in errors 
      res.render("updateCountry", { errors: errors.errors, countries: errors.errors })
    } else {

      // updates the country
      mySQLDAO.updateCountry(req.body.name, req.body.details, req.body.code)
        .then((result) => {
          // if rows are not affected display error messsage that country code cant be updated
          if (result.affectedRows == 0) {
            errors.errors.push({ msg: "Error:  Country Code cannot be updated" });
            res.render('updateCountry', { countries: errors.errors, errors: errors.errors })
          } else {
            res.redirect('/listCountries')
          }
        })
        .catch((error) => {
          res.send(error)

        })

    }

  })

// displays the specific city
// passes in parameter
app.get('/allCities/:code', (req, res) => {
  mySQLDAO.eachCityDetails(req.params.code)
    .then((result) => {
      // renders view and passes in result
      res.render('allCities', { cities: result })
    })
    .catch((error) => {
      res.send(error)
    })


})

// displays the form for adding a head of state
app.get('/addHeadOfState', (req, res) => {
  res.render('addHeadOfState', { errors: undefined })

})

// delete a head of state, takes in parameter so it can delete the specific id
app.get('/deleteHeadOfState/:_id', (req, res) => {
  mongoDAO.deleteHeadOfState(req.params._id)
    .then((result) => {
      res.redirect('/listHeadsOfState')
      //res.send(result)
    })
    .catch((error) => {
      res.send(error)
    })

})

//Post method for adding a head of state 
// error validation to check if the head of state is at least 3 characters and id is exactly 3 characters
app.post('/addHeadOfState',
  [check('headOfState').isLength({ min: 3 }).withMessage("Head Of State must be at least 3 characters"),
  check('_id').isLength({ min: 3, max: 3 }).withMessage("Country Code must be 3 characters"),

  ],
  (req, res) => {
    // to check for errors
    var errors = validationResult(req)

    // if there is any errors 
    if (!errors.isEmpty()) {
      // renders the view and passes in errors 
      res.render("addHeadOfState", { errors: errors.errors })
    } else {

      // adds the head of state 
      mongoDAO.addHeadOfState(req.body._id, req.body.headOfState)
        .then((result) => {
          // redirects to the listHeadsOfState page
          res.redirect('/listHeadsOfState')
        })
        .catch((error) => {
          // use push method to pass error object
          // renders the view and passes in errors
          errors.errors.push({ msg: "Error: Cannot add Head Of State as " + req.body._id + " already exists" });
          res.render("addHeadOfState", { errors: errors.errors });
        })

    }

  })

//port it listens at
app.listen(3007, () => {
  console.log("Listening at Port 3007")
})