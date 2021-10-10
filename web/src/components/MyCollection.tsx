import React, { useEffect, useState } from "react";
import CollectionDisplayCard from "./CollectionDisplayCard";
import { ipfs, card, contract } from "../eth";
import { StoreBanner } from './Store';
import "../styles/CollectionDisplayCard.css";
import banner0 from "../assets/oroeginsBanner.png";

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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    contract.getCount().then(count => setCount(count));
  }, []);

  async function buy() {
    if (count > 0) {
      setPending(true);
      try {
        await contract.mintBatch(
          Array.from(Array(count).keys()), 
          Array.from(Array(count).keys()).map(_ => 1), 
        );
      } catch {
        setError(true);
      }
    }
  }

  return (
    <>
      <div className="heading">
        <div className="collection-buy-box">
          <StoreBanner img={banner0} to='/collection/oroegin' name='oroegins' />
          <button onClick={buy} className='buy-button' disabled={pending || error}>
            <b>{error?'Error. Try again later.':'Purchase Collection'}</b>
          </button>
        </div>
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
