const MongoClient = require('mongodb').MongoClient

// URL connection
const url = 'mongodb://localhost:27017';

const dbName = 'headsOfStateDB'
const collName = 'headsOfState'

var headsOfStateDB
var state

// creates a connection to server 
MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
.then((client) => {
   headsOfStateDB = client.db(dbName)
   state = headsOfStateDB.collection(collName)
})
.catch((error) => {
   console.log(error)
})

// gets the heads of state from database
var getHeadOfState = function(){
    return new Promise((resolve, reject) => {
        var cursor = state.find()
        cursor.toArray()
            .then((documents) => {
                resolve(documents)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// add a head of state to database
var addHeadOfState = function(_id, headOfState){
    return new Promise((resolve, reject) => {
        state.insertOne({"_id":_id, "headOfState":headOfState})
        
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// delete a head of state from database
var deleteHeadOfState = function(_id){
    return new Promise((resolve, reject) => {
        state.deleteOne({ "_id":_id})
        
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            })
    })
}



// export the functions
module.exports = { getHeadOfState, addHeadOfState,  deleteHeadOfState }