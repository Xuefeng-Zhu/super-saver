/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState, useEffect, useCallback } from "react";
import _ from "lodash";
import { Card, Table, Modal, Tabs, Input, Descriptions } from "antd";
import { parseEther, formatEther, parseUnits } from "@ethersproject/units";
import axios from "axios";

const { TabPane } = Tabs;

const columns = [
  {
    title: "Asset",
    key: "underlyingSymbol",
    render: (text, record) => {
      return (
        <div>
          <img src={record.icon} height="30" style={{ paddingRight: 10 }} />
          {record.underlyingSymbol}
        </div>
      );
    },
  },
  {
    title: "APY",
    key: "apy",
    render: (text, record) => {
      return `${(record.supplyRate * 100).toFixed(2)}%`;
    },
  },
  {
    title: "Balance",
    key: "balance",
    render: (text, record) => {
      const pending = parseUnits(record.pending || "0", "wei");
      const redeem = parseUnits(record.redeem || "0", "wei");

      return formatEther(pending.sub(redeem));
    },
  },
];

export default function SaverTable({ provider, compoundTokens, contract, tx, account }) {
  const [selectedToken, setSelectedToken] = useState();
  const [selectedTab, setSelectedTab] = useState("deposit");
  const [profile, setProfile] = useState();
  const [amount, setAmount] = useState();

  const loadUserTokenProfile = useCallback(async () => {
    try {
      const profile = await contract.userProfileByToken(selectedToken.underlyingAddress, account);
      console.log(selectedToken.underlyingAddress, account, profile);

      setProfile(profile);
    } catch (e) {
      console.log(e);
    }
  }, [setProfile, selectedToken]);

  useEffect(() => {
    loadUserTokenProfile();
  }, [loadUserTokenProfile, selectedToken]);

  const handleOk = async () => {
    const overrides = {};
    const value = parseEther(amount).toString();
    if (selectedTab === "deposit" && selectedToken.underlyingSymbol === "ETH") {
      overrides.value = value;
    }

    console.log(selectedToken.underlyingAddress, value, overrides);
    await tx(contract[selectedTab](selectedToken.underlyingAddress, value, overrides));
    setSelectedToken(null);
  };

  return (
    <Card title="Saver">
      <Table
        dataSource={compoundTokens}
        columns={columns}
        onRow={record => {
          return {
            onClick: event => setSelectedToken(record),
          };
        }}
      />
      <Modal
        title={_.get(selectedToken, "underlyingSymbol")}
        visible={!_.isEmpty(selectedToken)}
        onOk={handleOk}
        onCancel={() => setSelectedToken(null)}
      >
        {profile && selectedToken && (
          <Descriptions title="Balance" layout="vertical" size="small">
            <Descriptions.Item label="Pending">
              {formatEther(profile.pending)} {selectedToken.underlyingSymbol}
            </Descriptions.Item>
            <Descriptions.Item label="Locked">
              {formatEther(profile.locked)} {selectedToken.underlyingSymbol}
            </Descriptions.Item>
            <Descriptions.Item label="Redeeming">
              {formatEther(profile.redeem)} {selectedToken.underlyingSymbol}
            </Descriptions.Item>
          </Descriptions>
        )}
        ,
        <Tabs activeKey={selectedTab} onChange={key => setSelectedTab(key)}>
          <TabPane tab="Deposit" key="deposit">
            <Input
              placeholder="Amount"
              onChange={event => {
                setAmount(event.target.value);
              }}
            />
          </TabPane>
          <TabPane tab="Redeem" key="redeem">
            <Input
              placeholder="Amount"
              onChange={event => {
                setAmount(event.target.value);
              }}
            />
          </TabPane>
        </Tabs>
      </Modal>
    </Card>
  );
}
