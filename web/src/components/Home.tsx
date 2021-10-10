import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

interface HomeCardProps {
  id: number;
  img: string;
  text: string;
  link: string;
}

export default function Home() {
  return (
    <div className="home">
      <div className="home-links">
        {homeInfo.map((card) => {
          return <HomeCard {...card}></HomeCard>;
        })}
      </div>
    </div>
  );
}

const HomeCard = (props: HomeCardProps) => {
  const { img, text, link } = props;
  return (
    <Link className="text" to={link}>
      <article className="home-card">
        <section className="center">
          <img src={img} />
        </section>
        <br />
        <span className="blocky">{text}</span>
      </article>
    </Link>
  );
};

const homeInfo = [
  {
    id: 1,
    img: "https://ipfs.io/ipfs/bafybeigrvkhrn2egu4yhjivmbd2yxqnojlbaiatfwlquuxwymi4jfhe4fu/2-roe-creature.png",
    text: "Play",
    link: "/play",
  },
  {
    id: 2,
    img: "https://ipfs.io/ipfs/bafybeigrvkhrn2egu4yhjivmbd2yxqnojlbaiatfwlquuxwymi4jfhe4fu/2-roe-creature.png",
    text: "Collection",
    link: "/myCollection",
  },
  {
    id: 3,
    img: "https://ipfs.io/ipfs/bafybeigrvkhrn2egu4yhjivmbd2yxqnojlbaiatfwlquuxwymi4jfhe4fu/2-roe-creature.png",
    text: "Store",
    link: "/store",
  },
];
