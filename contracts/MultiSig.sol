// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract MultiSig {

    uint8 public quorum; 
    uint8 public noOfValidSigners;
    uint256 public txCount;

    struct Transaction {
        uint256 id;
        uint256 amount;
        address sender;
        address recipient;
        bool isCompleted;
        uint256 timestamp;
        uint256 noOfApproval;
        address tokenAddress;
        address[] transactionSigners;
        uint _initialQuorum;

    }

    mapping(address => bool) isValidSigner;
    mapping(uint => Transaction) transactions; //txID -> Transaction
    //signer -> transactionId -> bool (chacking if an address has signed)
    mapping (address => mapping(uint256 => bool)) hasSigned;

    event QuorumUpdated(uint newQuorum);

    constructor(uint8 _quorum, address[] memory _validSigners) {
       
            require(_validSigners.length > 1, "few valid signer");
            require(_quorum > 1, "quorum is too small");

            for(uint256 i = 0; i < _validSigners.length; i++) {
                require(_validSigners[i] != address(0), "zero address not allowed");
                require(!isValidSigner[_validSigners[i]], "signer already exist");

                isValidSigner[_validSigners[i]] = true;
            
        }

        noOfValidSigners = uint8(_validSigners.length);

        if (!isValidSigner[msg.sender]){
            isValidSigner[msg.sender] = true;
            noOfValidSigners += 1;
        }

        require(_quorum <= noOfValidSigners, "quorum is greater than valid signers");
        quorum = _quorum;
    }


    function transfer(uint256 _amount, address _recipient, address _tokenAddress) external {
        require(msg.sender != address(0), "address zero found");
        require(isValidSigner[msg.sender], "invalid signer");

        require(_amount > 0, "cannot send zero amount");
        require(_recipient != address(0), "address zero found");
        require(_tokenAddress != address(0), "address zero found");

        require(IERC20(_tokenAddress).balanceOf(address(this)) >= _amount, "insufficient funds");

        uint256 _txId = txCount + 1;
        Transaction storage trx = transactions[_txId];
        
        trx.id = _txId;
        trx.amount = _amount;
        trx.recipient = _recipient;
        trx.sender = msg.sender;
        trx.timestamp = block.timestamp;
        trx.tokenAddress = _tokenAddress;
        trx.noOfApproval += 1;
        trx.transactionSigners.push(msg.sender);
        hasSigned[msg.sender][_txId] = true;

        txCount += 1;
    }


   function approveTx(uint8 _txId) external {
        Transaction storage trx = transactions[_txId];

        require(trx.id != 0, "invalid tx id");
        
        require(IERC20(trx.tokenAddress).balanceOf(address(this)) >= trx.amount, "insufficient funds");
        require(!trx.isCompleted, "transaction already completed");
        require(trx.noOfApproval < quorum, "approvals already reached");

        // for(uint256 i = 0; i < trx.transactionSigners.length; i++) {
        //     if(trx.transactionSigners[i] == msg.sender) {
        //         revert("can't sign twice");
        //     }
        // }

        require(isValidSigner[msg.sender], "not a valid signer");
        require(!hasSigned[msg.sender][_txId], "can't sign twice");

        hasSigned[msg.sender][_txId] = true;
        trx.noOfApproval += 1;
        trx.transactionSigners.push(msg.sender);

        if(trx.noOfApproval == quorum) {
            trx.isCompleted = true;
            IERC20(trx.tokenAddress).transfer(trx.recipient, trx.amount);
        }
    }

    function updateQuorum(uint8 _newQuorum) external{
        require(msg.sender != address(0), "address zero found");
        require(isValidSigner[msg.sender], "invalid signer");
        require(quorum <= noOfValidSigners,"quorum is greater than valid signers");

        require(_newQuorum > 0, "Quorum must be greater than 0");
        // require(_newQuorum <= _validSigners.length, "Quorum cannot exceed number of signers");
        quorum = _newQuorum;
        emit QuorumUpdated(_newQuorum);
    }

}