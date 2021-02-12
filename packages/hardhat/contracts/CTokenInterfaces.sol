pragma solidity >=0.6.0 <0.7.0;

interface CEtherInterface {
    function mint() external payable;

    function redeemUnderlying(uint256 redeemAmount) external returns (uint256);
}

interface CErc20Interface {
    /*** User Interface ***/

    function mint(uint256 mintAmount) external returns (uint256);

    function redeem(uint256 redeemTokens) external returns (uint256);

    function redeemUnderlying(uint256 redeemAmount) external returns (uint256);

    function borrow(uint256 borrowAmount) external returns (uint256);

    function repayBorrow(uint256 repayAmount) external returns (uint256);

    function repayBorrowBehalf(address borrower, uint256 repayAmount)
        external
        returns (uint256);
}
