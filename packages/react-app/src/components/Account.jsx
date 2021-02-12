import React from "react";
import { Button } from "antd";
import Address from "./Address";
import Balance from "./Balance";
import Wallet from "./Wallet";

export default function Account({
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
}) {
  const modalButtons = [];
  if (web3Modal) {
    if (web3Modal.cachedProvider) {
      modalButtons.push(
        <Button
          key="logoutbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          onClick={logoutOfWeb3Modal}
        >
          logout
        </Button>,
      );
    } else {
      modalButtons.push(
        <Button
          key="loginbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          onClick={loadWeb3Modal}
        >
          connect
        </Button>,
      );
    }
  }

  return (
    <div>
      {modalButtons}
    </div>
  );
}
