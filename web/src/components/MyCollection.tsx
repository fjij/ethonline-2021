import React, { useEffect, useState } from "react";
import CollectionDisplayCard from "./CollectionDisplayCard";
import { contract } from "../eth";
import { StoreBanner } from './Store';
import "../styles/CollectionDisplayCard.css";
import banner0 from "../assets/oroeginsBanner.png";

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
