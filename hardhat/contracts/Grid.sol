// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract Grid is ERC721, IERC2981, ReentrancyGuard, Ownable {
    // public constant TOTAL_SUPPLY = ;

    mapping(uint256 => uint8) _tokenIds;
    
    // royaltiesPercentage by default is 10%.
    uint256 public royaltiesPercentage = 10;

    // mapping: tokenId => current price

    constructor(uint256 _maxSupply) ERC721("Grid", "GRD") {
    }

    // include events on minting and transfers

    // batch transfers:
    // -

    // batch minting:
    // -payable with either eth or op token?

    modifier mintCompliance(uint256 _mintAmount) {
        require(_mintAmount > 0, 'Invalid mint amount!');
        require(totalSupply() + _mintAmount <= maxSupply, 'Max supply exceeded!');
        _;
    }

    function batchMint(uint256[] indexes ) public payable mintCompliance(indexes.length) {
        for(uint256 i=0; i <= indexes.length; ++i){
            _safeMint(_msgSender(), _mintAmount);
        }
    }
    // getter functions for mapping(s)

    // token uri should return rgb


    // royalties
    // -royaltyinfo + setroyaltyies + supportsinterface (erc-2981)
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, IERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // set a new royalty percentage
    function setRoyaltiesPercentage(uint256 newPercentage) public onlyOwner {
        royaltiesPercentage = newPercentage;
    }

    function royaltyInfo(uint256 tokenId, uint256 _salePrice) external view override(IERC2981) returns(address receiver, uint256 royaltyAmount) {
        uint256 _royalties = ((_salePrice * royaltiesPercentage) / 100);
        return (owner(), _royalties);
    }
    
    // withdraw function
    function withdraw() public onlyOwner {
        require(address(this).balance > 0, "Balance is 0");
        payable(owner()).address(this).balance;
    }

    // bidding mechanism

}