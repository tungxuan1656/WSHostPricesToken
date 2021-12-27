# WSHostPricesToken
prices.js
Listen: localhost:5031  
Output Sample:  
``` javascript
{
    "Title": "50783.6 1807.61",
    "Favourite": {
        "BINANCE_BTCUSDT": "50783.62",
        "OANDA_XAUUSD": "1807.615"
    },
    "All": {
        "BINANCE_BNBUSDT": "546.7",
        "BINANCE_BTCUSDT": "50783.62",
        "BINANCE_C98USDT": "2.816",
        "BINANCE_ICPUSDT": "26.9",
        "BINANCE_LINKUSDT": "23.39",
        "BINANCE_MATICUSDT": "2.831",
        "BINANCE_TLMUSDT": "0.2582",
        "OANDA_XAUUSD": "1807.615",
        "PANCAKE_GST": "0.61449471",
        "PANCAKE_MYRA": "1.28598302",
        "PANCAKE_RACA": "0.00347628",
        "PANCAKE_TRY": "0.12623855",
        "PANCAKE_WANA": "0.37734441"
    }
}
```

# TradingView API
Get realtime market prices and indicator values from Tradingview !

## Features
- [x] Automatically backtest many strategies and try many settings in a very little time
- [x] Get drawings you made on your chart
- [x] Works with invite-only indicators
- [x] Unlimited simultaneous indicators
- [x] Realtime
- [x] Get TradingView's technical analysis
- [ ] Get values from a specific date range
- [ ] TradingView socket server emulation
- [ ] Interract with public chats
- [ ] Get Screener top values
- [ ] Get Hotlists
- [ ] Get Calendar
- IF YOU WANT A FEATURE, ASK ME !!

## Possibilities
- Trading bot
- Discord alerts
- Hard backtest
- Machine Learning based indicator
- Free replay mode for all timeframes

___
## Installation

```
npm i @mathieuc/tradingview
```

## Examples (./tests/)

```javascript
/*
  ./tests/prices.js
  Search for Bitcoin and Ethereum and get real time prices
*/

const marketAPI = require('tradingview');

(async () => {
  const market = marketAPI();

  market.on('logged', async () => {
    console.log('API LOGGED');

    const searchBTC = (await market.search('bitcoin euro', 'crypto'))[0];
    console.log('Found Bitcoin / Euro:', searchBTC);
    market.subscribe(searchBTC.id);
  });

  market.on('price', (data) => {
    console.log(data.symbol, '=>', data.price);
  });

  const searchETH = (await market.search('ethereum euro', 'crypto'))[0];
  console.log('Found Ethereum / Euro:', searchETH);

  setTimeout(() => {
    console.log('Subscribe to', searchETH.id);
    market.subscribe(searchETH.id);
  }, 10000);

  setTimeout(() => {
    console.log('Unsubscribe from', searchETH.id);
    market.unsubscribe(searchETH.id);
  }, 20000);
})();
```

```javascript
/*
  ./tests/analysis.js
  Search for Bitcoin and get the Technical Analysis in all timeframes
*/

const marketAPI = require('tradingview');

(async () => {
  const market = marketAPI(false);

  const searchBTC = (await market.search('bitcoin euro', 'crypto'))[0];
  console.log('Found Bitcoin / Euro:', searchBTC);

  const TA = await searchBTC.getTA();
  console.log('Full technical analysis for Bitcoin:', TA);

  // You can also use this way: await market.getTA('crypto', 'BINANCE:BTCEUR');
})();
```

```javascript
/*
  ./tests/indicator.js
  Get indicator values
*/

const marketAPI = require('tradingview');

const market = marketAPI(false); // 'false' for chart-only mode

market.on('logged', () => {
  market.initChart({
    symbol: 'COINBASE:BTCEUR',
    period: '240',
    range: 50,
    indicators: [
      { name: 'ACCU_DISTRIB', id: 'STD;Accumulation_Distribution', version: '25' },
      { name: 'CIPHER_A', id: 'PUB;vrOJcNRPULteowIsuP6iHn3GIxBJdXwT', version: '1.0' },
      { name: 'CIPHER_B', id: 'PUB;uA35GeckoTA2EfgI63SD2WCSmca4njxp', version: '15.0' },
      // Color Changing moving average
      { name: 'CCMA', id: 'PUB;5nawr3gCESvSHQfOhrLPqQqT4zM23w3X', version: '6.0' },
    ],
  }, (periods) => {
    if (!periods[0].CIPHER_B) return;
    if (!periods[0].CCMA) return;

    console.log('Last period:', {
      price: periods[0].$prices.close,
      moneyFlow: (periods[0].CIPHER_B.RSIMFIArea >= 0) ? 'POSITIVE' : 'NEGATIVE',
      VWAP: periods[0].CIPHER_B.VWAP,
      MA: (periods[0].CCMA.Plot <= periods[0].$prices.close) ? 'ABOVE' : 'UNDER',
    });
  });
});
```
___
## Problems
 If you have errors in console or unwanted behavior,
 please create an issue [here](https://github.com/Mathieu2301/Tradingview-API/issues).
