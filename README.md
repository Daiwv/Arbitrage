# Arbitrage
## ( Crypto Currency Arbitrage Trading )

![npm](https://img.shields.io/badge/Project-Arbitrage-blue.svg?style=plastic)
![npm](https://img.shields.io/badge/Status-Devloping-blue.svg?style=plastic)
![npm](https://img.shields.io/badge/Made%20by-paulplayer-blue.svg?style=plastic)

![Nodejs](https://img.shields.io/badge/Node.js-%3E%3D8.11.0-orange.svg?style=plastic)
![npm](https://img.shields.io/badge/npm-%3E%3D6.0.0-orange.svg?style=plastic)

> paulplayer implemetation of Crypto Currency Arbitrage Trading
[Arbitrage](https://github.com/paulplayer/Arbitrage) specification

> 维护者:
[Paul Zhang](https://github.com/paulplayer)

## 目录
<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Arbitrage](#arbitrage)
	- [( Crypto Currency Arbitrage Trading )](#-crypto-currency-arbitrage-trading-)
	- [目录](#目录)
	- [1. 安装](#1-安装)
		- [1.1 In Node.js through npm](#11-in-nodejs-through-npm)
		- [1.2 Browser: Browserify, Webpack, other bundlers](#12-browser-browserify-webpack-other-bundlers)
		- [1.3 In the Browser through `<script>` tag](#13-in-the-browser-through-script-tag)
	- [2. 使用](#2-使用)
		- [2.1 CLI Example](#21-cli-example)
			- [step 1. edit config.json](#step-1-edit-configjson)
			- [step 2. run npm start](#step-2-run-npm-start)
			- [Step 3. Choose one from list](#step-3-choose-one-from-list)
			- [Step 4. Check the logs](#step-4-check-the-logs)
		- [2.2 UI Example](#22-ui-example)
	- [3. Contribute](#3-contribute)
	- [4. 致谢](#4-致谢)
	- [5. 资助我们](#5-资助我们)
	- [6. License](#6-license)

<!-- /TOC -->


## 1. 安装

### 1.1 In Node.js through npm

```bash
> git clone https://github.com/paulplayer/Arbitrage.git
> cd Arbitrage
> npm install
```

### 1.2 Browser: Browserify, Webpack, other bundlers

(to be continue)

The code published to npm that gets loaded on require is in fact an ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust asset management process.

```js
const Arbitrage = require('Arbitrage')
```


### 1.3 In the Browser through `<script>` tag

(to be continue)

Loading this module through a script tag will make the ```Arbitrage``` obj available in the global namespace.

```html
<script src="https://unpkg.com/Arbitrage/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/Arbitrage/dist/index.js"></script>
```

## 2. 使用

### 2.1 CLI Example

#### step 1. edit config.json

Write your account info in the username="" and password)="" in config.json file, it will auto login for you.

#### step 2. run npm start

```JavaScript
> $ npm start
```

Console Output :
```JavaScript
> Arbitrage@0.0.0 start ./Arbitrage
> node ./src/cli/index.js

Welcome to Arbitrage, select your function:

[1] See Help Info
[2] Running ABCC Default Trading
[3] Running ABCC Arbitrage Trading
[4] To be continue
[0] CANCEL

Choose one from list [1...4 / 0]:
```

#### Step 3. Choose one from list

> ABCC Default Trading is a frequency trading strategy in one day, it create pair tradings at mostly the same time tring to buy low, sell high. Usually profitable especially in the exchange like abcc, which support trading as mining.

> ABCC Arbitrage Trading is a frequency arbitrage strategy using trangle arbitrage algorithm. Usually trading (sell or buy) as the route 'usdt --> x --> y ---> usdt'

you can change using puppeteer in headless mode or not by typing '//' before the code in 'src/core/script' folder. Both mode have a log in ./logs folder, you can see how your script running, and the ice table of the price in abcc.

```JavaScript
const browser = await abcc.init() // normal mode
const browser = await abcc.muteInit() // headless mode
```

#### Step 4. Check the logs

abcc default/arbitrage trading logs can be check both in normal abcc.com website and log file, warnings and errors are recording in log file. For example:

```JavaScript
2018 M08 21 21:44:12 :
// SUCCEED //: muteInit function: done, browser obj has been returned after puppeteer launched (options:{"headless":true,"slowMo":5,"args":["--start-maximized","--disable-infobars"]})
2018 M08 21 21:44:43 :
// WARNING //: Login function: undone, login page load timeout
```

the ice-table price of abcc.com in log:

```JavaScript
2018 M08 03 18:44:08 :
ETHBTC boxExchange Table ( nowPrice: 0.055889 )
buyMoney    buyNum  buyPrice  sellPrice  sellNum  sellMoney
----------  ------  --------  ---------  -------  ----------
0.1229558   2.2     0.055889  0.05589    0.84     0.0469476
0.0111764   0.2     0.055882  0.055892   0.22     0.01229624
1.621296    29.16   0.0556    0.055996   0.08     0.00447968
0.0432978   0.78    0.05551   0.05608    0.06     0.0033648
0.00885584  0.16    0.055349  0.056094   0.21     0.01177974
0.00332088  0.06    0.055348  0.0568     1.34     0.076112
0.00885552  0.16    0.055347  0.056805   0.13     0.00738465
0.11822858  2.14    0.055247  0.056812   0.16     0.00908992
0.00386029  0.07    0.055147  0.056832   0.02     0.00113664
0.19597444  3.56    0.055049  0.056844   0.14     0.00795816

2018 M08 03 18:44:08 :
BTCUSDT boxExchange Table ( nowPrice: 7292.54 )
buyMoney        buyNum    buyPrice  sellPrice  sellNum   sellMoney
--------------  --------  --------  ---------  --------  -------------
22.94175609     0.003149  7285.41   7299.68    0.20345   1485.119896
56.38112128     0.007744  7280.62   7299.75    0.001421  10.37294475
36.40305        0.005     7280.61   7300       8.965087  65445.1351
137.05411722    0.018874  7261.53   7300.7     0.009336  68.1593352
124.5005352     0.017146  7261.2    7350       0.00451   33.1485
372.7294268     0.05134   7260.02   7370       0.01082   79.7434
1.11078         0.000153  7260      7381.46    1.087464  8027.07201744
10455.55257313  1.462313  7150.01   7381.55    0.060738  448.3405839
2145            0.3       7150      7387       0.023417  172.981379
1335.10078926   0.187973  7102.62   7396       0.0046    34.0216
```

the arbitrage route and income profits are recorded in log:

```JavaScript
2018 M08 03 18:55:56 :
Arbitrage Check Result
symbols	 arbitrage delta	 arbitrage route
------	 ---------------	 ---------------
ETH	 0	 ETHBTC-BTCUSDT
AT	 0.02088751629213491	 ATBTC-BTCUSDT
AT	 0	 ATETH-ETHUSDT
LTC	 0.006640652173913114	 LTCBTC-BTCUSDT
LTC	 0.02599741440217414	 LTCETH-ETHUSDT
QTUM	 0	 QTUMBTC-BTCUSDT
QTUM	 0.0036344799357946513	 QTUMETH-ETHUSDT
BCH	 0	 BCHBTC-BTCUSDT
BCH	 -0.07480863759751527	 BCHETH-ETHUSDT
EOS	 -0.006830499728439865	 EOSBTC-BTCUSDT
EOS	 0	 EOSETH-ETHUSDT
XRP	 -0.00527283537028466	 XRPBTC-BTCUSDT
XRP	 0.004710201738334992	 XRPETH-ETHUSDT
DASH	 -0.007258388121128217	 DASHBTC-BTCUSDT
DASH	 0	 DASHETH-ETHUSDT
ETC	 -0.005833711367011198	 ETCBTC-BTCUSDT
ETC	 0.003949323513706626	 ETCETH-ETHUSDT
YEE	 -0.008329609235976695	 YEEBTC-BTCUSDT
YEE	 0.009288018399999931	 YEEETH-ETHUSDT
ZRX	 0.023770804798255017	 ZRXBTC-BTCUSDT
ZRX	 0.02904408811341327	 ZRXETH-ETHUSDT
OMG	 0.004764961832061005	 OMGBTC-BTCUSDT
OMG	 0.006745784351144961	 OMGETH-ETHUSDT
TTU	 0.19684999999999997	 TTUBTC-BTCUSDT
TTU	 -2.692868205298796	 TTUETH-ETHUSDT
ICX	 -0.004615985374899401	 ICXBTC-BTCUSDT
ICX	 0	 ICXETH-ETHUSDT
ADA	 0	 ADABTC-BTCUSDT
ADA	 0.005262328628246019	 ADAETH-ETHUSDT

2018 M08 03 18:55:56 :
Arbitrage Confirm Result
symbols	 arbitrage delta	 arbitrage route
------	 ---------------	 ---------------
ETH	 0	 -
AT	 0	 -
AT	 0	 -
LTC	 0	 -
LTC	 0.017922428765264516	 USDT -> LTC -> ETH -> USDT
QTUM	 0	 -
QTUM	 0	 -
BCH	 0	 -
BCH	 0	 -
EOS	 0	 -
EOS	 0	 -
XRP	 -0.005022442882158511	 USDT -> BTC -> XRP -> USDT
XRP	 0	 -
DASH	 -0.0033061031955359263	 USDT -> BTC -> DASH -> USDT
DASH	 0	 -
ETC	 0	 -
ETC	 0	 -
YEE	 0	 -
YEE	 0	 -
ZRX	 0	 -
ZRX	 0	 -
OMG	 0	 -
OMG	 0	 -
TTU	 0	 -
TTU	 0	 -
ICX	 0	 -
ICX	 0	 -
ADA	 0	 -
ADA	 0	 -

2018 M08 03 18:55:56 :
Arbitrage Calc Result
symbols	 arbitrage delta	 arbitrage route	 arbitrage money	 arbitrage income
------	 ---------------	 ---------------	 ---------------	  ---------------
ETH	 0	 -
AT	 0	 -
AT	 0	 -
LTC	 0	 -
LTC	 0.017922428765264516	 USDT -> LTC -> ETH -> USDT	 4.0699824352250005	 0.07294397027119787
QTUM	 0	 -
QTUM	 0	 -
BCH	 0	 -
BCH	 0	 -
EOS	 0	 -
EOS	 0	 -
XRP	 -0.005022442882158511	 USDT -> BTC -> XRP -> USDT	 1.57394803	 0.00790506408016091
XRP	 0	 -
DASH	 -0.0033061031955359263	 USDT -> BTC -> DASH -> USDT	 1.57394803	 0.005203634611590476
DASH	 0	 -
ETC	 0	 -
ETC	 0	 -
YEE	 0	 -
YEE	 0	 -
ZRX	 0	 -
ZRX	 0	 -
OMG	 0	 -
OMG	 0	 -
TTU	 0	 -
TTU	 0	 -
ICX	 0	 -
ICX	 0	 -
ADA	 0	 -
ADA	 0	 -
```

### 2.2 UI Example

```JavaScript
(To be continue)
```

## 3. Contribute

Contributions welcome. Please check out [the issues](https://github.com/paulplayer/Arbitrage/issues).

## 4. 致谢

@puppeteer
[puppeteer](https://github.com/GoogleChrome/puppeteer)

@mathjs
[mathjs](https://github.com/josdejong/mathjs)


## 5. 资助我们

Cryptocurrency is welcomed.

[ETH](#): 0x007060e235b6B5954B41F72c4e2c24976F601FBa

## 6. License

[MIT](LICENSE) © 2016 Protocol Labs Inc.
