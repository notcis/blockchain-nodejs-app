import React, { useEffect, useState } from "react";
import { FormGroup, FormControl, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import history from "../history";

export default function ConductTransaction() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0);
  const [knownAddresses, setKnownAddresses] = useState([]);

  useEffect(() => {
    fetchKnownAddresses();
  }, []);

  const fetchKnownAddresses = async () => {
    fetch(`${document.location.origin}/api/known-addresses`)
      .then((response) => response.json())
      .then((json) => setKnownAddresses(json));
  };

  const conductTransaction = async () => {
    fetch(`${document.location.origin}/api/transact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient, amount }),
    })
      .then((response) => response.json())
      .then((json) => {
        alert(json.message || json.type);
        history.push("/transaction-pool");
      });
  };
  return (
    <div className="ConductTransaction">
      <Link to="/">Home</Link>
      <h3>Conduct a Transaction</h3>
      <br />
      {knownAddresses.map((knownAddress) => (
        <div key={knownAddress}>
          <div>{knownAddress}</div>
          <br />
        </div>
      ))}
      <br />
      <FormGroup>
        <FormControl
          input="text"
          placeholder="recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <FormControl
          input="number"
          placeholder="amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </FormGroup>
      <Button bsStyle="danger" onClick={conductTransaction}>
        Submit
      </Button>
    </div>
  );
}
