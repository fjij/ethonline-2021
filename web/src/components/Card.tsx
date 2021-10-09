import React, { useState, useEffect } from 'react';
import { contract, ipfs } from '../eth';
import '../styles/Card.css';
import placeholder from '../assets/placeholder.png';

interface CardProps {
  id: number;
  zoom?: boolean;
}

interface CardData {
  name: string;
  description: string;
  image: string;
}

export default function Card({ id, zoom }: CardProps) {
  const [data, setData] = useState<CardData | undefined>();
  useEffect(() => {
    contract.getUri(id).then(async uri => {
      setData(await ipfs.getData(uri));
    });
  }, [id]);
  return (
    <div className={'card-container' + (zoom ? ' zoom': '')}>
      <img
        className='card'
        src={data ? ipfs.getHttpMirror(data.image) : placeholder}
      />
      <h3 className='card-text'>{ data ? data.name : 'Card' }</h3>
    </div>
  );
}
