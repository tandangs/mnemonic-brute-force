var fs = require("fs");
const { ethers } = require("ethers");

var tries = 0,
  hits = 0;
const delay = (time) => new Promise((res) => setTimeout(res, time));
var words = fs
  .readFileSync("bip39.txt", { encoding: "utf8", flag: "r" })
  .replace(/(\r)/gm, "")
  .toLowerCase()
  .split("\n");

function gen12(words) {
  var n = 12;
  var shuffled = words.sort(function () {
    return 0.512 - Math.random();
  });
  var generatedMnemonic = shuffled.slice(0, n).join(" ");
  console.log(`Generated Mnemonic: ${generatedMnemonic}`);
  return generatedMnemonic;
}

console.log("starting....");

async function doCheck() {
  tries++;
  try {
    var mnemonic = gen12(words);
    var wallet = ethers.Wallet.fromMnemonic(mnemonic);
    var address = wallet.address;
    var privateKey = wallet.privateKey;

    console.log(`Checking address: ${address}`);

    // Ethereum Provider
    const ethProvider = new ethers.providers.JsonRpcProvider('https://ethereum.blockpi.network/v1/rpc/8fb5f2e5382fba42ff56e9fa57cdc6f09f29ab42');
    const ethBalance = await ethProvider.getBalance(address);
    const ethTransactionCount = await ethProvider.getTransactionCount(address);

    // Binance Smart Chain Provider
    const bnbProvider = new ethers.providers.JsonRpcProvider('https://bsc.blockpi.network/v1/rpc/2ec1c009acf553d8f79dd731287b4f808bda4dfa');
    const bnbBalance = await bnbProvider.getBalance(address);
    const bnbTransactionCount = await bnbProvider.getTransactionCount(address);

    // Polygon Provider
    const polygonProvider = new ethers.providers.JsonRpcProvider('https://polygon.blockpi.network/v1/rpc/b3421983b14b8ad1f4e649ace202ea2a100f31c2');
    const polygonBalance = await polygonProvider.getBalance(address);
    const polygonTransactionCount = await polygonProvider.getTransactionCount(address);

    if (ethBalance.gt(ethers.utils.parseEther("0")) || ethTransactionCount > 0 || bnbBalance.gt(ethers.utils.parseEther("0")) || bnbTransactionCount > 0 || polygonBalance.gt(ethers.utils.parseEther("0")) || polygonTransactionCount > 0) {
      fs.appendFileSync(
        "hits.txt",
        address +
          "," +
          privateKey +
          "," +
          ethers.utils.formatEther(ethBalance) +
          "," +
          ethTransactionCount +
          "," +
          ethers.utils.formatEther(bnbBalance) +
          "," +
          bnbTransactionCount +
          "," +
          ethers.utils.formatEther(polygonBalance) +
          "," +
          polygonTransactionCount +
          "\n"
      );
      hits++;
      console.log(`+ Hits: ${hits}`);
    } else {
      console.log("-");
    }
  } catch (e) {
    console.log("-");
  }

  await delay(0); // Prevent Call Stack Overflow
  doCheck();
}

doCheck();
