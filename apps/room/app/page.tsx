import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import Navigation from "./components/Navigation";



export default function Home() {
  return (
    <div className="">
      <Navigation/>
    </div>
  );
}
