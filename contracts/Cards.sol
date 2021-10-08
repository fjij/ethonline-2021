// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Cards is ERC1155 {
    uint public count;

    constructor(string memory _uri, uint _count) ERC1155(_uri) {
        count = _count;
    }

    function mint(uint _id) external {
        require(_id < count, "Card does not exist");
        _mint(msg.sender, _id, 1, "");
    }

    function mintBatch(uint[] calldata _ids, uint[] calldata _amounts) external {
        for (uint i = 0; i < _ids.length; i ++) {
            require(_ids[i] < count, "Card does not exist");
        }
        _mintBatch(msg.sender, _ids, _amounts, "");
    }

    function burn(uint _id) external {
        _burn(msg.sender, _id, 1);
    }

    function burnBatch(uint[] calldata _ids, uint[] calldata _amounts) external {
        _burnBatch(msg.sender, _ids, _amounts);
    }
}
