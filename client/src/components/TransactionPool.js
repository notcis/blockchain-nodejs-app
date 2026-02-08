import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Transaction from "./Transaction";
import { Button } from "react-bootstrap";
import history from "../history";

const POLL_INTERVAL_MS = 10000;

export default function TransactionPool() {
  const [transactionPoolMap, setTransactionPoolMap] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const fetchTransactionPoolMap = async () => {
        try {
          const response = await fetch(
            `${document.location.origin}/api/transaction-pool-map`,
          );
          const json = await response.json();
          console.log("Fetched transaction pool map:", json);
          setTransactionPoolMap(json);
        } catch (error) {
          console.error("Error fetching transaction pool map:", error);
          setTransactionPoolMap({});
        }
      };
      fetchTransactionPoolMap();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const fetchMineTransactions = () => {
    fetch(`${document.location.origin}/api/mine-transactions`).then(
      (response) => {
        if (response.status === 200) {
          alert("success");
          history.push("/blocks");
        } else {
          alert("The mine-transactions block request did not complete");
        }
      },
    );
  };

  return (
    <div className="TransactionPool">
      <div>
        <Link to="/">Home</Link>
      </div>
      <h3>Transaction Pool</h3>
      {Object.values(transactionPoolMap).map((transaction) => (
        <div key={transaction.id}>
          <hr />
          <Transaction transaction={transaction} />
        </div>
      ))}
      <hr />
      <Button bsStyle="danger" onClick={fetchMineTransactions}>
        Mine Transactions
      </Button>
    </div>
  );
}
