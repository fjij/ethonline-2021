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
          return <HomeCard key={card.id} {...card}></HomeCard>;
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
          <img src={img} alt={text} />
        </section>
        <br />
        <span className="blocky">{text}</span>
      </article>
    </Link>
  );
};

const homeInfo = [
  {
    id: 2,
    img: "https://ipfs.io/ipfs/bafybeib5v6ff5r35c6tmoxon3zxejumckft5hqr4hh77rnqb6ss5575ojm/37-the%20boys.png",
    text: "Rules",
    link: "/rules",
  },
  {
    id: 1,
    img: "https://ipfs.io/ipfs/bafybeib5v6ff5r35c6tmoxon3zxejumckft5hqr4hh77rnqb6ss5575ojm/9-overtime%20dude.png",
    text: "Play",
    link: "/play",
  },
  {
    id: 3,
    img: "https://ipfs.io/ipfs/bafybeib5v6ff5r35c6tmoxon3zxejumckft5hqr4hh77rnqb6ss5575ojm/22-a%20nime%20lily.png",
    text: "Collections",
    link: "/store",
  },
];
