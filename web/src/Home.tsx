import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import Matchmaking from "./Matchmaking";
import ConnectWallet from "./ConnectWallet";
import { contract } from "./eth";

interface HomeCard {
  key: number;
  img: string;
  text: string;
  link: string;
}

export default function Home() {
  return (
    <>
      <div className="headings">
        <h1 className="title">Super Card Game</h1>
        <ConnectWallet />
      </div>
      <div className="links">
        {homeInfo.map((card) => {
          return <CreateHomeCard {...card}></CreateHomeCard>;
        })}
      </div>
    </>
  );
}

const CreateHomeCard = (props: HomeCard) => {
  const { img, text, link } = props;
  return (
    <>
      <Link className="text" to={link}>
        <article className="card">
          <section className="center">
            <img src={img} />
          </section>
          <p className="spacing">{text}</p>
        </article>
      </Link>
    </>
  );
};

const homeInfo = [
  {
    key: 1,
    img: "https://ipfs.io/ipfs/bafybeigrvkhrn2egu4yhjivmbd2yxqnojlbaiatfwlquuxwymi4jfhe4fu/2-roe-creature.png",
    text: "Play",
    link: "/play",
  },
  {
    key: 2,
    img: "https://ipfs.io/ipfs/bafybeigrvkhrn2egu4yhjivmbd2yxqnojlbaiatfwlquuxwymi4jfhe4fu/2-roe-creature.png",
    text: "Collection",
    link: "/myCollection",
  },
  {
    key: 3,
    img: "https://ipfs.io/ipfs/bafybeigrvkhrn2egu4yhjivmbd2yxqnojlbaiatfwlquuxwymi4jfhe4fu/2-roe-creature.png",
    text: "Store",
    link: "/store",
  },
];
