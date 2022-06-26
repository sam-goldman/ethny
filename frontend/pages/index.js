import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {useState, useEffect} from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SketchPicker, AlphaPicker, BlockPicker, ChromePicker, CirclePicker } from 'react-color'
import { ethers, utils } from "ethers"
import abi from "../utils/Grid.json"

export default function Home() {
  var plots = [];
  const contractABI = abi.abi;
  const contractAddress = "0x0789965e9E6617F4375B0f787038fbA4c3059c04";
  useEffect(() => {
    console.log('EFFECT USED')
    //@TODO: call rgb value per plot/ values per plot
    loadPlots();
    checkPlots();
  }, []);
  const [color, setColor] = useState("#fff");
  const [plotsPurchase, setPlotsPurchase] = useState([])
  const [contract, setContract] = useState()
  // const [plots, setPlots{purchased:"false"}] = useState([])
  const handleChangeComplete = (myColor) => {
    setColor({ background: myColor.hex });
    console.log(color)
  };

  const loadPlots = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        for (var i = 0; i < 9; i++) {
          if (plotsPurchase.includes(i)) {
            plots.push( <div key={i} class="box-content h-20 w-20 border-2 bg-gray-300"/>)
          } else {
            const hexCode = await contract.tokenURI(i);
            const style = `box-content h-20 w-20 border-2 bg-[#${hexCode.substring(2)}] cursor-pointer`
            plots.push(
              <div key={i}
                class={style}
                onClick={() => {
                    setPlotsPurchase(prevPlots => [...prevPlots, i]);
                  }
                }>
              </div>
            )
          }
          console.log(plots)
        }
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkPlots = () => {

  }

  // for (var i = 0; i < 100; i++) {
  //   if(plotsPurchase.includes(i)){
  //     <div key={i} class="box-content h-20 w-20 border-2 bg-gray-300"/>
  //   }
  //   plots.push( <div key={i} class="box-content h-20 w-20 border-2 hover:bg-gray-300 cursor-pointer" onClick={() => {
  //     setPlotsPurchase(prevPlots => [...prevPlots, i]);
  //     console.log(plotsPurchase);
  //   }}></div>); // TODO render rgb value per plot
  // }

  const purchase = async () => {
    // try {
    //   const { ethereum } = window;
    //   if (ethereum) {
    //     const provider = new ethers.providers.Web3Provider(ethereum);
    //     const signer = await provider.getSigner();

    //     const purchase = await contract.batchMint(plotsPurchase);
    //     console.log("Mining...", purchase.hash);

    //     await purchase.wait();
    //     console.log("Mined -- ", purchase.hash);

    //   } else {
    //     console.log("Ethereum object doesn't exist!");
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
  }



  return (
    <>
      <div className="min-w-screen min-h-screen flex justify-center p-10">
        <div className="px-4" style={{ maxWidth: '1600px' }}>     
         <div className="flex flex-row justify-between">
        <span class="text-red-500 text-5xl mb-4 font-bold px-2...">
            <p>the</p>BAZILLI🔴N<br/>
            dollar homepage
        </span>
        <ChromePicker color={color} onChangeComplete={handleChangeComplete}/>
        </div>
        <ConnectButton class="py-2"/>

          <button onClick={purchase} className="font-bold mt-4 bg-red-500 text-white rounded p-4 shadow-lg hover:bg-gray-700">
            purchase!
          </button>
          <div class="grid grid-cols-10 gap-0 py-10">
            {plots}
          </div>
        </div>
      </div>
    </>

  )
}
