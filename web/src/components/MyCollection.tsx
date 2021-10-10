import React from "react";
import CollectionDisplayCard from "./CollectionDisplayCard";
import { ipfs, card } from "../eth";
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
  return (
    <>
      <div className="heading">
        <h1>Card Collection</h1>

        <section className="collection">
          {Array.from(Array(43).keys()).map((id) => (
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
