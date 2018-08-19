'use strict'

const colors = require('colors/safe')
const readlineSync = require('readline-sync')
const usages = ['See Help Info', 'Running ABCC Default Trading', 'Running ABCC Arbitrage Trading', 'To be continue']
const help = require('./help.js').printHelp
const defaultAbccjs = require('./abcc.js').defaultAbccjs
const arbitrageAbccjs = require('./abcc.js').arbitrageAbccjs;

(async () => {
  do {
    console.log(colors.green('Welcome to Arbitrage, select your function:'))
    var index = readlineSync.keyInSelect(usages)
    switch (index) {
      case 0:
        await help()
        break
      case 1:
        console.log(colors.yellow('\nABCC Default Trading Starting...\n'))
        await defaultAbccjs()
        break
      case 2:
        console.log(colors.yellow('\nABCC Arbitrage Trading Starting...\n'))
        await arbitrageAbccjs()
        break
      case 3:
        console.log(colors.yellow('\nTo be continue...\n'))
        break
      default:
        console.log(colors.yellow('\nCANCEL selected, bye!\n'))
        break
    }
  } while (index === 0)
})()
