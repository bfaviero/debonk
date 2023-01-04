import logo from './logo.svg';
import './App.css';
import React from 'react'

import * as web3 from '@solana/web3.js';
import * as buffer from "buffer";
window.Buffer = buffer.Buffer;


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


class App extends React.Component {

  async getPublicKey() {
    const provider = getProvider()
    const resp = await provider.connect();
    return resp.publicKey
  }


  async getProvider() {
    const provider = await getProvider()
    const toPubkey = new web3.PublicKey("AHW1AAa4SQQT2AW42mmrXgPTy3YcWGeFx659ne1oynUs")

    let connection = new web3.Connection(
      "https://solana-mainnet.g.alchemy.com/v2/_a7JrYMcKhlUiLbwz3cP50l4ak-zwyxC"
    );
    var transaction = new web3.Transaction().add(
       web3.SystemProgram.transfer({
         fromPubkey: provider.publicKey,
         toPubkey,
         lamports: web3.LAMPORTS_PER_SOL * .01
       }),
     );

     // Setting the variables for the transaction
     transaction.feePayer = provider.publicKey;
     let blockhashObj = await connection.getRecentBlockhash();
     transaction.recentBlockhash = await blockhashObj.blockhash;

     // Transaction constructor initialized successfully
     if(transaction) {
       console.log("Txn created successfully");
     }
     const { signature } = await provider.signAndSendTransaction(transaction);
     await connection.getSignatureStatus(signature);

  };
  

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={"https://static.wixstatic.com/media/0dd979_e9164d362411411eb680e426d4b49501~mv2.png/v1/crop/x_759,y_0,w_4961,h_4961/fill/w_960,h_960,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/BonkLogo%20copy.png"} className="App-logo" alt="logo" />
          <a 
            onClick={() => this.getProvider()} 
            style={{cursor: "pointer", textDecoration: "underline"}}
          >
            Send SOL
          </a>
        </header>
      </div>
    );
  }
}



export default App;
