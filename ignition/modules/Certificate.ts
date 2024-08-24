import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CourseCertificateModule = buildModule("CourseCertificateModule", (m) => {
  const courseName = m.getParameter("courseName", "Blockchain Development");

  const courseCertificate = m.contract("CourseCertificate", [courseName]);

  return { courseCertificate };
});

export default CourseCertificateModule;