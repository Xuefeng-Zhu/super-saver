/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useCallback, useEffect, useState } from "react";
import _ from "lodash";
import { Button, List, Divider, Input, Card, Col, Row, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { parseEther, formatEther } from "@ethersproject/units";
import axios from "axios";

import { useContractLoader, useContractExistsAtAddress } from "../hooks";
import { Transactor } from "../helpers";
import { SaverTable, ProcessorTable } from "../components";

const COMPOUND_SUBGRAPH = "https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2";
const INCH_API = "https://api.1inch.exchange/v2.0";
const QUERY_COMPOUND_TOKENS = `
{
  markets {
    name
    supplyRate
    symbol
    id
    underlyingAddress
    underlyingName
    underlyingSymbol
    underlyingPriceUSD
  }
} `;

const QUERY_TOKEN_PROFILE = `
{
  tokenProfiles {
    id
    pendingDeposit
    pendingRedeem
  }
} `;

const getUserTokenProfilesQuery = sender => `
{
  userTokenProfiles(where: { sender: "${sender}" }) {
    token
    pending
    locked
    redeem
  }
}`;

export default function Main({ provider, signer, account, subgraphUri }) {
  const [compoundTokens, setCompoundTokens] = useState([]);
  const contracts = useContractLoader(provider);
  const contract = contracts && contracts["SuperSaver"].connect(signer);
  const tx = Transactor(provider, null);

  const loadData = useCallback(async () => {
    let res = await axios.get(`${INCH_API}/tokens`);
    const tokenIcons = _.mapKeys(res.data.tokens, token => token.symbol);

    res = await axios.post(subgraphUri, { query: QUERY_TOKEN_PROFILE });
    console.log(res);
    const tokenBalances = _.mapKeys(res.data.data.tokenProfiles, profile => profile.id);

    res = await axios.post(subgraphUri, { query: getUserTokenProfilesQuery(account) });
    console.log(res, account);
    _.forEach(_.get(res, "data.data.userTokenProfiles"), profile => {
      tokenBalances[profile.token] = {
        ...tokenBalances[profile.token],
        ...profile,
      };
    });

    res = await axios.post(COMPOUND_SUBGRAPH, { query: QUERY_COMPOUND_TOKENS });
    setCompoundTokens(
      _.map(res.data.data.markets, market => {
        market.icon = tokenIcons[market.underlyingSymbol].logoURI;
        const tokenBalance = tokenBalances[market.underlyingAddress];

        return {
          ...market,
          ...tokenBalance,
        };
      }),
    );
  }, [setCompoundTokens, account]);

  useEffect(() => {
    loadData();
  }, [loadData, account]);

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <SaverTable
            provider={provider}
            compoundTokens={compoundTokens}
            contract={contract}
            tx={tx}
            account={account}
            subgraphUri={subgraphUri}
          />
        </Col>
        <Col span={12}>
          <ProcessorTable
            provider={provider}
            compoundTokens={compoundTokens}
            contract={contract}
            tx={tx}
            account={account}
            subgraphUri={subgraphUri}
          />
        </Col>
      </Row>
    </div>
  );
}
