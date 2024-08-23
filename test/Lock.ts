import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("CourseCertificate", function () {
  async function deployCourseCertificateFixture() {
    const courseName = "Blockchain Development";
    const [owner, student] = await hre.viem.getWalletClients();
    const courseCertificate = await hre.viem.deployContract("CourseCertificate", [courseName]);
    const publicClient = await hre.viem.getPublicClient();

    return {
      courseCertificate,
      courseName,
      owner,
      student,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should set the right course name", async function () {
      const { courseCertificate, courseName } = await loadFixture(deployCourseCertificateFixture);
      expect(await courseCertificate.read.getCourseName()).to.equal(courseName);
    });

    it("Should set the right owner", async function () {
      const { courseCertificate, owner } = await loadFixture(deployCourseCertificateFixture);
      expect(await courseCertificate.read.getOwner()).to.equal(getAddress(owner.account.address));
    });
  });

  describe("Issue Certificate", function () {
    it("Should issue a certificate to a student", async function () {
      const { courseCertificate, student } = await loadFixture(deployCourseCertificateFixture);
      await courseCertificate.write.issueCertificate([student.account.address, "Blockchain Development"]);
      expect(await courseCertificate.read.isStudentCertificateIssued([student.account.address])).to.be.true;
    });

    it("Should not issue a certificate with a wrong course name", async function () {
      const { courseCertificate, student } = await loadFixture(deployCourseCertificateFixture);
      await expect(courseCertificate.write.issueCertificate([student.account.address, "Wrong Course Name"])).to.be.rejectedWith("CourseCertificate__NotIssued");
    });
  });

  describe("Mint Certificate", function () {
    it("Should mint a certificate for a student", async function () {
      const { courseCertificate, student } = await loadFixture(deployCourseCertificateFixture);
      await courseCertificate.write.issueCertificate([student.account.address, "Blockchain Development"]);
      const hash = await courseCertificate.write.mintCertificate(["OCID"], { account: student });
      const receipt = await courseCertificate.publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");
      expect(await courseCertificate.read.isStudentCertificateIssued([student.account.address])).to.be.false;
    });

    it("Should not mint a certificate if not issued", async function () {
      const { courseCertificate, student } = await loadFixture(deployCourseCertificateFixture);
      await expect(courseCertificate.write.mintCertificate(["OCID"], { account: student })).to.be.rejectedWith("CourseCertificate__NotIssued");
    });
  });
});