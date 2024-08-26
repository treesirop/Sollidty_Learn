import hre from "hardhat";
let bridge, token;
async function main() {
  

  const TokenA = await ethers.getContractFactory("Certificate");
  token = await TokenA.deploy();
  await token.waitForDeployment();
  console.log("token:" + token.target);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});