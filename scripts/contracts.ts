import { createWalletClient, http, getContract, Hex, publicActions } from 'viem';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';
import { privateKeyToAccount } from 'viem/accounts';
import CourseCertificate from "../artifacts/contracts/Lock.sol/CourseCertificate.json";
dotenv.config();

const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

const account = privateKeyToAccount(`0x${SEPOLIA_PRIVATE_KEY}`);

(async () => {
  // 创建钱包客户端
  const client = createWalletClient({
    account, 
    chain: sepolia,
    transport: http(ALCHEMY_API_URL),
  }).extend(publicActions);

  const abi = CourseCertificate["abi"];
  const bin = CourseCertificate["bytecode"];

  // // 部署合约并传递构造函数参数
  // const hash = await client.deployContract({
  //   abi,
  //   account,
  //   bytecode: `0x${bin}`,
  //   args: ["My New Certificate"] // 传递构造函数参数
  // });

  // // 等待交易确认并获取合约地址
  // const { contractAddress } = await client.getTransactionReceipt({ hash });
  const contractAddress = "0x282BC825f4b82678412E8d76BA7f4D8582CdD217"
  if (contractAddress) {
    console.log("Contract deployed at:", contractAddress);

    // 读取合约的课程名称
    const courseName = await client.readContract({
      address: contractAddress,
      abi,
      functionName: "getCourseName",
      args: []
    });
    console.log("Course Name:", courseName);

    // 颁发证书
    const issueResult = await client.writeContract({
      address: contractAddress,
      abi,
      functionName: "issueCertificate",
      args: ["0xf7FA69ACEA6fa37C888B74dDD872B363eC53A88F", "Blockchain Development"]
    });
    console.log("Issue Certificate Result:", issueResult);

    // 等待交易确认
    let receipt;
    while (!receipt) {
      try {
        receipt = await client.getTransactionReceipt({ hash: issueResult });
      } catch (error) {
        console.log("Waiting for transaction receipt...");
        await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒后重试
      }
    }
    console.log("Transaction receipt:", receipt);

    const logs = await client.getContractEvents({
      address: contractAddress,
      abi ,
      eventName: 'CertificateIssued', 
    })
    console.log("CertificateIssued event: ",logs);
    
    // 检查证书是否已颁发
    const isIssued = await client.readContract({
      address: contractAddress,
      abi,
      functionName: "isStudentCertificateIssued",
      args: ["0xf7FA69ACEA6fa37C888B74dDD872B363eC53A88F"]
    });
    console.log("Is Certificate Issued:", isIssued);

    // 铸造证书
    const mintResult = await client.writeContract({
      address: contractAddress,
      abi,
      functionName: "mintCertificate",
      args: ["sadfsaf.edu"]
    });
    console.log("Mint Certificate Result:", mintResult);

    // 等待交易确认
    receipt = null;
    while (!receipt) {
      try {
        receipt = await client.getTransactionReceipt({ hash: mintResult });
      } catch (error) {
        console.log("Waiting for transaction receipt...");
        await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒后重试
      }
    }
    console.log("Transaction receipt:", receipt);
  }
})();