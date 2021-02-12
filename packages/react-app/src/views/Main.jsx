/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { parseEther, formatEther } from "@ethersproject/units";
import axios from 'axios';

const COMPOUND_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2'
const QUERY_COMPOUND_TOKENS = `
{
  markets(first: 7) {
    name
    supplyRate
    symbol
    id
    underlyingAddress
    underlyingName
    underlyingSymbol
    underlyingPriceUSD
  }
} `

export default function ExampleUI({purpose, setPurposeEvents, address, mainnetProvider, userProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts }) {
  const [compoundTokens, setCompoundTokens] = useState([]);

  axios.post(COMPOUND_SUBGRAPH, { query: QUERY_COMPOUND_TOKENS }).then(console.log)

  return (
    <div>



    </div>
  );
}
