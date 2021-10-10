import React, { useState, useEffect } from "react";
import { ipfs, card } from "../eth";
import { interactions } from "../game";
import "../styles/CollectionDisplayCard.css";
import placeholder from "../assets/placeholder.png";

interface CardProps {
  id: number;
  zoom?: boolean;
  onClick?: () => void;
  small?: boolean;
}

export default function Card({ id, zoom, onClick }: CardProps) {
  const [data, setData] = useState<card.CardData | undefined>();
  useEffect(() => {
    card.getCardData(id).then((data) => setData(data));
  }, [id]);
  return (
    <div className="collection-card">
      <div className="collection-card-picture">
        <img src={data ? ipfs.getHttpMirror(data.image) : placeholder} />
      </div>
      <div className="collection-card-text">
        {data && (
          <div>
            <h2 className="collection-card-name">{data.name}</h2>
            <div className=".collection-card-info">
              {data.keywords
                .map(interactions.keywordToText)
                .map((text, idx) => (
                  <h3 key={idx}>Ability: {text}.</h3>
                ))}
              <h3>Power: {data.power}</h3>
              <h3>Rarity: {data.rarity}</h3>
              <div className="line"></div>
              <h4 className="collection-card-description">
                {data.description}
              </h4>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
