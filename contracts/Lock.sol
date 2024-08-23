// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./dependancies/ERC721URIStorage.sol";
import "./dependancies/librairies/Counters.sol";
import "./dependancies/librairies/Base64.sol";

error CourseCertificate__NotIssued();
error CourseCertificate__NotOwner();

/**
 * @title CourseCertificate
 * @author [Your Name]
 * @notice Non-transferable Soul Bound Token (NFT) smart contract for course certificates
 * @dev This contract is used to award certificates for completing a course. Anyone can mint a certificate by providing the course name and OCID.
 */
contract CourseCertificate is ERC721URIStorage {
    using Strings for uint256;
    // ERC721 Variables:
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Certificate Variables:
    string internal s_courseName; // Name of the course
    address private _owner; // Contract owner
    mapping(address => bool) internal s_issuedCertificates;
    mapping(address => string) internal s_studentToCertificate;

    struct Certificate {
        string s_courseName;
        string ocid;
    }
    // Events:
    event CertificateIssued(address student);
    event CertificateMinted(address student, uint256 tokenId,Certificate certificate);
 
    modifier onlyOwner() {
        if (msg.sender != _owner) {
            revert CourseCertificate__NotOwner();
        }
        _;
    }

    constructor(
        string memory courseName
    ) ERC721("CourseCertificateSoulBoundToken", "CCSBT") {
        s_courseName = courseName;
        _owner = msg.sender;
    }

    function issueCertificate(address student, string memory courseName) external onlyOwner {
        if (keccak256(abi.encodePacked(s_courseName)) != keccak256(abi.encodePacked(courseName))) {
            revert CourseCertificate__NotIssued();
        }

        s_issuedCertificates[student] = true;
        emit CertificateIssued(student);
    }

    function mintCertificate(string memory ocid) public returns (uint256) {
        if (!s_issuedCertificates[msg.sender]) {
            revert CourseCertificate__NotIssued();
        }

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);

        string memory tokenURI = generateTokenURI(newItemId, ocid);
        _setTokenURI(newItemId, tokenURI);

        s_issuedCertificates[msg.sender] = false;
        s_studentToCertificate[msg.sender] = tokenURI;
        s_courseName = getCourseName();
        Certificate memory certificate = Certificate({
            s_courseName: s_courseName,
            ocid: ocid
        });
        emit CertificateMinted(msg.sender, newItemId,certificate);

        return newItemId;
    }

    function generateTokenURI(uint256 tokenId, string memory ocid) private view returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "', s_courseName, ' Certificate #', tokenId.toString(), '",',
                '"description": "Certificate for completing the course",',
                '"attributes": [',
                    '{',
                        '"trait type": "Course Name",',
                        '"value": "', s_courseName, '"',
                    '},',
                    '{',
                        '"trait type": "OCID",',
                        '"value": "', ocid, '"',
                    '}',
                ']',
            '}'
        );
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    // Getters
    function checkCertificateOfStudent(
        address student
    ) external view returns (string memory) {
        return s_studentToCertificate[student];
    }

    function isStudentCertificateIssued(
        address student
    ) public view returns (bool) {
        return s_issuedCertificates[student];
    }

    function getTokenCounter() public view returns (Counters.Counter memory) {
        return _tokenIds;
    }

    function getCourseName() public view returns (string memory) {
        return s_courseName;
    }

    function getOwner() public view returns (address) {
        return _owner;
    }
}