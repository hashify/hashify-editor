fs = require 'fs'

CoffeeScript = require 'coffee-script'
express = require 'express'


task 'server', 'start the development server', ->
  app = express.createServer()
  app.get '/favicon.ico', ->
  app.get '/test/test.js', (req, res) ->
    res.contentType 'js'
    res.send CoffeeScript.compile fs.readFileSync 'test/test.coffee', 'utf8'
  app.get '/', (req, res) -> res.sendfile __dirname + '/test/test.html'
  app.get '*', (req, res) -> res.sendfile __dirname + req.route.params[0]
  port = process.env.PORT ? 3456
  app.listen port, -> console.log "listening on port #{port}"
