// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Grid is ERC721 {
    // public constant TOTAL_SUPPLY = ;

    mapping(uint256 => uint8) _tokenIds;

    // mapping: tokenId => current price

    constructor() ERC721("Grid", "GRD") {}

    // include events on minting and transfers

    // batch transfers:
    // -

    // batch minting:
    // -payable with either eth or op token?
    // -

    // royalties
    // -royaltyinfo + setroyaltyies + supportsinterface (erc-2981)

    // getter functions for mapping(s)

    // token uri should return rgb

    // withdraw function

}