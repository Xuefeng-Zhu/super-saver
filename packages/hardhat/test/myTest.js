const { ethers } = require('hardhat');
const { use, expect } = require('chai');
const { solidity } = require('ethereum-waffle');

use(solidity);

describe('My Dapp', function (accounts) {
  let myContract;

  describe('SuperSaver', function () {
    it('Should deploy SuperSaver', async function () {
      const SuperSaver = await ethers.getContractFactory('SuperSaver');
      const signers = await ethers.getSigners();

      // console.log(signers);

      myContract = await SuperSaver.deploy();
      await myContract.deposit(
        '0xd3a691c852cdb01e281545a27064741f0b7f6825',
        '1'
      );

      const profile = await myContract.userProfileByToken(
        '0xd3a691c852cdb01e281545a27064741f0b7f6825',
        signers[0].address
      );
      console.log(profile.toString());
    });
  });
});
