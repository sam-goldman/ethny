import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {useState, useEffect} from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {

  useEffect(() => {
    //@TODO: call rgb value per plot/ values per plot
  });


  const [plotsPurchase, setPlotsPurchase] = useState([])

  var plots = [];

  const purchase = () => {

  }


  for (var i = 0; i <= 1000; i++) {
      plots.push( <div key={i} class="box-content h-20 w-20 border-2 ..." onClick={() => setPlotsPurchase(prevPlots => [...prevPlots, i])}/>); // TODO render rgb value per plot
  }

  return (
    <>
      <div className="min-w-screen min-h-screen flex justify-center p-10">
        <div className="px-4" style={{ maxWidth: '1600px' }}>     
         <div className="flex flex-row justify-between">
        <span class="text-red-500 text-2xl mb-4 font-bold px-2...">
            the bazillion<br/>
            dollar homepage
        </span>        
        <ConnectButton class="py-2"/>
        </div>
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
