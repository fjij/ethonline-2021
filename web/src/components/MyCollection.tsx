import React from 'react';
import Card from './Card';

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
        <Card id={1} />
        <Card id={1} />
        <Card id={1} />
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
};

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
};
