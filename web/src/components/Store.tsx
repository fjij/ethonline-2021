import React from "react";
import "../styles/Store.css";
import banner0 from "../assets/oroeginsBanner.png";
import placeholderbanner from "../assets/placeholderbanner.png";
import { Link } from "react-router-dom";

interface StoreBannerProps {
  img: string;
  name: string;
  to: string;
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
  const { img, name, to } = props;
  return (
    <Link to={to}>
      <article className="set-placeholder">
        <img className={name} src={img}></img>
      </article>
    </Link>
  );
};

const banners = [
  {
    img: banner0,
    name: "oroegins",
    to: "/collection/oroegin",
  },
  {
    img: placeholderbanner,
    name: "set-placeholder",
    to: "/store",
  },
  {
    img: placeholderbanner,
    name: "set-placeholder",
    to: "/store",
  },
  {
    img: placeholderbanner,
    name: "set-placeholder",
    to: "/store",
  },
];
