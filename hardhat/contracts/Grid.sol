// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC721Royalty.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Grid is ERC721Royalty, ReentrancyGuard, Ownable {
    uint16 public constant BASIS_POINTS = 10000;
    uint256 public immutable MAX_SUPPLY;

    uint256 public counter;

    // royaltiesPercentage by default is 5%.
    uint256 public royaltiesPercentage = 500; // 500 bps

    // Mapping from token ID to RGB value in hex format
    mapping(uint256 => bytes3) public tokenIdValues;

    // Mapping from token ID to current price
    mapping(uint256 => uint256) public prices;

    // TODO: change name?
    constructor(uint256 _maxSupply) ERC721("Grid", "GRD") {
        MAX_SUPPLY = _maxSupply;
    }

    function batchMint(uint256[] memory tokenIds) public payable nonReentrant {
        require(tokenIds.length > 0, "Cannot mint zero NFTs");
        require(counter + tokenIds.length <= MAX_SUPPLY, "Max supply exceeded");

        uint256 amountPerTokenId = msg.value / tokenIds.length;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            counter += 1;
            uint256 tokenId = tokenIds[i];
            _safeMint(_msgSender(), tokenId);

            if (msg.value > 0) {
                prices[tokenId] += amountPerTokenId;
            }
        }
    }

    function batchTransferFrom(uint256[] memory tokenIds, address to)
        external
        payable
        nonReentrant
    {
        // Gets the total price associated with the token IDs
        uint256 prevPrice;
        for (uint i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            prevPrice += prices[tokenId];
        }

        require(msg.value > prevPrice, "Insufficient payment");

        // Increments the price of each token ID and transfers tokens to new owner
        uint256 amountPerTokenId = msg.value / tokenIds.length;
        for (uint i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            address prevOwner = _owners[tokenId];

            // Pays the previous owner their portion of the transaction.
            uint256 prevOwnerPayment = ((BASIS_POINTS - royaltiesPercentage) *
                amountPerTokenId) / BASIS_POINTS;
            (bool success, ) = payable(prevOwner).call{value: prevOwnerPayment}(
                ""
            );
            require(success, "Failed to pay previous owner.");

            // Transfers token to the new owner
            prices[tokenId] += amountPerTokenId;
            _transfer(_owners[tokenId], to, tokenId);
        }
    }

    // royalties
    // -royaltyinfo + setroyaltyies + supportsinterface (erc-2981)
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override
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
        // TODO: is this necessary?
        return
            _exists(tokenId)
                ? Strings.toHexString(uint24(tokenIdValues[tokenId]))
                : "FFFFFF";
    }

    function setTokenIdValues(uint256[] memory tokenIds, bytes3[] memory values)
        external
    {
        require(tokenIds.length == values.length, "Array lengths differ");

        for (uint i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(
                _owners[tokenId] == msg.sender,
                "Caller must be token ID owner"
            );
            tokenIdValues[tokenId] = values[i];
        }
    }

    // set a new royalty percentage
    function setRoyaltiesPercentage(uint256 newPercentage) public onlyOwner {
        royaltiesPercentage = newPercentage;
    }

    function royaltyInfo(uint256, uint256 _salePrice)
        public
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        royaltyAmount = ((_salePrice * royaltiesPercentage) / 10000);

        return (owner(), royaltyAmount);
    }

    // withdraw function
    function withdraw() public onlyOwner {
        require(address(this).balance > 0, "Balance is 0");
        payable(owner()).transfer(address(this).balance);
    }
}
