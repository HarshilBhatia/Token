const MyToken = artifacts.require("MyToken");

module.exports = function(deployer) {
  deployer.deploy(MyToken,10000000);// multiple arguments can be passed here
};
