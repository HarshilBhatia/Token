const { assert } = require("chai");

var Mytoken = artifacts.require("./MyToken.sol");

contract("Mytoken", function(accounts) {
  var tokenInstance;

  it("INIT- NAME,SYMBOL,STANDARD", function() {
    return Mytoken.deployed()
      .then((i) => {
        tokenInstance = i;
        return i.name();
      })
      .then((name) => {
        assert.equal(name, "MyToken", "err-name");
        return tokenInstance.symbol();
      })
      .then((symbol) => {
        assert.equal(symbol, "$**$", "err-symbol");
        return tokenInstance.standard();
      })
      .then((standard) => {
        assert.equal(standard, "MyToken v1.0", "err-standard");
      });
  });

  it("INIT - TOTAL_SUPPLY", function() {
    return Mytoken.deployed()
      .then(function(i) {
        tokenInstance = i;
        return tokenInstance.totalSupply();
      })

      .then(function(totalSupply) {
        assert.equal(totalSupply.toNumber(), 100000000, "err-totalSupply");

        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function(adminBalance) {
        assert.equal(adminBalance.toNumber(), 100000000, "err-adminBalance");
      });
  });

  it("APROVE TOKEN TRANSFER", () => {
    return Mytoken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.approve.call(accounts[1], 100);// . call doesn't change the data on the blockchain
      })
      .then((success) => {
        assert.equal(success, true, "err- doesn't return true");
        return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, `err - should triger only one event \n it triggered ${receipt.log.length} instead`);
        // standard testing procedure for a transaction
        assert.equal(
          receipt.logs[0].event,
          "Approval",
          'Event was not "Approval" event'
        );
        assert.equal(
          receipt.logs[0].args._owner,
          accounts[0],
          "problem in approval owner"
        );
        assert.equal(
          receipt.logs[0].args._spender,
          accounts[1],
          "logs the account the tokens are authorized to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          100,
          "logs the transfer amount"
        );
        return tokenInstance.allowance(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.equal(
          allowance.toNumber(),
          100,
          "Storing allowance problem"
        );
      });
  });

  it("HANDLE TOKEN TRANSFERS", () => {
    return Mytoken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        fromAccount = accounts[2];
        toAccount = accounts[3];
        spendingAccount = accounts[4];
        // Transfer some tokens to fromAccount
        return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
      })
      .then((receipt) => {
        // Approve spendingAccount to spend 10 tokens form fromAccount
        return tokenInstance.approve(spendingAccount, 10, {
          from: fromAccount,
        });
      })
      .then((receipt) => {
        // Try transferring something larger than the sender's balance
        return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {
          from: spendingAccount,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot transfer value larger than balance"
        );
        // Try transferring something larger than the approved amount
        return tokenInstance.transferFrom(fromAccount, toAccount, 20, {
          from: spendingAccount,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot transfer value larger than approved amount"
        );
        return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {
          from: spendingAccount,
        });
      })
      .then((success) => {
        assert.equal(success, true);
        return tokenInstance.transferFrom(fromAccount, toAccount, 10, {
          from: spendingAccount,
        });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          'should be the "Transfer" event'
        );
        assert.equal(
          receipt.logs[0].args._from,
          fromAccount,
          "logs the account the tokens are transferred from"
        );
        assert.equal(
          receipt.logs[0].args._to,
          toAccount,
          "logs the account the tokens are transferred to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          10,
          "logs the transfer amount"
        );
        return tokenInstance.balanceOf(fromAccount);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          90,
          "deducts the amount from the sending account"
        );
        return tokenInstance.balanceOf(toAccount);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          10,
          "adds the amount from the receiving account"
        );
        return tokenInstance.allowance(fromAccount, spendingAccount);
      })
      .then((allowance) => {
        assert.equal(
          allowance.toNumber(),
          0,
          "deducts the amount from the allowance"
        );
      });
  });
});
