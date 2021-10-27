import React, { useState, useEffect } from "react";
import { ipfs, card } from "../eth";
import { interactions } from "../game";
import "../styles/Card.css";
import placeholder from "../assets/placeholder.png";

interface CardProps {
  id: number;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  hero?: boolean;
}

export default function Card({
  id,
  onClick,
  selected,
  disabled,
  hero,
}: CardProps) {
  const [data, setData] = useState<card.CardData | undefined>();
  useEffect(() => {
    card.getCardData(id).then((data) => setData(data));
  }, [id]);

  function maybeClass(enabled: boolean | undefined, name: string) {
    return enabled ? ` ${name}` : "";
  }
  return (
    <div
      className="card-container"
      onClick={() => (onClick && !disabled ? onClick() : null)}
    >
      <img
        className={
          "card" +
          maybeClass(selected, "selected") +
          maybeClass(disabled, "disabled") +
          maybeClass(hero, "hero")
        }
        alt={data ? data.name : "placeholder"}
        src={data ? ipfs.getHttpMirror(data.image) : placeholder}
      />
      {data && (
        <>
          <h2 className="card-power">{data.power}</h2>
          <h4 className="card-text">{data.name}</h4>
          {data.keywords.length > 0 && (
            <div className="card-rulebox">
              {data.keywords
                .map(interactions.keywordToText)
                .map((text, idx) => (
                  <h5 key={idx}>{text}.</h5>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
