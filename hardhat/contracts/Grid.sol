// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC721.sol";
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Grid is ERC721, ReentrancyGuard, Ownable {
    // public constant TOTAL_SUPPLY = ;

    // Mapping from token ID to RGB value
    mapping(uint256 => uint8) public tokenIdValues;

    // Mapping from token ID to current price
    mapping(uint256 => uint256) public prices;

    constructor(uint256 _maxSupply) ERC721("Grid", "GRD") {}

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

    function batchTransferFrom(uint256[] tokenIds) external payable {
        // Finds the total price associated with the token IDs
        uint256 currPrice;
        for (uint i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            currPrice += prices[tokenId];
        }

        require(msg.value > currPrice, "Insufficient payment");

        // Increments the price of each token ID and transfers tokens to new owner
        uint256 amountPerToken = msg.value / tokenIds.length;
        for (uint i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            prices[tokenId] += amountPerToken;
            _transfer(_owners[tokenId], msg.sender, tokenId);
        }
    }

    // royalties
    // -royaltyinfo + setroyaltyies + supportsinterface (erc-2981)


    /**
     * Returns the RGB value of the token as a string. The default RGB value for tokens
     * that don't exist is 255 (i.e. white).
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _exists(tokenId) ? (tokenIdValues[tokenId]).toString() : "255";
    }

    // withdraw function
    function withdraw() public onlyOwner {
        require(address(this).balance > 0, "Balance is 0");
        payable(owner()).address(this).balance;
    }

    // bidding mechanism

}