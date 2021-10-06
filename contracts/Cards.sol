// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Cards is ERC1155 {
    uint256 count;

    constructor(string memory _uri, uint256 _count) ERC1155(_uri) {
        count = _count;
    }

    function mint(uint256 id) external {
        require(id < count, "Card does not exist");
        _mint(msg.sender, id, 1, "");
    }

    function burn(uint256 id) external {
        _burn(msg.sender, id, 1);
    }
}
