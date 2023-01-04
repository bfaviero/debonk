import axios from 'axios';
import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react'

import * as web3 from '@solana/web3.js';
import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

const DUST = "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ"
const DUST_DECIMALS = 9
const BONK = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
const BONK_DECIMALS = 5

const HELIUS_RPC = process.env.REACT_APP_HELIUS_RPC
const HELIUS_KEY = process.env.REACT_APP_HELIUS_KEY
const ALCHEMY_RPC = process.env.REACT_APP_ALCHEMY_RPC

function dustAmountToDecimals(amount) {
  return (amount / Math.pow(10, DUST_DECIMALS))
}

function bonkAmountToDecimals(amount) {
  const number = amount / Math.pow(10, BONK_DECIMALS)
  return number.toLocaleString("en-US")
}

const getBalance = async (provider, mint) => {
  const walletAddress = provider.publicKey.toString()
  const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${HELIUS_KEY}`
  const { data } = await axios.get(url)
  const token_data = data.tokens.filter(token => token.mint === mint)[0]
  return token_data?.amount || 0
}


const getProvider = async () => {
  if ('phantom' in window) {
    const provider = window.phantom?.solana;

    if (provider?.isPhantom) {
      try {
          const resp = await provider.connect();
          console.log(resp.publicKey.toString());
          // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo 
      } catch (err) {
          // { code: 4001, message: 'User rejected the request.' }
      }
      return provider;
    }
  } 
  window.alert("No Phantom")
  return null
} 

// async sentTJSOL() {
//   const provider = await getProvider()
//   const toPubkey = new web3.PublicKey("AHW1AAa4SQQT2AW42mmrXgPTy3YcWGeFx659ne1oynUs")

//   let connection = new web3.Connection(ALCHEMY_RPC);
//   var transaction = new web3.Transaction().add(
//      web3.SystemProgram.transfer({
//        fromPubkey: provider.publicKey,
//        toPubkey,
//        lamports: web3.LAMPORTS_PER_SOL * .01
//      }),
//    );

//    // Setting the variables for the transaction
//    transaction.feePayer = provider.publicKey;
//    let blockhashObj = await connection.getRecentBlockhash();
//    transaction.recentBlockhash = await blockhashObj.blockhash;

//    // Transaction constructor initialized successfully
//    if(transaction) {
//      console.log("Txn created successfully");
//    }
//    const { signature } = await provider.signAndSendTransaction(transaction);
//    await connection.getSignatureStatus(signature);

// };

async function swap(amount, fromMint, toMint) {
  const provider = await getProvider()

  const data = await fetch(`https://quote-api.jup.ag/v3/quote?inputMint=${fromMint}&outputMint=${toMint}&amount=${amount}&slippageBps=50`)
  const json = await data.json()
  const route = json.data[0]
  const transactionsFetch = await fetch("https://quote-api.jup.ag/v3/swap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route,
      userPublicKey: provider.publicKey.toString(),
      wrapUnwrapSOL: true,
      feeAccount: provider.publicKey.toString(),
    }),
  });
  const {swapTransaction} = await transactionsFetch.json()
  const transaction = web3.Transaction.from(
    Buffer.from(swapTransaction, "base64")
  );
  let connection = new web3.Connection(
    "https://solana-mainnet.g.alchemy.com/v2/_a7JrYMcKhlUiLbwz3cP50l4ak-zwyxC"
  );
  const { signature } = await provider.signAndSendTransaction(transaction);
  console.log("Submitting transaction")
  await connection.getSignatureStatus(signature);
  console.log("done!")
}


function App() {

  const [dustBalance, setDustBalance] = useState(null);
  const [bonkBalance, setBonkBalance] = useState(null);

  useEffect(() => {
    const setBalances = async () => {
      const provider = await getProvider()
      const _dustBalance = await getBalance(provider, DUST)
      const _bonkBalance = await getBalance(provider, BONK)
      setDustBalance(_dustBalance)
      setBonkBalance(_bonkBalance)
    }
    setBalances()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={"https://static.wixstatic.com/media/0dd979_e9164d362411411eb680e426d4b49501~mv2.png/v1/crop/x_759,y_0,w_4961,h_4961/fill/w_960,h_960,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/BonkLogo%20copy.png"} className="App-logo" alt="logo" />
        <br />
        {bonkBalance != null &&
          <span>You have {bonkAmountToDecimals(bonkBalance)} $BONK</span>
        }
        {dustBalance != null &&
          <span>You have {bonkAmountToDecimals(dustBalance)} DUST</span>
        }
        <br/>
        <a 
          onClick={() => swap(dustBalance, DUST, BONK)} 
          style={{cursor: "pointer", textDecoration: "underline"}}
        >
          DUST -> BONK
        </a>
        <br/>
        <a 
          onClick={() => swap(dustBalance, BONK, DUST)} 
          style={{cursor: "pointer", textDecoration: "underline"}}
        >
          BONK -> DUST
        </a>
      </header>
    </div>
  );
}



export default App;
