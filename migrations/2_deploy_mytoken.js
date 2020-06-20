const MyToken = artifacts.require("MyToken");
const Ico = artifacts.require("TokenIco");

module.exports = function (deployer) {
  deployer.deploy(MyToken, 100000000).then(() => {
    return deployer.deploy(Ico, MyToken.address, 10000000000000); // multiple arguments can be passed here
  }); // multiple arguments can be passed here
};
