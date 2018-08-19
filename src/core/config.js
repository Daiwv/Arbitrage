'use strict'

const debug = require('debug')('core:config')
const fs = require('fs')
const path = require('path')
const configFile = path.resolve(process.cwd(), './config.json')
const config = JSON.parse(fs.readFileSync(configFile))

debug(config)

module.exports = {
  abcc: {
    default: {
      name: config.abcc.default.name,
      username: config.abcc.default.username,
      password: config.abcc.default.password,
      symbols: config.abcc.default.symbols
    },
    arbitrage: {
      name: config.abcc.arbitrage.name,
      username: config.abcc.arbitrage.username,
      password: config.abcc.arbitrage.password,
      symbols: config.abcc.arbitrage.symbols
    }
  }

}
