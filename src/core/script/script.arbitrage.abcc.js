/**
 * @name SCRIPT-ARBITRAGE-ABCC-JS
 * @desc  cli tool for arbitrage trading in abcc
 */
'use strict'

const debug = require('debug')('core:abcc')
const abcc = require('../lib/lib.abcc.js')
const math = require('mathjs')
const path = require('path')
const log = require('../utils.js').log
const boxExchangeLogFile = path.resolve(process.cwd(), './logs/script.arbitrage.abcc.' + new Date().toString().replace(/\s+/g, '.') + '.boxExchange.log')
const cTable = require('console.table')

const config = require('../config.js').abcc.arbitrage
const username = process.argv.indexOf('--username') >= 0 ? process.argv[process.argv.indexOf('--username') + 1] : config.username
const password = process.argv.indexOf('--password') >= 0 ? process.argv[process.argv.indexOf('--password') + 1] : config.password

// All symbols using this
// const symbols = process.argv.indexOf('--symbols') >= 0 ? process.argv[process.argv.indexOf('--symbols') + 1].split(',') : config.symbols.split(',')

// No symbols using this
// const symbols = []

// AT using this
const symbols = new Array('at')
const symbolsBTCPricePricision = 8
const symbolsBTCNumPricision = 0
const symbolsETHPricePricision = 8
const symbolsETHNumPricision = 0
const symbolsUSDTPricePricision = 4
const symbolsUSDTNumPricision = 2

const defaultEpoch = 1 // min
const delta = 0.003
const ratio = 0.6
const maxRevoke = 5

global.ETHBTCNowPrice = 0
global.ETHBTCBuyOnePrice = 0
global.ETHBTCBuyOneMoney = 0
global.ETHBTCSellOnePrice = 0
global.ETHBTCSellOneMoney = 0
global.BTCUSDTNowPrice = 0
global.BTCUSDTBuyOnePrice = 0
global.BTCUSDTBuyOneMoney = 0
global.BTCUSDTSellOnePrice = 0
global.BTCUSDTSellOneMoney = 0
global.ETHUSDTNowPrice = 0
global.ETHUSDTBuyOnePrice = 0
global.ETHUSDTBuyOneMoney = 0
global.ETHUSDTSellOnePrice = 0
global.ETHUSDTSellOneMoney = 0
global.symbolsBTCNowPrice = []
global.symbolsBTCBuyOnePrice = []
global.symbolsBTCBuyOneMoney = []
global.symbolsBTCSellOnePrice = []
global.symbolsBTCSellOneMoney = []
global.symbolsETHNowPrice = []
global.symbolsETHBuyOnePrice = []
global.symbolsETHBuyOneMoney = []
global.symbolsETHSellOnePrice = []
global.symbolsETHSellOneMoney = []
global.symbolsUSDTNowPrice = []
global.symbolsUSDTBuyOnePrice = []
global.symbolsUSDTBuyOneMoney = []
global.symbolsUSDTSellOnePrice = []
global.symbolsUSDTSellOneMoney = []

global.ETHBTCResult = 0
global.ETHBTCResultMoney = 0
global.symbolsBTCResult = []
global.symbolsBTCResultMoney = []
global.symbolsETHResult = []
global.symbolsETHResultMoney = []

global.typeBuyPrice = 0
global.typeBuyNum = 0
global.typeSellPrice = 0
global.typeSellNum = 0

function logBoxExchange (boxExchange, symbols) {
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
  let table = symbols.toUpperCase() + ' boxExchange Table ( nowPrice: ' + boxExchange.nowPrice + ' ) \n' + cTable.getTable(tableBox)
  debug(table)
  debug('// SUCCEED //: logBoxExchange function: done')
  log(table, boxExchangeLogFile)
  log('// SUCCEED //: logBoxExchange function: done')
}

function logArbitrageCheck (symbols) {
  let table = 'Arbitrage Check Result\nsymbols\t arbitrage delta\t arbitrage route\n'
  table = table + '------\t ---------------\t ---------------\n'
  table = table + 'ETH\t ' + global.ETHBTCResult + '\t ETHBTC-BTCUSDT\n'
  for (let i = 0; i < symbols.length; i++) {
    table = table + symbols[i].toUpperCase() + '\t ' + global.symbolsBTCResult[i] + '\t ' + symbols[i].toUpperCase() + 'BTC-BTCUSDT\n'
    table = table + symbols[i].toUpperCase() + '\t ' + global.symbolsETHResult[i] + '\t ' + symbols[i].toUpperCase() + 'ETH-ETHUSDT\n'
  }
  debug(table)
  log(table, boxExchangeLogFile)
  debug('// SUCCEED //: logArbitrageCheck function: done')
  log('// SUCCEED //: logArbitrageCheck function: done')
}

function logArbitrageConfirm (symbols) {
  let table = 'Arbitrage Confirm Result\nsymbols\t arbitrage delta\t arbitrage route\n'
  table = table + '------\t ---------------\t ---------------\n'
  if (global.ETHBTCResult > 0) {
    table = table + 'ETH\t ' + global.ETHBTCResult + '\t USDT -> ETH -> BTC -> USDT\n'
  } else if (global.ETHBTCResult < 0) {
    table = table + 'ETH\t ' + global.ETHBTCResult + '\t USDT -> BTC -> ETH -> USDT\n'
  } else {
    table = table + 'ETH\t ' + global.ETHBTCResult + '\t -\n'
  }
  for (let i = 0; i < symbols.length; i++) {
    if (global.symbolsBTCResult[i] > 0) {
      table = table + symbols[i].toUpperCase() + '\t ' + global.symbolsBTCResult[i] + '\t USDT -> ' + symbols[i].toUpperCase() + ' -> BTC -> USDT\n'
    } else if (global.symbolsBTCResult[i] < 0) {
      table = table + symbols[i].toUpperCase() + '\t ' + global.symbolsBTCResult[i] + '\t USDT -> BTC -> ' + symbols[i].toUpperCase() + ' -> USDT\n'
    } else {
      table = table + symbols[i].toUpperCase() + '\t ' + global.symbolsBTCResult[i] + '\t -\n'
    }
    if (global.symbolsETHResult[i] > 0) {
      table = table + symbols[i].toUpperCase() + '\t ' + global.symbolsETHResult[i] + '\t USDT -> ' + symbols[i].toUpperCase() + ' -> ETH -> USDT\n'
    } else if (global.symbolsETHResult[i] < 0) {
      table = table + symbols[i].toUpperCase() + '\t ' + global.symbolsETHResult[i] + '\t USDT -> ETH -> ' + symbols[i].toUpperCase() + ' -> USDT\n'
    } else {
      table = table + symbols[i].toUpperCase() + '\t ' + global.symbolsETHResult[i] + '\t -\n'
    }
  }
  debug(table)
  log(table, boxExchangeLogFile)
  debug('// SUCCEED //: logArbitrageConfirm function: done')
  log('// SUCCEED //: logArbitrageConfirm function: done')
}

function logArbitrageCalc (symbols) {
  let table = 'Arbitrage Calc Result\nsymbols\t arbitrage delta\t arbitrage route\t arbitrage money\t arbitrage income\n'
  table = table + '------\t ---------------\t ---------------\t ---------------\t  ---------------\n'
  if (global.ETHBTCResult > 0) {
    table = table + 'ETH\t ' + global.ETHBTCResult + '\t USDT -> ETH -> BTC -> USDT\t ' + global.ETHBTCResultMoney + '\t ' + math.multiply(global.ETHBTCResult, global.ETHBTCResultMoney) + '\n'
  } else if (global.ETHBTCResult < 0) {
    table = table + 'ETH\t ' + global.ETHBTCResult + '\t USDT -> BTC -> ETH -> USDT\t ' + global.ETHBTCResultMoney + '\t ' + math.multiply(-1, global.ETHBTCResult, global.ETHBTCResultMoney) + '\n'
  } else {
    table = table + 'ETH\t ' + global.ETHBTCResult + '\t -\n'
  }
  for (let i = 0; i < symbols.length; i++) {
    if (global.symbolsBTCResult[i] > 0) {
      table = table + symbols[i].toUpperCase() + '\t ' + global.symbolsBTCResult[i] + '\t USDT -> ' + symbols[i].toUpperCase() + ' -> BTC -> USDT\t ' + global.symbolsBTCResultMoney[i] + '\t ' + math.multiply(global.symbolsBTCResult[i], global.symbolsBTCResultMoney[i]) + '\n'
    } else if (global.symbolsBTCResult[i] < 0) {
      table = table + symbols[i].toUpperCase() + '\t ' + global.symbolsBTCResult[i] + '\t USDT -> BTC -> ' + symbols[i].toUpperCase() + ' -> USDT\t ' + global.symbolsBTCResultMoney[i] + '\t ' + math.multiply(-1, global.symbolsBTCResult[i], global.symbolsBTCResultMoney[i]) + '\n'
    } else {
      table = table + symbols[i].toUpperCase() + '\t ' + global.symbolsBTCResult[i] + '\t -\n'
    }
    if (global.symbolsETHResult[i] > 0) {
      table = table + symbols[i].toUpperCase() + '\t ' + global.symbolsETHResult[i] + '\t USDT -> ' + symbols[i].toUpperCase() + ' -> ETH -> USDT\t ' + global.symbolsETHResultMoney[i] + '\t ' + math.multiply(global.symbolsETHResult[i], global.symbolsETHResultMoney[i]) + '\n'
    } else if (global.symbolsETHResult[i] < 0) {
      table = table + symbols[i].toUpperCase() + '\t ' + global.symbolsETHResult[i] + '\t USDT -> ETH -> ' + symbols[i].toUpperCase() + ' -> USDT\t ' + global.symbolsETHResultMoney[i] + '\t ' + math.multiply(-1, global.symbolsETHResult[i], global.symbolsETHResultMoney[i]) + '\n'
    } else {
      table = table + symbols[i].toUpperCase() + '\t ' + global.symbolsETHResult[i] + '\t -\n'
    }
  }
  debug(table)
  log(table, boxExchangeLogFile)
  debug('// SUCCEED //: logArbitrageCalc function: done')
  log('// SUCCEED //: logArbitrageCalc function: done')
}

async function arbitrageRunBoxExchange (pageExchangeETHBTC, pageExchangesBTCUSDT, pageExchangesETHUSDT, pageExchangesSymbolsBTC, pageExchangesSymbolsETH, pageExchangesSymbolsUSDT, symbols) {
  let boxExchange = []
  // symbols ethbtc
  boxExchange = await abcc.getBoxExchange(pageExchangeETHBTC)
  global.ETHBTCNowPrice = await boxExchange.nowPrice
  global.ETHBTCBuyOnePrice = await boxExchange.buyBox.buyPrice[0]
  global.ETHBTCBuyOneMoney = await boxExchange.buyBox.buyMoney[0]
  global.ETHBTCSellOnePrice = await boxExchange.sellBox.sellPrice[0]
  global.ETHBTCSellOneMoney = await boxExchange.sellBox.sellMoney[0]
  await logBoxExchange(boxExchange, 'ethbtc')
  // symbols btcusdt
  boxExchange = await abcc.getBoxExchange(pageExchangesBTCUSDT)
  global.BTCUSDTNowPrice = await boxExchange.nowPrice
  global.BTCUSDTBuyOnePrice = await boxExchange.buyBox.buyPrice[0]
  global.BTCUSDTBuyOneMoney = await boxExchange.buyBox.buyMoney[0]
  global.BTCUSDTSellOnePrice = await boxExchange.sellBox.sellPrice[0]
  global.BTCUSDTSellOneMoney = await boxExchange.sellBox.sellMoney[0]
  await logBoxExchange(boxExchange, 'btcusdt')
  // symbols ethusdt
  boxExchange = await abcc.getBoxExchange(pageExchangesETHUSDT)
  global.ETHUSDTNowPrice = await boxExchange.nowPrice
  global.ETHUSDTBuyOnePrice = await boxExchange.buyBox.buyPrice[0]
  global.ETHUSDTBuyOneMoney = await boxExchange.buyBox.buyMoney[0]
  global.ETHUSDTSellOnePrice = await boxExchange.sellBox.sellPrice[0]
  global.ETHUSDTSellOneMoney = await boxExchange.sellBox.sellMoney[0]
  await logBoxExchange(boxExchange, 'ethusdt')
  // symbols others
  for (let i = 0; i < symbols.length; i++) {
    boxExchange = await abcc.getBoxExchange(pageExchangesSymbolsBTC[i])
    global.symbolsBTCNowPrice[i] = await boxExchange.nowPrice
    global.symbolsBTCBuyOnePrice[i] = await boxExchange.buyBox.buyPrice[0]
    global.symbolsBTCBuyOneMoney[i] = await boxExchange.buyBox.buyMoney[0]
    global.symbolsBTCSellOnePrice[i] = await boxExchange.sellBox.sellPrice[0]
    global.symbolsBTCSellOneMoney[i] = await boxExchange.sellBox.sellMoney[0]
    await logBoxExchange(boxExchange, symbols[i] + 'btc')
    boxExchange = await abcc.getBoxExchange(pageExchangesSymbolsETH[i])
    global.symbolsETHNowPrice[i] = await boxExchange.nowPrice
    global.symbolsETHBuyOnePrice[i] = await boxExchange.buyBox.buyPrice[0]
    global.symbolsETHBuyOneMoney[i] = await boxExchange.buyBox.buyMoney[0]
    global.symbolsETHSellOnePrice[i] = await boxExchange.sellBox.sellPrice[0]
    global.symbolsETHSellOneMoney[i] = await boxExchange.sellBox.sellMoney[0]
    await logBoxExchange(boxExchange, symbols[i] + 'eth')
    boxExchange = await abcc.getBoxExchange(pageExchangesSymbolsUSDT[i])
    global.symbolsUSDTNowPrice[i] = await boxExchange.nowPrice
    global.symbolsUSDTBuyOnePrice[i] = await boxExchange.buyBox.buyPrice[0]
    global.symbolsUSDTBuyOneMoney[i] = await boxExchange.buyBox.buyMoney[0]
    global.symbolsUSDTSellOnePrice[i] = await boxExchange.sellBox.sellPrice[0]
    global.symbolsUSDTSellOneMoney[i] = await boxExchange.sellBox.sellMoney[0]
    await logBoxExchange(boxExchange, symbols[i] + 'usdt')
  }
}

async function arbitrageRunCheck (symbols, delta) {
  // check btc eth
  let ETHBTCDelta = await 0
  global.ETHBTCResult = await 0
  ETHBTCDelta = await math.divide(math.subtract(math.multiply(global.ETHBTCNowPrice, global.BTCUSDTNowPrice), global.ETHUSDTNowPrice), math.min(math.multiply(global.ETHBTCNowPrice, global.BTCUSDTNowPrice), global.ETHUSDTNowPrice))
  global.ETHBTCResult = await math.abs(ETHBTCDelta) > delta ? ETHBTCDelta : 0
  for (let i = 0; i < symbols.length; i++) {
    // check btc: x/btc * btc/usdt
    let symbolsDelta = await 0
    global.symbolsBTCResult[i] = await 0
    symbolsDelta = await math.divide(math.subtract(math.multiply(global.symbolsBTCNowPrice[i], global.BTCUSDTNowPrice), global.symbolsUSDTNowPrice[i]), math.min(math.multiply(global.symbolsBTCNowPrice[i], global.BTCUSDTNowPrice), global.symbolsUSDTNowPrice[i]))
    global.symbolsBTCResult[i] = await math.abs(symbolsDelta) > delta ? symbolsDelta : 0
    // check eth : x/eth * eth/usdt
    symbolsDelta = await 0
    global.symbolsETHResult[i] = await 0
    symbolsDelta = await math.divide(math.subtract(math.multiply(global.symbolsETHNowPrice[i], global.ETHUSDTNowPrice), global.symbolsUSDTNowPrice[i]), math.min(math.multiply(global.symbolsETHNowPrice[i], global.ETHUSDTNowPrice), global.symbolsUSDTNowPrice[i]))
    global.symbolsETHResult[i] = await math.abs(symbolsDelta) > delta ? symbolsDelta : 0
  }
  await logArbitrageCheck(symbols)
}

async function arbitrageRunConfirm (symbols, delta) {
  // confirm btc eth
  let ETHBTCDelta = await 0
  if (global.ETHBTCResult > 0) {
    // usdt -> eth -> btc -> usdt
    ETHBTCDelta = await math.divide(math.subtract(math.multiply(global.ETHBTCBuyOnePrice, global.BTCUSDTBuyOnePrice), global.ETHUSDTSellOnePrice), global.ETHUSDTSellOnePrice)
    global.ETHBTCResult = await ETHBTCDelta > delta ? ETHBTCDelta : 0
  } else if (global.ETHBTCResult < 0) {
    // usdt -> btc -> eth -> usdt
    ETHBTCDelta = await math.divide(math.subtract(math.multiply(global.ETHBTCSellOnePrice, global.BTCUSDTSellOnePrice), global.ETHUSDTBuyOnePrice), math.multiply(global.ETHBTCSellOnePrice, global.BTCUSDTSellOnePrice))
    global.ETHBTCResult = await math.subtract(0, ETHBTCDelta) > delta ? ETHBTCDelta : 0
  }
  // confirm symbols
  for (let i = 0; i < symbols.length; i++) {
    // confirm btc: x/btc * btc/usdt
    let symbolsDelta = await 0
    if (global.symbolsBTCResult[i] > 0) {
      // usdt -> x -> btc -> usdt
      symbolsDelta = await math.divide(math.subtract(math.multiply(global.symbolsBTCBuyOnePrice[i], global.BTCUSDTBuyOnePrice), global.symbolsUSDTSellOnePrice[i]), global.symbolsUSDTSellOnePrice[i])
      global.symbolsBTCResult[i] = await symbolsDelta > delta ? symbolsDelta : 0
    } else if (global.symbolsBTCResult[i] < 0) {
      // usdt -> btc -> x -> usdt
      symbolsDelta = await math.divide(math.subtract(math.multiply(global.symbolsBTCSellOnePrice[i], global.BTCUSDTSellOnePrice), global.symbolsUSDTBuyOnePrice[i]), math.multiply(global.symbolsBTCSellOnePrice[i], global.BTCUSDTSellOnePrice))
      global.symbolsBTCResult[i] = await math.subtract(0, symbolsDelta) > delta ? symbolsDelta : 0
    }
    // confirm eth : x/eth * eth/usdt
    symbolsDelta = await 0
    if (global.symbolsETHResult[i] > 0) {
      // usdt -> x -> eth -> usdt
      symbolsDelta = await math.divide(math.subtract(math.multiply(global.symbolsETHBuyOnePrice[i], global.ETHUSDTBuyOnePrice), global.symbolsUSDTSellOnePrice[i]), global.symbolsUSDTSellOnePrice[i])
      global.symbolsETHResult[i] = await symbolsDelta > delta ? symbolsDelta : 0
    } else if (global.symbolsETHResult[i] < 0) {
      // usdt -> eth -> x -> usdt
      symbolsDelta = await math.divide(math.subtract(math.multiply(global.symbolsETHSellOnePrice[i], global.ETHUSDTSellOnePrice), global.symbolsUSDTBuyOnePrice[i]), math.multiply(global.symbolsETHSellOnePrice[i], global.ETHUSDTSellOnePrice))
      global.symbolsETHResult[i] = await math.subtract(0, symbolsDelta) > delta ? symbolsDelta : 0
    }
  }
  await logArbitrageConfirm(symbols)
}

async function arbitrageRunCalc (symbols, ratio) {
  // type btc eth
  if (global.ETHBTCResult > 0) {
    // usdt -> eth -> btc -> usdt
    global.ETHBTCResultMoney = await math.multiply(math.min(math.multiply(global.ETHBTCBuyOneMoney, global.BTCUSDTNowPrice), global.BTCUSDTBuyOneMoney, global.ETHUSDTSellOneMoney), ratio)
  } else if (global.ETHBTCResult < 0) {
    // usdt -> btc -> eth -> usdt
    global.ETHBTCResultMoney = await math.multiply(math.min(math.multiply(global.ETHBTCSellOneMoney, global.BTCUSDTNowPrice), global.BTCUSDTSellOneMoney, global.ETHUSDTBuyOneMoney), ratio)
  }
  // confirm symbols
  for (let i = 0; i < symbols.length; i++) {
    // confirm btc: x/btc * btc/usdt
    if (global.symbolsBTCResult[i] > 0) {
      // usdt -> x -> btc -> usdt
      global.symbolsBTCResultMoney[i] = await math.multiply(math.min(math.multiply(global.symbolsBTCBuyOneMoney[i], global.BTCUSDTNowPrice), global.BTCUSDTBuyOneMoney, global.symbolsUSDTSellOneMoney[i]), ratio)
    } else if (global.symbolsBTCResult[i] < 0) {
      // usdt -> btc -> x -> usdt
      global.symbolsBTCResultMoney[i] = await math.multiply(math.min(math.multiply(global.symbolsBTCSellOneMoney[i], global.BTCUSDTNowPrice), global.BTCUSDTSellOneMoney, global.symbolsUSDTBuyOneMoney[i]), ratio)
    }
    // confirm eth : x/eth * eth/usdt
    if (global.symbolsETHResult[i] > 0) {
      // usdt -> x -> eth -> usdt
      global.symbolsETHResultMoney[i] = await math.multiply(math.min(math.multiply(global.symbolsETHBuyOneMoney[i], global.ETHUSDTNowPrice), global.ETHUSDTBuyOneMoney, global.symbolsUSDTSellOneMoney[i]), ratio)
    } else if (global.symbolsETHResult[i] < 0) {
      // usdt -> eth -> x -> usdt
      global.symbolsETHResultMoney[i] = await math.multiply(math.min(math.multiply(global.symbolsETHSellOneMoney[i], global.ETHUSDTNowPrice), global.ETHUSDTSellOneMoney, global.symbolsUSDTBuyOneMoney[i]), ratio)
    }
  }
  await logArbitrageCalc(symbols)
}

async function arbitrageRunFastType (pageExchangeETHBTC, pageExchangesBTCUSDT, pageExchangesETHUSDT, pageExchangesSymbolsBTC, pageExchangesSymbolsETH, pageExchangesSymbolsUSDT, symbols) {
  await debug('arbitrageRunFastType is called')
  var res = false
  // type btc eth
  if (global.ETHBTCResult > 0) {
    // usdt -> eth -> btc -> usdt
    await debug('global.ETHBTCResult > 0 is called')
    res = await abcc.runFastSellArbitrageExchange(pageExchangeETHBTC, pageExchangesBTCUSDT, pageExchangesETHUSDT, global.ETHBTCSellOnePrice, math.divide(global.ETHBTCResultMoney, global.ETHBTCSellOnePrice), 6, 2, global.BTCUSDTSellOnePrice, math.divide(global.ETHBTCResultMoney, global.BTCUSDTSellOnePrice), 2, 6, global.ETHUSDTBuyOnePrice, math.divide(global.ETHBTCResultMoney, global.ETHUSDTBuyOnePrice), 2, 6)
  } else if (global.ETHBTCResult < 0) {
    await debug('global.ETHBTCResult < 0 is called')
    // usdt -> btc -> eth -> usdt
    res = await abcc.runFastBuyArbitrageExchange(pageExchangeETHBTC, pageExchangesBTCUSDT, pageExchangesETHUSDT, global.ETHBTCBuyOnePrice, math.divide(global.ETHBTCResultMoney, global.ETHBTCBuyOnePrice), 6, 2, global.BTCUSDTBuyOnePrice, math.divide(global.ETHBTCResultMoney, global.BTCUSDTBuyOnePrice), 2, 6, global.ETHUSDTSellOnePrice, math.divide(global.ETHBTCResultMoney, global.ETHUSDTSellOnePrice), 2, 6)
  }
  // type symbols
  for (let i = 0; i < symbols.length; i++) {
    await debug('symbols: ' + symbols[i].toUpperCase() + '  is called')
    // type btc: x/btc * btc/usdt
    if (global.symbolsBTCResult[i] > 0) {
      // usdt -> x -> btc -> usdt
      await debug('global.symbolsBTCResult[i] > 0 in symbols: ' + symbols[i].toUpperCase() + '  is called')
      res = await abcc.runFastSellArbitrageExchange(pageExchangesSymbolsBTC[i], pageExchangesBTCUSDT, pageExchangesSymbolsUSDT[i], global.symbolsBTCSellOnePrice[i], math.divide(global.symbolsBTCResultMoney[i], global.symbolsBTCSellOnePrice[i]), symbolsBTCPricePricision, symbolsBTCNumPricision, global.BTCUSDTSellOnePrice, math.divide(global.symbolsBTCResultMoney[i], global.BTCUSDTSellOnePrice), 2, 6, global.symbolsUSDTBuyOnePrice[i], math.divide(global.symbolsBTCResultMoney[i], global.symbolsUSDTBuyOnePrice[i]), symbolsUSDTPricePricision, symbolsUSDTNumPricision)
    } else if (global.symbolsBTCResult[i] < 0) {
      await debug('global.symbolsBTCResult[i] < 0 in symbols: ' + symbols[i].toUpperCase() + '  is called')
      // usdt -> btc -> x -> usdt
      res = await abcc.runFastBuyArbitrageExchange(pageExchangesSymbolsBTC[i], pageExchangesBTCUSDT, pageExchangesSymbolsUSDT[i], global.symbolsBTCBuyOnePrice[i], math.divide(global.symbolsBTCResultMoney[i], global.symbolsBTCBuyOnePrice[i]), symbolsBTCPricePricision, symbolsBTCNumPricision, global.BTCUSDTBuyOnePrice, math.divide(global.symbolsBTCResultMoney[i], global.BTCUSDTBuOnePrice), 2, 6, global.symbolsUSDTSellOnePrice[i], math.divide(global.symbolsBTCResultMoney[i], global.symbolsUSDTSellOnePrice[i]), symbolsUSDTPricePricision, symbolsUSDTNumPricision)
    }
    // type eth : x/eth * eth/usdt
    if (global.symbolsETHResult[i] > 0) {
      await debug('global.symbolsETHResult[i] > 0 in symbols: ' + symbols[i].toUpperCase() + '  is called')
      // usdt -> x -> eth -> usdt
      res = await abcc.runFastSellArbitrageExchange(pageExchangesSymbolsETH[i], pageExchangesETHUSDT, pageExchangesSymbolsUSDT[i], global.symbolsETHSellOnePrice[i], math.divide(global.symbolsETHResultMoney[i], global.symbolsETHSellOnePrice[i]), symbolsETHPricePricision, symbolsETHNumPricision, global.ETHUSDTSellOnePrice, math.divide(global.symbolsETHResultMoney[i], global.ETHUSDTSellOnePrice), 2, 6, global.symbolsUSDTBuyOnePrice[i], math.divide(global.symbolsETHResultMoney[i], global.symbolsUSDTBuyOnePrice[i]), symbolsUSDTPricePricision, symbolsUSDTNumPricision)
    } else if (global.symbolsETHResult[i] < 0) {
      await debug('global.symbolsETHResult[i] < 0 in symbols: ' + symbols[i].toUpperCase() + '  is called')
      // usdt -> eth -> x -> usdt
      res = await abcc.runFastBuyArbitrageExchange(pageExchangesSymbolsETH[i], pageExchangesETHUSDT, pageExchangesSymbolsUSDT[i], global.symbolsETHBuyOnePrice[i], math.divide(global.symbolsETHResultMoney[i], global.symbolsETHBuyOnePrice[i]), symbolsETHPricePricision, symbolsETHNumPricision, global.ETHUSDTBuyOnePrice, math.divide(global.symbolsETHResultMoney[i], global.ETHUSDTBuyOnePrice), 2, 6, global.symbolsUSDTSellOnePrice[i], math.divide(global.symbolsETHResultMoney[i], global.symbolsUSDTSellOnePrice[i]), symbolsUSDTPricePricision, symbolsUSDTNumPricision)
    }
  }
  return res
}

async function arbitrageRunType (pageExchangeETHBTC, pageExchangesBTCUSDT, pageExchangesETHUSDT, pageExchangesSymbolsBTC, pageExchangesSymbolsETH, pageExchangesSymbolsUSDT, symbols) {
  // to be continue
}

async function arbitrageRunArbitrage (pageExchangeETHBTC, pageExchangesBTCUSDT, pageExchangesETHUSDT, pageExchangesSymbolsBTC, pageExchangesSymbolsETH, pageExchangesSymbolsUSDT, pageRevoke, symbols, delta, ratio) {
  await arbitrageRunBoxExchange(pageExchangeETHBTC, pageExchangesBTCUSDT, pageExchangesETHUSDT, pageExchangesSymbolsBTC, pageExchangesSymbolsETH, pageExchangesSymbolsUSDT, symbols)
  await arbitrageRunCheck(symbols, delta)
  await arbitrageRunConfirm(symbols, delta)
  await arbitrageRunCalc(symbols, ratio)
  let res = false
  // var res = await arbitrageRunFastType(pageExchangeETHBTC, pageExchangesBTCUSDT, pageExchangesETHUSDT, pageExchangesSymbolsBTC, pageExchangesSymbolsETH, pageExchangesSymbolsUSDT, symbols)
  if (res) {
    await setTimeout(async () => {
      await arbitrageRunRevoke(pageRevoke)
      await abcc.sleep(1000)
      await arbitrageRunArbitrage(pageExchangeETHBTC, pageExchangesBTCUSDT, pageExchangesETHUSDT, pageExchangesSymbolsBTC, pageExchangesSymbolsETH, pageExchangesSymbolsUSDT, symbols, delta, ratio)
    }, 1000 * 60 * defaultEpoch)
  } else {
    await setTimeout(() => {
      arbitrageRunArbitrage(pageExchangeETHBTC, pageExchangesBTCUSDT, pageExchangesETHUSDT, pageExchangesSymbolsBTC, pageExchangesSymbolsETH, pageExchangesSymbolsUSDT, pageRevoke, symbols, delta, ratio)
    }, 1000 * 5)
  }
}

async function arbitrageRunRevoke (pageRevoke) {
  let res = await false
  let candy = await 0
  do {
    candy = await candy + 1
    res = await abcc.runRevoke(pageRevoke)
  } while (!res && candy < maxRevoke)
}

async function abccjs () {
  // init puppeteer pages
  const browser = await abcc.init()
  // const browser = await abcc.muteInit()
  const pageLogin = await abcc.login(browser, username, password)
  // const pageProperty = await abcc.openProperty(browser)
  const pageRevoke = await abcc.openRevoke(browser)
  const pageExchangeETHBTC = await abcc.openExchange(browser, 'ethbtc')
  const pageExchangesBTCUSDT = await abcc.openExchange(browser, 'btcusdt')
  const pageExchangesETHUSDT = await abcc.openExchange(browser, 'ethusdt')
  const pageExchangesSymbolsBTC = []
  const pageExchangesSymbolsETH = []
  const pageExchangesSymbolsUSDT = []
  for (let i = 0; i < symbols.length; i++) {
    pageExchangesSymbolsBTC[i] = await abcc.openExchange(browser, symbols[i] + 'btc')
    pageExchangesSymbolsETH[i] = await abcc.openExchange(browser, symbols[i] + 'eth')
    pageExchangesSymbolsUSDT[i] = await abcc.openExchange(browser, symbols[i] + 'usdt')
  }
  // do arbitrage
  await arbitrageRunArbitrage(pageExchangeETHBTC, pageExchangesBTCUSDT, pageExchangesETHUSDT, pageExchangesSymbolsBTC, pageExchangesSymbolsETH, pageExchangesSymbolsUSDT, pageRevoke, symbols, delta, ratio)
}

module.exports.abccjs = abccjs
