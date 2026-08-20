import React, { useState } from "react";
import { ethers } from "ethers";
import { ABI, CONTRACT_ADDRESS, STATUS } from "./contract.js";

export default function App() {
  const [account, setAccount] = useState("");
  const [propertyId, setPropertyId] = useState("1");
  const [property, setProperty] = useState(null);
  const [history, setHistory] = useState([]);
  const [newOwner, setNewOwner] = useState("");
  const [message, setMessage] = useState("");

  async function getContract(write = false) {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = write ? await provider.getSigner() : null;

    if (signer) {
      return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    }

    return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  }

  async function connectWallet() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
    setMessage("Wallet connected.");
  }

  async function searchProperty() {
    try {
      setMessage("Loading...");
      const contract = await getContract(false);
      const p = await contract.getProperty(propertyId);
      const h = await contract.getOwnershipHistory(propertyId);

      setProperty(p);
      setHistory(h);
      setMessage("Property loaded.");
    } catch (error) {
      setMessage(error.shortMessage || error.message);
    }
  }

  async function verifyProperty() {
    try {
      const contract = await getContract(true);
      const tx = await contract.verifyProperty(propertyId);
      setMessage(`Verification transaction: ${tx.hash}`);
      await tx.wait();
      await searchProperty();
    } catch (error) {
      setMessage(error.shortMessage || error.message);
    }
  }

  async function transferProperty() {
    try {
      const contract = await getContract(true);
      const tx = await contract.transferOwnership(propertyId, newOwner);
      setMessage(`Transfer transaction: ${tx.hash}`);
      await tx.wait();
      await searchProperty();
    } catch (error) {
      setMessage(error.shortMessage || error.message);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "Arial" }}>
      <h1>Blockchain Land Registry Prototype</h1>
      <p>
        Educational prototype only. It uses dummy property records and does not
        establish legal property ownership.
      </p>

      <button onClick={connectWallet}>Connect MetaMask</button>
      <p>Connected: {account || "Not connected"}</p>

      <hr />

      <label>
        Property ID:
        <input
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
        />
      </label>
      <button onClick={searchProperty}>Search Property</button>
      <button onClick={verifyProperty}>Verify Property (Authority)</button>

      <h2>Property</h2>
      {property && (
        <pre>
          {JSON.stringify(
            {
              propertyId: property.propertyId.toString(),
              propertyNumber: property.propertyNumber,
              location: property.location,
              area: property.area.toString(),
              propertyType: property.propertyType,
              currentOwner: property.currentOwner,
              previousOwner: property.previousOwner,
              documentHash: property.documentHash,
              verified: property.verified,
              status: STATUS[Number(property.status)],
              registeredAt: property.registeredAt.toString(),
              lastTransferredAt: property.lastTransferredAt.toString()
            },
            null,
            2
          )}
        </pre>
      )}

      <h2>Transfer</h2>
      <input
        placeholder="New owner wallet address"
        value={newOwner}
        onChange={(e) => setNewOwner(e.target.value)}
      />
      <button onClick={transferProperty}>Transfer Ownership</button>

      <h2>Ownership History</h2>
      <pre>{JSON.stringify(history, null, 2)}</pre>

      <p><strong>{message}</strong></p>
    </main>
  );
}
