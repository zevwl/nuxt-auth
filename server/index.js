require('dotenv').config()

const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const { google } = require('googleapis')

const app = express()
const db = require('./lib/mysql')
const crypt = require('./lib/crypt')

// Server middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Routes
const routes = require('./routes')
app.use('/', routes({express, db, crypt, jwt, google}))

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
