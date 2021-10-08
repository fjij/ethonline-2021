import React from 'react';

interface Card {
  id: number;
  name: string;
  image: string;
  attack: number;
  points: number;
  description: string;
}

const cards: Card[] = [];

export default function MyCollection() {
  return (
    <>
      <div className="heading">
        <h1>Card Collection</h1>
      </div>
    </>
  );
}

const Collection = () => {
  return (
    <section className="collection">
      {cards.map((card) => {
        return <CardLoader {...card}></CardLoader>;
      })}
    </section>
  );
};

const CardLoader = (props: Card) => {
  const { id, name, image, attack, points, description } = props;
  return (
    <article className="card">
      <section className="center">
        <img src={image}></img>
        <h3>{name}</h3>
      </section>
      <p className="card-desc">{description}</p>
    </article>
  );
};