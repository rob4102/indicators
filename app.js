const { getTradeSignal } = require("./taapi");

(async () => {
    const pair = "ETH/USDT"; // Use pairs with high liquidity for short-term trading
    const interval = "1m";  // 1-minute timeframe for high-speed trading

    const signal = await getTradeSignal(pair, interval);
    console.log(`Trading Signal: ${signal.signal}`);
    console.log(`Reason: ${signal.reason}`);
})();
