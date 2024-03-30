pragma solidity ^0.8.9;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract CoinFlip is Ownable, AccessControl {
  struct Round {
    address payable player;
    uint256 betAmount;
    bool playerChoice; // true = heads; false = tails
    bool draw;
  }

  uint256 public roundId; // Current round number
  uint256 public totalVolume; // Total volume flipped
  uint16 public royalty; // Royalty to give to the owner account when funds are redistributed. Ex: 10 => 1%, 15 => 1.5%
  uint16 public maxPoolBetRatio; // Maximum bet amount ratio allowed per transaction based on current smart contract balance (pool). Ex: Ex: 10 => 1%, 15 => 1.5%
  address payable[] players; // All the addresses that have flipped some tokens
  bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');

  event Flip(Round round);

  constructor(address[] memory admins) {
    roundId = 0;
    royalty = 35; // 3.5%
    maxPoolBetRatio = 250; // 25%
    for (uint256 i = 0; i < admins.length; ++i) {
      _setupRole(ADMIN_ROLE, address(admins[i]));
    }
    transferOwnership(admins[0]);
    console.log('Deployed coin flip with owner %s', owner());
  }

  /**
   * @param _royalty The new royalty ratio
   */
  function setRoyalty(uint16 _royalty) public {
    require(hasRole(ADMIN_ROLE, msg.sender), 'Caller is not an admin');
    require(_royalty <= 1000, 'Royalty should be less than or equal to 100%');
    require(_royalty >= 0, 'Royalty should be greater than or equal to 0%');
    royalty = _royalty;
  }

  /**
   * @param _maxPoolBetRatio The new maxPoolBetRatio ratio
   */
  function setMaxPoolBetRatio(uint16 _maxPoolBetRatio) public {
    require(hasRole(ADMIN_ROLE, msg.sender), 'Caller is not an admin');
    require(_maxPoolBetRatio <= 1000, 'maxPoolBetRatio should be less than or equal to 100%');
    require(_maxPoolBetRatio >= 0, 'maxPoolBetRatio should be greater than or equal to 0%');
    maxPoolBetRatio = _maxPoolBetRatio;
  }

  function flip(bool _playerChoice) external payable {
    // Minimum amount to bet
    require(msg.value > 0, 'Transaction value should be greater than 0');

    // Maximum amout to bet
    require(
      msg.value * 1000 < (address(this).balance - msg.value) * maxPoolBetRatio,
      'Transaction value should be lesser than maxPoolBetRatio of the contracts balance'
    );

    // update states
    players.push(payable(msg.sender));
    totalVolume += msg.value;
    roundId = roundId + 1;

    bool draw = getRandomFlip();

    // Fees
    uint256 feesAmount = (msg.value * royalty) / 1000;
    payOwner(feesAmount);

    Round memory round = Round(payable(msg.sender), msg.value, _playerChoice, draw);

    // Winner rewards
    if (draw == _playerChoice) {
      uint256 winnerCut = msg.value + (msg.value - feesAmount);
      payable(msg.sender).transfer(winnerCut);
    }

    emit Flip(round);
  }

  function withdraw(uint256 amount) public {
    require(hasRole(ADMIN_ROLE, msg.sender), 'Caller is not an admin');

    payOwner(amount);
  }

  function payOwner(uint256 amount) private {
    payable(owner()).transfer(amount);
  }

  function loadFunds() external payable {
    require(hasRole(ADMIN_ROLE, msg.sender), 'Caller is not an admin');
  }

  function getRandomFlip() private view returns (bool) {
    return
      uint256(
        keccak256(abi.encodePacked(msg.sender, block.coinbase, block.difficulty, block.gaslimit, block.timestamp))
      ) %
        2 ==
      1;
  }
}
