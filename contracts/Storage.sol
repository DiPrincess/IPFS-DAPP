// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Storage {
    struct FileMeta {
        string cid;
        string name;
        uint256 createdAt;
        bool deleted;
    }

    mapping(address => FileMeta[]) private _files;

    event FileAdded(address indexed user, uint256 indexed index, string cid, string name);
    event FileDeleted(address indexed user, uint256 indexed index);
    event FileRestored(address indexed user, uint256 indexed index);

    function addFile(string calldata cid, string calldata name) external returns (uint256 index) {
        _files[msg.sender].push(FileMeta({
            cid: cid,
            name: name,
            createdAt: block.timestamp,
            deleted: false
        }));
        index = _files[msg.sender].length - 1;
        emit FileAdded(msg.sender, index, cid, name);
    }

    function getFiles() external view returns (FileMeta[] memory) {
        return _files[msg.sender];
    }

    function deleteFile(uint256 index) external {
        require(index < _files[msg.sender].length, "bad index");
        require(!_files[msg.sender][index].deleted, "already deleted");
        _files[msg.sender][index].deleted = true;
        emit FileDeleted(msg.sender, index);
    }

    function restoreFile(uint256 index) external {
        require(index < _files[msg.sender].length, "bad index");
        require(_files[msg.sender][index].deleted, "not deleted");
        _files[msg.sender][index].deleted = false;
        emit FileRestored(msg.sender, index);
    }

    // Чтобы не ломать логику "последний файл" (если где-то осталось)
    function getLastFile() external view returns (string memory) {
        FileMeta[] storage arr = _files[msg.sender];
        if (arr.length == 0) return "";
        return arr[arr.length - 1].cid;
    }
}
