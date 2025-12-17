// const { ethers, artifacts } = require("hardhat");

// const path = require('path');
// const fs = require('fs');


// async function main() {
//     const [deployer] = await ethers.getSigners();
//     console.log("Deploying the contracts with the account:", await deployer.getAddress());

//     const Storage = await ethers.getContractFactory('Storage');
//     const storage = await Storage.deploy();
//     await storage.deployed();

//     console.log("Storage's address:", storage.address);

//     saveAddressToConfig(storage.address);
// }

// function saveAddressToConfig(address) {
//     const contractsDirectory = path.join(__dirname, '..', 'frontend', 'src', 'contracts');

//     if (!fs.existsSync(contractsDirectory)) {
//         fs.mkdirSync(contractsDirectory);
//     }

//     fs.writeFileSync(
//         path.join(contractsDirectory, 'contract-address.json'),
//         JSON.stringify({ Storage: address }, undefined, 2)
//     );

//     const Artifact = artifacts.readArtifactSync("Storage");

//     fs.writeFileSync(
//         path.join(contractsDirectory, 'Storage.json'),
//         JSON.stringify(Artifact, null, 2)
//     );
// }

// main()
//     .then(
//         () => {
//             process.exit(0);
//         }
//     )
//     .catch(
//         (message) => {
//             console.error(message);
//             process.exit(1);
//         }
//     );

const path = require("path");
const fs = require("fs");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Storage = await hre.ethers.getContractFactory("Storage");
  const storage = await Storage.deploy();
  await storage.deployed();

  console.log("Storage address:", storage.address);

  const frontendContractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  fs.mkdirSync(frontendContractsDir, { recursive: true });

  fs.writeFileSync(
    path.join(frontendContractsDir, "contract-address.json"),
    JSON.stringify({ Storage: storage.address }, null, 2)
  );

  const artifact = await hre.artifacts.readArtifact("Storage");
  fs.writeFileSync(
    path.join(frontendContractsDir, "Storage.json"),
    JSON.stringify(artifact, null, 2)
  );

  console.log("Frontend contracts updated:", frontendContractsDir);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
