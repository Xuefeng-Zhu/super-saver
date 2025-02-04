/* eslint no-use-before-define: "warn" */
const fs = require('fs');
const chalk = require('chalk');
const { config, ethers } = require('hardhat');
const { utils } = require('ethers');
const R = require('ramda');

const SuperSaver = artifacts.require('SuperSaver');

const main = async () => {
  console.log('\n\n 📡 Deploying...\n');

  accounts = await web3.eth.getAccounts();
  // await deploy('YourContract');

  const deployedSuperSaver = await deploy('SuperSaver');
  // const superSaver = await SuperSaver.at(
  //   '0x94a2C4DD1Be777debd23E9Be8A43e63B253c87d7'
  // );
  // let tx = await superSaver.deposit(
  //   '0x0000000000000000000000000000000000000000',
  //   '100000000000000',
  //   {
  //     value: 100000000000000,
  //   }
  // );
  // console.log('deposit', tx);
  // tx = await superSaver.processDeposit(
  //   '0x0000000000000000000000000000000000000000'
  // );
  // console.log('processDeposit', tx);

  // tx = await superSaver.redeem(
  //   '0x0000000000000000000000000000000000000000',
  //   '90000000000000'
  // );
  // console.log('redeem', tx);
  // tx = await superSaver.processRedeem(
  //   '0x0000000000000000000000000000000000000000'
  // );
  // console.log('processRedeem', tx);

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */

  console.log(
    ' 💾  Artifacts (address, abi, and args) saved to: ',
    chalk.blue('packages/hardhat/artifacts/'),
    '\n\n'
  );
};

const deploy = async (
  contractName,
  _args = [],
  overrides = {},
  libraries = {}
) => {
  console.log(` 🛰  Deploying: ${contractName}`);

  const contractArgs = _args || [];
  const contractArtifacts = await ethers.getContractFactory(contractName, {
    libraries: libraries,
  });
  const deployed = await contractArtifacts.deploy(...contractArgs, overrides);
  const encoded = abiEncodeArgs(deployed, contractArgs);
  fs.writeFileSync(`artifacts/${contractName}.address`, deployed.address);

  console.log(
    ' 📄',
    chalk.cyan(contractName),
    'deployed to:',
    chalk.magenta(deployed.address)
  );

  if (!encoded || encoded.length <= 2) return deployed;
  fs.writeFileSync(`artifacts/${contractName}.args`, encoded.slice(2));

  return deployed;
};

// ------ utils -------

// abi encodes contract arguments
// useful when you want to manually verify the contracts
// for example, on Etherscan
const abiEncodeArgs = (deployed, contractArgs) => {
  // not writing abi encoded args if this does not pass
  if (
    !contractArgs ||
    !deployed ||
    !R.hasPath(['interface', 'deploy'], deployed)
  ) {
    return '';
  }
  const encoded = utils.defaultAbiCoder.encode(
    deployed.interface.deploy.inputs,
    contractArgs
  );
  return encoded;
};

// checks if it is a Solidity file
const isSolidity = (fileName) =>
  fileName.indexOf('.sol') >= 0 &&
  fileName.indexOf('.swp') < 0 &&
  fileName.indexOf('.swap') < 0;

const readArgsFile = (contractName) => {
  let args = [];
  try {
    const argsFile = `./contracts/${contractName}.args`;
    if (!fs.existsSync(argsFile)) return args;
    args = JSON.parse(fs.readFileSync(argsFile));
  } catch (e) {
    console.log(e);
  }
  return args;
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
