import React, { useState, useEffect } from 'react';
import { contract, ipfs } from '../eth';
import '../styles/Card.css';
import placeholder from '../assets/placeholder.png';

interface CardProps {
  id: number;
  zoom?: boolean;
}


interface Inflict {
  name: 'inflict';
  keywords: Keyword[];
}

interface Discard {
  name: 'discard';
  value: number;
}

interface Empower {
  name: 'empower';
  keywords: Keyword[];
}

interface Flip {
  name: 'flip';
  keywords: Keyword[];
}

interface Swap {
  name: 'swap';
}

interface Plus {
  name: 'plus';
  value: number;
}

interface Immune {
  name: 'immune';
}

interface Squelch {
  name: 'squelch';
}

interface Draw {
  name: 'draw';
  value: number
}

type Keyword = Flip |
  Inflict |
  Empower |
  Swap |
  Plus |
  Discard |
  Immune |
  Draw |
  Squelch;

interface CardData {
  name: string;
  description: string;
  image: string;
  power: number;
  keywords: Keyword[];
}

function keywordToText(kw: Keyword): string {
  switch(kw.name) {
    case 'draw': {
      return `Draw ${kw.value}`;
    }
    case 'squelch': {
      return 'Squelch';
    }
    case 'immune': {
      return 'Immune';
    }
    case 'plus': {
      if (kw.value >= 0) {
        return `+${kw.value}`;
      } else {
        return `${kw.value}`;
      }
    }
    case 'swap': {
      return 'Swap';
    }
    case 'flip': {
      return `Flip: (${keywordToText(kw.keywords[0])}) | (${keywordToText(kw.keywords[1])})`;
    }
    case 'empower': {
      return `Empower: ${kw.keywords.map(keywordToText).join(', ')}`;
    }
    case 'discard': {
      return `Discard ${kw.value}`;
    }
    case 'inflict': {
      return `Inflict: ${kw.keywords.map(keywordToText).join(', ')}`;
    }
  }
}

export default function Card({ id, zoom }: CardProps) {
  const [data, setData] = useState<CardData | undefined>();
  useEffect(() => {
    contract.getUri(id).then(async uri => {

      console.log(uri)
      setData(await ipfs.getData(uri));
    });
  }, [id]);
  return (
    <div className={'card-container' + (zoom ? ' zoom': '')}>
      <img
        className='card'
        src={data ? ipfs.getHttpMirror(data.image) : placeholder}
      />
      { data && <>
        <h2 className='card-power'>{ data.power }</h2>
        <h4 className='card-text'>{ data.name }</h4>
        { data.keywords.length > 0 &&
          <div className='card-rulebox'>
            { data.keywords.map(keywordToText)
              .map((text, idx) => <h5 key={idx}>{text}.</h5>)
            }
          </div>
        }
      </> }
    </div>
  );
}
