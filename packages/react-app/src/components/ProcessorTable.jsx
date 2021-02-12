/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState, useEffect, useCallback } from "react";
import _ from "lodash";
import { Card, Table, Popconfirm } from "antd";
import axios from "axios";
import { formatEther } from "@ethersproject/units";

export default function ProcessorTable({ provider, compoundTokens, contract, tx, account }) {
  const processDeposit = async record => {
    await tx(contract.processDeposit(record.underlyingAddress, {}));
  };

  const processRedeem = async record => {
    await tx(contract.processRedeem(record.underlyingAddress, {}));
  };

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
      title: "Pending Deposit",
      key: "pendingDeposit",
      render: (text, record) => {
        return (
          <Popconfirm
            title={`Are you sure to process deposit for ${record.underlyingSymbol}?`}
            onConfirm={() => processDeposit(record)}
            okText="Yes"
            cancelText="No"
          >
            {formatEther(record.pendingDeposit || "0")}
          </Popconfirm>
        );
      },
    },
    {
      title: "Pending Redeem",
      key: "pendingRedeem",
      render: (text, record) => {
        return (
          <Popconfirm
            title={`Are you sure to process redeem for ${record.underlyingSymbol}?`}
            onConfirm={() => processDeposit(record)}
            okText="Yes"
            cancelText="No"
          >
            {formatEther(record.pendingRedeem || "0")}
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Card title="Processor">
      <Table dataSource={compoundTokens} columns={columns} />
    </Card>
  );
}
