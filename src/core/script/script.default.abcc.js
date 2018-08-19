/**
 * @name SCRIPT-DEFAULT-ABCC-JS
 * @desc  cli tool for default trading in abcc
 */
'use strict'

const debug = require('debug')('core:abcc')
const abcc = require('../lib/lib.abcc.js')
const math = require('mathjs')
const path = require('path')
const log = require('../utils.js').log
const boxExchangeLogFile = path.resolve(process.cwd(), './logs/script.default.abcc.' + new Date().toString().replace(/\s+/g, '.') + '.boxExchange.log')
const cTable = require('console.table')

const config = require('../config.js').abcc.default
const username = process.argv.indexOf('--username') >= 0 ? process.argv[process.argv.indexOf('--username') + 1] : config.username
const password = process.argv.indexOf('--password') >= 0 ? process.argv[process.argv.indexOf('--password') + 1] : config.password
const symbols = process.argv.indexOf('--symbols') >= 0 ? process.argv[process.argv.indexOf('--symbols') + 1] : config.symbols

// btcusdt
// const defaultEpoch = 1 // min
// const defaultDepth = 0.2
// const maxRevoke = 5
// const changeRatio = 0.001
// const typePositiveDefaultNum = 0.002
// const typeDefaultNum = 0.002
// const typeNagetiveDefaultNum = 0.002
// const pricePrecision = 2
// const numPrecision = 6

// ethbtc
const defaultEpoch = 2 // min
const defaultDepth = 0.05
const maxRevoke = 5
const changeRatio = 0.003
const typePositiveDefaultNum = 0.03
const typeDefaultNum = 0.02
const typeNagetiveDefaultNum = 0.03
const pricePrecision = 6
const numPrecision = 2

global.defaultType = 0
global.typePrice = 0
global.typeLastPrice = 0
global.typePriceChange = 0
global.nowPrice = 0
global.buyOnePrice = 0
global.sellOnePrice = 0

function logBoxExchange (boxExchange) {
  let tableBox = []
  for (let i = 0; i < boxExchange.buyBox.buyPrice.length; i++) {
    tableBox[i] = {
      buyMoney: boxExchange.buyBox.buyMoney[i],
      buyNum: boxExchange.buyBox.buyNum[i],
      buyPrice: boxExchange.buyBox.buyPrice[i],
      sellPrice: boxExchange.sellBox.sellPrice[i],
      sellNum: boxExchange.sellBox.sellNum[i],
      sellMoney: boxExchange.sellBox.sellMoney[i]
    }
  }
  let table = symbols.toUpperCase() + ' Default BoxExchange Table ( nowPrice: ' + boxExchange.nowPrice + ' ) \n' + cTable.getTable(tableBox)
  log(table, boxExchangeLogFile)
  log('// SUCCEED //: logBoxExchange function: done')
}

function logNowPriceExchange (nowPrice, typePriceChange) {
  let table = symbols.toUpperCase() + ' Default NowPrice Table ( nowPrice: ' + nowPrice + ', typePriceChange: ' + typePriceChange + ' ) \n'
  log(table, boxExchangeLogFile)
  log('// SUCCEED //: logNowPriceExchange function: done')
}

function logDefaultCalc (defaultType) {
  let table = symbols.toUpperCase() + ' Default Calc Result Table ( defaultType: ' + defaultType + ' ) \n'
  log(table, boxExchangeLogFile)
  log('// SUCCEED //: logDefaultCalc function: done')
}

function logDefaultType (buyPrice, buyNum, sellPrice, sellNum) {
  let table = symbols.toUpperCase() + ' Default Type Result Table ( buyPrice: ' + buyPrice + ', buyNum: ' + buyNum + '; sellPrice: ' + sellPrice + ', sellNum: ' + sellNum + ', income: ' + math.subtract(math.multiply(sellPrice, sellNum, 0.999), math.multiply(buyPrice, buyNum, 1.001)) + ' )\n'
  log(table, boxExchangeLogFile)
  log('// SUCCEED //: logDefaultType function: done')
}

async function defaultRunCalc (pageExchange) {
  var boxExchange = await abcc.getBoxExchange(pageExchange)
  global.typeLastPrice = await global.typePrice
  global.typePrice = await global.typePrice > 0 ? (global.typePrice + global.nowPrice) / 2 : global.nowPrice
  global.typePriceChange = await global.typeLastPrice > 0 ? (global.typePrice - global.typeLastPrice) / global.typeLastPrice : 0
  await logNowPriceExchange(boxExchange.nowPrice, global.typePriceChange)
  if (global.typePriceChange > changeRatio) { // 高拋
    global.defaultType = await -1
  } else if (global.typePriceChange < -changeRatio) { // 低吸
    global.defaultType = await 1
  } else { // 震荡行情
    global.defaultType = await 0
  }
  await logDefaultCalc(global.defaultType)
}

async function defaultRunBoxExchange (pageExchange) {
  var boxExchange = await abcc.getBoxExchange(pageExchange)
  await logBoxExchange(boxExchange)
  global.nowPrice = await global.nowPrice > 0 ? (global.nowPrice + boxExchange.nowPrice) / 2 : boxExchange.nowPrice
  global.buyOnePrice = await global.buyOnePrice > 0 ? math.min(global.buyOnePrice, boxExchange.nowPrice) : boxExchange.nowPrice
  global.sellOnePrice = await global.sellOnePrice > 0 ? math.max(global.sellOnePrice, boxExchange.nowPrice) : boxExchange.nowPrice
}

async function defaultRunType (buyPageExchange, sellPageExchange) {
  global.buyOnePrice = math.multiply(global.buyOnePrice, math.add(1, defaultDepth))
  global.sellOnePrice = math.multiply(global.sellOnePrice, math.subtract(1, defaultDepth))
  var res = await false
  if (global.defaultType > 0) { // buy
    res = await abcc.runDefaultExchange(buyPageExchange, sellPageExchange, global.buyOnePrice, typePositiveDefaultNum, 0, 0, pricePrecision, numPrecision)
    await logDefaultType(global.buyOnePrice, typePositiveDefaultNum, 0, 0)
  } else if (global.defaultType < 0) { // sell
    res = await abcc.runDefaultExchange(buyPageExchange, sellPageExchange, 0, 0, global.sellOnePrice, typeNagetiveDefaultNum, pricePrecision, numPrecision)
    await logDefaultType(0, 0, global.sellOnePrice, typeNagetiveDefaultNum)
  } else {
    if (math.subtract(math.multiply(global.sellOnePrice, typeDefaultNum, 0.999), math.multiply(global.buyOnePrice, typeDefaultNum, 1.001)) > 0) {
      res = await abcc.runDefaultExchange(buyPageExchange, sellPageExchange, global.buyOnePrice, typeDefaultNum, global.sellOnePrice, typeDefaultNum, pricePrecision, numPrecision)
      await logDefaultType(global.buyOnePrice, typeDefaultNum, global.sellOnePrice, typeDefaultNum)
    } else {
      res = await abcc.runDefaultExchange(buyPageExchange, sellPageExchange, math.multiply(global.nowPrice, 0.999), typeDefaultNum, math.multiply(global.nowPrice, 1.001), typeDefaultNum, pricePrecision, numPrecision)
      await logDefaultType(math.multiply(global.nowPrice, 0.999), typeDefaultNum, math.multiply(global.nowPrice, 1.001), typeDefaultNum)
    }
  }
  return res
}

async function defaultRunDefault (buyPageExchange, sellPageExchange, pageRevoke) {
  await defaultRunBoxExchange(buyPageExchange)
  await defaultRunCalc(buyPageExchange)
  for (let i = 0; i < 20; i++) {
    await defaultRunBoxExchange(buyPageExchange)
    await abcc.sleep(1000 * 3)
  }
  await defaultRunCalc(buyPageExchange)
  await defaultRunRevoke(pageRevoke)
  await abcc.sleep(1000)
  var res = await defaultRunType(buyPageExchange, sellPageExchange)
  debug('defaultRunDefault res: ' + res)
  if (res) {
    await setTimeout(async () => {
      await defaultRunDefault(buyPageExchange, sellPageExchange, pageRevoke)
    }, 1000 * 60 * (defaultEpoch - 1))
  } else {
    await setTimeout(async () => {
      await defaultRunDefault(buyPageExchange, sellPageExchange, pageRevoke)
    }, 0)
  }
}

async function defaultRunRevoke (pageRevoke) {
  let res = await false
  let candy = await 0
  do {
    candy = await candy + 1
    res = await abcc.runRevoke(pageRevoke)
  } while (!res && candy < maxRevoke)
  return res
}

async function abccjs () {
  // init puppeteer pages
  // const browser = await abcc.init()
  const browser = await abcc.muteInit()
  const pageLogin = await abcc.login(browser, username, password)
  // const pageProperty = await abcc.openProperty(browser)
  const pageRevoke = await abcc.openRevoke(browser)
  const buyPageExchange = await abcc.openExchange(browser, symbols)
  const sellPageExchange = await abcc.openExchange(browser, symbols)
  // do default
  await defaultRunDefault(buyPageExchange, sellPageExchange, pageRevoke)
}

module.exports.abccjs = abccjs
