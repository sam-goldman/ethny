// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// TODO: royalty receiver can change its own address?

contract Grid is ERC721, IERC2981, ReentrancyGuard, Ownable {
    uint256 public immutable MAX_SUPPLY;

    uint256 public counter;

    address payable royaltyReceiver;

    // royaltiesPercentage by default is 10%.
    uint256 public royaltiesPercentage = 10;

    // Mapping from token ID to RGB value
    mapping(uint256 => uint8) public tokenIdValues;

    // Mapping from token ID to current price
    mapping(uint256 => uint256) public prices;

    constructor(uint256 _maxSupply) ERC721("Grid", "GRD") {
        MAX_SUPPLY = _maxSupply;
    }

    function batchMint(uint256[] memory tokenIds)
        public
        payable
        nonReentrant
    {
        require(tokenIds.length > 0, "Cannot mint zero NFTs");
        require(counter + tokenIds.length <= MAX_SUPPLY, "Max supply exceeded");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            counter += 1;
            uint256 tokenId = tokenIds[i];
            _safeMint(_msgSender(), tokenId);
        }

        if (msg.value > 0) {
            uint256 amountPerTokenId = msg.value / tokenIds.length;
            for (uint256 i = 0; i < tokenIds.length; i++) {
                uint256 tokenId = tokenIds[i];
                prices[tokenId] += amountPerTokenId;
            }
        }
    }

    function batchTransferFrom(uint256[] memory tokenIds) external payable {
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
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * Returns the RGB value of the token as a string. The default RGB value for tokens
     * that don't exist is 255 (i.e. white).
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return
            _exists(tokenId) ? Strings.toString(tokenIdValues[tokenId]) : "255";
    }

    // set a new royalty percentage
    function setRoyaltiesPercentage(uint256 newPercentage) public onlyOwner {
        royaltiesPercentage = newPercentage;
    }

    function royaltyInfo(uint256 tokenId, uint256 _salePrice)
        external
        view
        override(IERC2981)
        returns (address receiver, uint256 royaltyAmount)
    {
        uint256 _royalties = ((_salePrice * royaltiesPercentage) / 100);
        return (owner(), _royalties);
    }

    // withdraw function
    function withdraw() public onlyOwner {
        require(address(this).balance > 0, "Balance is 0");
        payable(owner()).transfer(address(this).balance);
    }

    // bidding mechanism
}
