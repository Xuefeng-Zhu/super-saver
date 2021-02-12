pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./CTokenInterfaces.sol";

contract SuperSaver is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    struct Profile {
        uint256 balance;
        uint256 locked;
        uint256 redeem;
    }

    struct PendingOperation {
        address payable[] users;
    }

    mapping(address => mapping(address => Profile)) public userProfileByToken;
    mapping(address => PendingOperation) private pendingDepositByToken;
    mapping(address => PendingOperation) private pendingRedeemByToken;
    mapping(address => address) public cTokenMapping;

    uint256 public constant FEE_RATE = 10000;

    constructor() public {
        cTokenMapping[address(0)] = 0x41B5844f4680a8C38fBb695b7F9CFd1F64474a72;
    }

    receive() external payable {}

    function deposit(address _token, uint256 _amount) public payable {
        if (_token == address(0)) {
            require(msg.value == _amount);
        } else {
            IERC20 asset = IERC20(_token);
            asset.safeTransferFrom(msg.sender, address(this), _amount);
        }

        Profile storage profile = userProfileByToken[_token][msg.sender];
        bool firstDeposit = true;
        if (profile.balance > 0) {
            firstDeposit = false;
        }
        profile.balance = profile.balance.add(_amount);

        if (firstDeposit) {
            pendingDepositByToken[_token].users.push(msg.sender);
        }
    }

    function redeem(address _token, uint256 _amount) public payable {
        Profile storage profile = userProfileByToken[_token][msg.sender];

        bool firstRedeem = true;
        if (profile.redeem > 0) {
            firstRedeem = false;
        }

        profile.redeem = profile.redeem.add(_amount);

        if (firstRedeem) {
            pendingRedeemByToken[_token].users.push(msg.sender);
        }
    }

    function processDeposit(address _token) public {
        PendingOperation storage pendingOperation =
            pendingDepositByToken[_token];

        uint256 totalDeposit = 0;
        for (uint256 i = 0; i < pendingOperation.users.length; i++) {
            address user = pendingOperation.users[i];
            Profile storage userProfile = userProfileByToken[_token][user];
            totalDeposit = totalDeposit.add(userProfile.balance);
            userProfile.locked = userProfile.balance.mul(FEE_RATE.sub(1)).div(
                FEE_RATE
            );
            userProfile.balance = 0;
        }

        uint256 fee = totalDeposit.div(FEE_RATE);
        totalDeposit = totalDeposit.sub(fee);

        if (_token == address(0)) {
            CEtherInterface cToken = CEtherInterface(cTokenMapping[_token]);
            cToken.mint.value(totalDeposit)();
            msg.sender.transfer(fee);
        } else {
            IERC20 asset = IERC20(_token);
            CErc20Interface cToken = CErc20Interface(cTokenMapping[_token]);
            asset.approve(cTokenMapping[_token], totalDeposit);
            cToken.mint(totalDeposit);
            asset.safeTransfer(msg.sender, fee);
        }
    }

    function processRedeem(address _token) public {
        PendingOperation storage pendingOperation =
            pendingRedeemByToken[_token];

        uint256 totalRedeem = 0;
        for (uint256 i = 0; i < pendingOperation.users.length; i++) {
            address user = pendingOperation.users[i];
            Profile storage userProfile = userProfileByToken[_token][user];
            totalRedeem = totalRedeem.add(userProfile.redeem);
        }

        uint256 finalRedeem;
        if (_token == address(0)) {
            CEtherInterface cToken = CEtherInterface(cTokenMapping[_token]);
            finalRedeem = cToken.redeemUnderlying(totalRedeem);
        } else {
            CErc20Interface cToken = CErc20Interface(cTokenMapping[_token]);
            finalRedeem = cToken.redeemUnderlying(totalRedeem);
        }

        distributeRedeem(_token, totalRedeem, finalRedeem);
    }

    function distributeRedeem(
        address _token,
        uint256 totalRedeem,
        uint256 finalRedeem
    ) internal {
        IERC20 asset = IERC20(_token);
        uint256 fee = finalRedeem.div(FEE_RATE);
        finalRedeem = finalRedeem.sub(fee);
        PendingOperation storage pendingOperation =
            pendingRedeemByToken[_token];

        for (uint256 i = 0; i < pendingOperation.users.length; i++) {
            address payable user = pendingOperation.users[i];
            Profile storage userProfile = userProfileByToken[_token][user];

            uint256 receiveRedeem =
                finalRedeem.mul(userProfile.redeem).div(totalRedeem);
            if (_token == address(0)) {
                user.transfer(receiveRedeem);
            } else {
                asset.safeTransfer(user, receiveRedeem);
            }
            userProfile.redeem = 0;
        }

        if (_token == address(0)) {
            msg.sender.transfer(fee);
        } else {
            asset.safeTransfer(msg.sender, fee);
        }
    }
}
