import React from "react";
import "../styles/Rules.css";
import explanation from "../assets/visual-explanation.png";

export default function Rules() {
  return (
    <>
      <div className="heading"></div>
      <div className="rules">
        <h4 className="rules-title">Rules:</h4>

        <li>Each player will play 1 card per turn</li>
        <li>
          Players draw a card at the beginning of each turn if they have less
          than 4 cards
        </li>
        <li>The card with the higher power wins the round </li>
        <li>Everytime your card wins, you draw a hero</li>
        <li>When you win with three hero cards, you win the game</li>
        <li>If a player is out of cards, they lose</li>
      </div>
      <TableEffects />

      <img className="explanation-img" src={explanation} alt="explanation"></img>
    </>
  );
}

const TableEffects = () => {
  return (
    <>
      <div className="effect-explanation">
        <table>
          <tr>
            <th>Name of Ability</th>
            <th>Effect</th>
            <th>Priority</th>
          </tr>
          <tr>
            <td>Flip</td>
            <td>If heads, activate heads effect, else activate loss effect</td>
            <td>Normal</td>
          </tr>
          <tr>
            <td>Inflict</td>
            <td>Inflict an effect on the opponents card</td>
            <td>Normal</td>
          </tr>
          <tr>
            <td>Empower</td>
            <td>The card you play next turn gains an effect</td>
            <td>Normal</td>
          </tr>
          <tr>
            <td>Swap</td>
            <td>Swap the power numbers on each active card</td>
            <td>Slow</td>
          </tr>
          <tr>
            <td>+</td>
            <td>Increase the power number by a number</td>
            <td>Normal</td>
          </tr>
          <tr>
            <td>Discard</td>
            <td>Discard a number of cards from your hand</td>
            <td>Normal</td>
          </tr>
          <tr>
            <td>Immune</td>
            <td>Unaffected by your opponent's effects</td>
            <td>Fast</td>
          </tr>
          <tr>
            <td>Draw</td>
            <td>Draw a number of cards from your deck</td>
            <td>Normal</td>
          </tr>
          <tr>
            <td>Squelch</td>
            <td>Your opponents effect's are nullified</td>
            <td>Fast</td>
          </tr>
        </table>
      </div>
    </>
  );
};
