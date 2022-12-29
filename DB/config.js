const query = require("mysql2");

// const connection = query.createConnection({
//     host:"sql6.freesqldatabase.com",
//     database:"sql6585356",
//     user:"sql6585356",
//     password:"45mvMe4Wls"
// })
const connection = query.createConnection({
    host:"mysql-102257-0.cloudclusters.net",
    database:"CarRentalDB",
    user:"ahmad",
    password:"ahmad169",
    port:18967
})
// const connection = query.createConnection({
//     host:"localhost",
//     database:"carrental",
//     user:"root",
//     password:""
// })


module.exports = connection