import React from "react";
import ReactDOM from "react-dom";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import "./index.css";
import App from "./App";

let subgraphUri = "https://api.thegraph.com/subgraphs/name/xuefeng-zhu/super-saver";

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App subgraphUri={subgraphUri} />
  </ApolloProvider>,
  document.getElementById("root"),
);
