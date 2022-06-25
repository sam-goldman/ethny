// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract Grid is ERC721, IERC2981, ReentrancyGuard, Ownable {
    uint256 public constant MAX_SUPPLY = 10000;

    uint256 public totalSupply;

    // royaltiesPercentage by default is 10%.
    uint256 public royaltiesPercentage = 10;

    // Mapping from token ID to RGB value
    mapping(uint256 => uint8) public tokenIdValues;

    // Mapping from token ID to current price
    mapping(uint256 => uint256) public prices;

    constructor() ERC721("Grid", "GRD") {
    }

    modifier mintCompliance(uint256 _mintAmount) {
        require(_mintAmount > 0, 'Invalid mint amount!');
        require(totalSupply + _mintAmount <= MAX_SUPPLY, 'Max supply exceeded!');
        _;
    }

    function batchMint(uint256[] memory tokenIds) public payable nonReentrant mintCompliance(tokenIds.length) {
        for(uint256 i=0; i <= tokenIds.length; ++i){
            uint256 tokenId = tokenIds[i];
            totalSupply += 1;
            _safeMint(_msgSender(), totalSupply);
        }

        if (msg.value > 0) {
            uint256 amountPerTokenId = msg.value / tokenIds.length;
            for (uint256 i = 0; i < tokenIds.length; i++) {
                uint256 tokenId = tokenIds[i];
                prices[tokenId] += amountPerTokenId;
            }
        }
    }

    function batchTransferFrom(uint256[] tokenIds) external payable {
        // Finds the total price associated with the token IDs
        uint256 currPrice;
        for (uint i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            currPrice += prices[tokenId];
        }

        require(msg.value > currPrice, "Insufficient payment");

        // Increments the price of each token ID and transfers tokens to new owner
        uint256 amountPerTokenId = msg.value / tokenIds.length;
        for (uint i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            prices[tokenId] += amountPerTokenId;
            _transfer(_owners[tokenId], msg.sender, tokenId);
        }
    }

    // royalties
    // -royaltyinfo + setroyaltyies + supportsinterface (erc-2981)
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, IERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }


    /**
     * Returns the RGB value of the token as a string. The default RGB value for tokens
     * that don't exist is 255 (i.e. white).
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _exists(tokenId) ? tokenIdValues[tokenId].toString() : "255";
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