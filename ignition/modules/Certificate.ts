import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CourseCertificateModule = buildModule("CourseCertificateModule", (m) => {
  const courseName = m.getParameter("courseName", "web3 strating");

  const courseCertificate = m.contract("CourseCertificate", [courseName]);

  return { courseCertificate };
});

export default CourseCertificateModule;