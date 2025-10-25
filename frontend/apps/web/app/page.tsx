import React, { ReactNode } from "react"
import { Header } from "../components/header/Header"
import Body from '../components/body/mainBody'


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col ">
      <Header />

        <Body/>

     
    </div>
  )
}