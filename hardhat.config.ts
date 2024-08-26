import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY || ""]
    },
    edu: {
      url: "https://open-campus-codex-sepolia.drpc.org",
      accounts: [process.env.SEPOLIA_PRIVATE_KEY || ""]
    }
  }
};

export default config;