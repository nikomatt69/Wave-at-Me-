import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

export default function App() {

  const [totalWaves, setTotalWaves] = useState(0);
  const [waveMessage, setWaveMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [allWaves, setAllWaves] = useState([]);
  const [infoMessage, setInfoMessage] = useState("");
  
  const [currentAccount, setCurrentAccount] = useState("");

  const contractAddress = "0xeE904eF6010C1c4E72f11670879E6Bc32Da614bd";
  const contractABI = abi.abi;
  
  const checkIfWalletIsConnected = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
        console.log("Wallet Not Connected");
        return;
      } 
      console.log("Wallet found");
      const accounts = await ethereum.request({method: "eth_accounts"});
  
      if (accounts.length != 0){
        const account = accounts[0];
        console.log("Found authorized account :", account);
        setCurrentAccount(account);
      } else {
        console.log("No Authorized account found");
      }
      
    } catch (error) {
      console.log(error);      
    }
    
  }

  const connectWallet = async () => {
    console.log("Clicked")
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Wallet Not Found");
        return;
      } 
  
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
  
      if(accounts.length != 0){
        const account = accounts[0];
        console.log("Connected to : ", account);
        setCurrentAccount(account);
      } else{
        console.log("No accounts found");
      }     
    } catch (error) {
      console.log(error);
    }
    
  }

  const getAllWaves = async () => {
    try{
      const {ethereum} = window;

      if(!ethereum){
        console.log("Ethereum not found");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const waveContract = new ethers.Contract(contractAddress, contractABI, signer);

      let allWaves = await waveContract.getAllWaves();
      setTotalWaves(allWaves.length)

      let wavesList = [];

      allWaves.forEach(wave => {
        wavesList.push({
          waver: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        })
      }) 

      setAllWaves(wavesList);
      
    }catch(error){
      console.log(error);
    } 
  }

  const handleWaveMessage = async (event) =>{
    setWaveMessage(event.target.value)
  }

  
  const wave = async () => {
    try{
      const {ethereum} = window;

      if (ethereum){
        setLoading(true);
        setInfoMessage("Transaction Initiated");
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const waveContract = new ethers.Contract(contractAddress, contractABI, signer);
        let totalWavesCount = await waveContract.getTotalWaves();
        console.log("Total waves count from contract : ", totalWavesCount.toNumber());
        setTotalWaves(totalWavesCount.toNumber());

        const waveTx = await waveContract.wave(waveMessage, {gasLimit:300000});
        console.log("Mining ... ", waveTx.hash)

        await waveTx.wait();
        console.log("Mined ... ", waveTx.hash);

        totalWavesCount = await waveContract.getTotalWaves();
        console.log("Total waves count from contract : ", totalWavesCount.toNumber());
        setTotalWaves(totalWavesCount.toNumber());
        setInfoMessage("Transaction Completed Successfully");
        // getAllWaves();
        setWaveMessage("");
        setLoading(false);
      } else {
        console.log("Ethereum object does not exist");
        setInfoMessage("Ethereum object does not exist");
      }

      
    }catch (error){
      console.log(error);
      setInfoMessage(error.Error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    // getAllWaves();

    let waveContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("New Event", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
       {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message, 
      },
      ]);
    }

    if (window.ethereum){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const waveContract = new ethers.Contract(contractAddress, contractABI, signer);
      waveContract.on("NewWave", onNewWave);
    }

    return () => {
      if(waveContract){
        waveContract.off("NewWave", onNewWave);
      }
    }
    
  }, []);  
  
  return (
    <div className="mainContainer">
      
    <div className="infoContainer"> 
 
    </div>
      
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!I'm Nikomatt.eth
        </div>

        <div className="bio">
          {!currentAccount && ("Connect your Ethereum wallet.") } 
          <br />
          Wave at me
      
        </div>
        <div>
          <textarea className="waveMessage" value={waveMessage} onChange={handleWaveMessage}></textarea>
        </div>
        <button className="waveButton" onClick={wave}>
          {loading? 'Loading...' : 'Wave at Me'}
        </button>
        <br />
        <div className="infoMessage">{infoMessage}</div>
        
        {!currentAccount && (
        
        <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
        </button>    
        )
        }
        <div style={{ marginTop: "16px", padding: "8px" }}>
          Total Waves So Far = {totalWaves}.
        </div>
        {allWaves.map((wave, index) => {
          return(
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
        
      </div>
    </div>
  );
}
