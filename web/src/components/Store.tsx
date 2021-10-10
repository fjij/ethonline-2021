import React from "react";
import "../styles/Store.css";
import banner0 from "../assets/oroeginsBanner.png";
import placeholderbanner from "../assets/placeholderbanner.png";

interface StoreBannerProps {
  img: string;
  name: string;
}

export default function Store() {
  return (
    <>
      <div className="heading"></div>
      <div className="banners">
        {banners.map((banner) => {
          return <StoreBanner {...banner}></StoreBanner>;
        })}
      </div>
    </>
  );
}

const StoreBanner = (props: StoreBannerProps) => {
  const { img, name } = props;
  return (
    <article className="set-placeholder">
      <img className={name} src={img}></img>
    </article>
  );
};

const banners = [
  {
    img: banner0,
    name: "oroegins",
  },
  {
    img: placeholderbanner,
    name: "set-placeholder",
  },
  {
    img: placeholderbanner,
    name: "set-placeholder",
  },
  {
    img: placeholderbanner,
    name: "set-placeholder",
  },
];
