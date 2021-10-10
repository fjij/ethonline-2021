import React, { useEffect, useState } from "react";
import CollectionDisplayCard from "./CollectionDisplayCard";
import { ipfs, card, contract } from "../eth";
import "../styles/CollectionDisplayCard.css";

interface CardProps {
  id: number;
  name: string;
  image: string;
  attack: number;
  points: number;
  description: string;
}

const cards: CardProps[] = [];

export default function MyCollection() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    contract.getCount().then(count => setCount(count));
  }, []);

  return (
    <>
      <div className="heading">
        <section className="collection">
          {Array.from(Array(count).keys()).map((id) => (
            <div className="collection-slot">
              <CollectionDisplayCard id={id} key={id} />
              <br />
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

function Collection() {
  return (
    <section className="collection">
      {cards.map((card) => {
        return <CardDisplay {...card}></CardDisplay>;
      })}
    </section>
  );
}

function CardDisplay(props: CardProps) {
  const { name, image, description } = props;
  return (
    <article className="collection-card">
      <section className="center">
        <img src={image}></img>
        <h3>{name}</h3>
      </section>
      <p className="collection-card-desc">{description}</p>
    </article>
  );
}
