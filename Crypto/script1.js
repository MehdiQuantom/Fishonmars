document.addEventListener("DOMContentLoaded", function () {
  getPrice10();
  setTimeout(getPrice10, 1 * 60 * 1000); //2 * 60
});

function getPrice10() {
  fetch("https://min-api.cryptocompare.com/data/top/totalvol?limit=10&tsym=USD").
  then(data => data.json()).
  then(res => {
    const priceResponse = res.Data;
    displayPrice(priceResponse);
  });
}
function numberWithCommas(x) {
  x = x.toString();
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
  return x;
}
function displayPrice(coinsList) {
  let priceList;
  let output;
  let oldPriceList = 0;
  let top10Coins = coinsList.map(item => item.CoinInfo.Name).join(",");
  fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${top10Coins}&tsyms=USD,EUR`).
  then(data => data.json()).
  then(price => {
    if (oldPriceList === 0) {
      oldPriceList = price;
      priceList = price;
      displayPriceList(coinsList, priceList, oldPriceList);
    } else {
      priceList = price;
      displayPriceList(coinsList, priceList, oldPriceList);
    }
  });
}

function displayPriceList(coinsList, priceList, oldPriceList) {
  console.log(priceList);
  console.log('=================');
  console.log(oldPriceList);
  output = coinsList.map((coin, i) => {
    const coinName = coin.CoinInfo.FullName;
    const coinShortName = coin.CoinInfo.Name;
    let imgPath = coin.CoinInfo.ImageUrl;
    let pricecoin = priceList[coin.CoinInfo.Name].USD;
    const priceDiferents = pricecoin - oldPriceList[coin.CoinInfo.Name].USD;
    console.log(priceDiferents);
    const htmlToDisplay = `
													<li class='coin-list'>
															<div class='coin-container'>
																<img src="https://www.cryptocompare.com${imgPath}" width='45px' heigth='45px'>
																<span class='coin-name'>${coinName}</span>
																<span class='coin-shortname'>(${coinShortName})</span>
																<div class='coin-price'>
																		<span>$${numberWithCommas(pricecoin)}</span>
																</div>
															</div>
													</li>
										`;
    return htmlToDisplay;
  });
  const ul = document.querySelector("[data-js=price-ul]");
  ul.innerHTML = '';
  output.forEach(item => ul.innerHTML += item);
}