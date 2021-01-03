var mysql = require('promise-mysql');

var pool

// connection pool to the database
mysql.createPool({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    password: 'dcwa',
    database: 'geography'
})
    .then((result) => {
        pool = result
    })
    .catch((error) => {
        console.log(error)
    });

    // gets countries and all its details
var getCountries = function () {
    return new Promise((resolve, reject) => {
        pool.query('select * from country')
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// allows us to add a country to the database
var addCountries = function (co_code, co_name, co_details) {
    return new Promise((resolve, reject) => {
        // add parameters to the query
        pool.query('insert into country set ?', { co_code, co_name, co_details })
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// allows us to update a country in the database
var updateCountry = function (co_name, co_details, co_code) {
    return new Promise((resolve, reject) => {
        var myQuery = {
        
            sql: 'update country set co_name = ?, co_details = ? where co_code = ?',
            
            values: [co_name, co_details, co_code]
        }
        pool.query(myQuery)
            

            .then((result) => {
                resolve(result)

            })
            .catch((error) => {

                reject(error)
            })
    })
}


// displays the country
var displayCountry = function (co_code) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'select * from country where co_code = ?',
            values: [co_code]
        }
        pool.query(myQuery)
            

            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// deletes a country from the database
var deleteCountry = function (co_code) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'delete from country where co_code = ?',
            values: [co_code]
        }
        pool.query(myQuery)
            

            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// to get a city and all its details
var getCities = function () {
    return new Promise((resolve, reject) => {
        pool.query('select * from city')
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// gets all the details for each city including details from the country database for a particular city
var eachCityDetails = function (cty_code) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'select city.cty_code,city.co_code, city.cty_name, city.population, city.isCoastal, city.areaKM, country.co_name from city left join country on city.co_code = country.co_code where city.cty_code = ?',
            values: [cty_code]
        }
        pool.query(myQuery)
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            })
    })
}



// export each function
module.exports = { getCountries, addCountries, displayCountry, updateCountry, deleteCountry , getCities,  eachCityDetails }