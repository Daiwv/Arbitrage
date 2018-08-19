'use strict'

const colors = require('colors/safe')
const helpStr = `
Welcome to Arbitrage. Arbitrage is a tool designed for trading on crypto currency market.
Arbitrage is now support numbers of markets, you can using by typing following number.
[1] Printing this help
[2] Running ABCC Default Trading
[3] Running ABCC Arbitrage Trading
[4] To be continue
Enjoy your arbitrage!
`

function printHelp () {
  console.log(colors.yellow(helpStr))
}

module.exports.printHelp = printHelp
