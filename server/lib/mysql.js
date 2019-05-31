require('dotenv').config()

const mysql = require('mysql')

let pool

(function handleDisconnect() {
  pool = mysql.createPool(process.env.DB_URL)

  pool.on('error', function (error) {
    console.log('Database error:', error)
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect()
    } else {
      throw error
    }
  })
})()

pool.on('connection', connection => {
  connection.query(`SET NAMES 'utf8'`)
  connection.query(`SET CHARACTER SET utf8`)
  connection.query(`SET SESSION sql_mode = 'TRADITIONAL'`)
  console.log(`New connection: ${connection.threadId}`)
})

pool.on('release', connection =>
  console.log(`Connection ${connection.threadId} released.`))

module.exports = {
  getConnection: function (callback) {
    pool.getConnection(function (err, connection) {
      callback(err, connection)
    })
  },

  runQuery: function (query, data) {
    return new Promise((resolve, reject) =>
      this.getConnection((error, connection) => {
        if (error) {
          // Connection error
          console.log('Error connecting to database.', error)
          return reject(error)
        }

        connection.query(query, data, (error, result) => {
          if (error) {
            // Query error
            console.log(`Error executing command: ${query}`)
            console.log('Data: ', data)
            console.log(error)
            return reject(error)
          }

          resolve(result)
          connection.release()
        })
      })
    )
  }
}
