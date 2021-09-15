import { LitElement, html } from "./lit/lit.all.js";

class PubTriviaScoreboard extends LitElement {
  static get properties() {
    return {
      _teams: { type: Array, state: true },
    }
  }

  constructor() {
    super();
    this._teams = [];
    document.body.addEventListener("PointScored", player => {
      this.requestUpdate();
    });
  }

  setTeams(teams) {
    this._teams = [...teams];
    this.requestUpdate();
  }

  render() {
    return html`
      <div id="scoreboard-teams">
        ${this._teams.map(
          players => {
            return html`
            <pub-trivia-team
              .players = ${players}
            />
          `
          }
        )}
    `;
  }
}

customElements.define("pub-trivia-scoreboard", PubTriviaScoreboard);

class PubTriviaTeam extends LitElement {
  static get properties() {
    return {
      players: { type: Array },
    }
  }

  constructor() {
    super();
    this.players = [];
  }

  render() {

    let sortedPlayers = this.players.sort((a, b) => {
      return a.score - b.score;
    });

    let totalScore = this.players.reduce((prev, cur, index, arr) => {
      return prev?.points || 0 + cur.points;
    }, 0);

    return html`
      <div class="team">
        <p>Total score: ${totalScore}</p>
        <ol>
          ${sortedPlayers.map(player => html`<li>${player.name}: ${player.points}</li>`)}
        </ol>
      </div>
    `;
  }
}

customElements.define("pub-trivia-team", PubTriviaTeam);


const TEAMS_OF_NAMES = [
  ["Charlie Brown", "Snoopy", "Lucy", "Linus", "Schroeder", "Peppermint Patty", "Marcie"],
  ["Captain America", "The Hulk", "Black Widow", "Iron Man", "Thor", "Hawkeye"],
  ["Picard", "Riker", "Crusher", "Data", "Troi", "Worf", "Geordi"],
  ["Mike", "Will", "Lucas", "Max", "Eleven", "Dustin"]
]

class TriviaPlayer {
  #name;
  #points;

  constructor(name) {
    this.#name = name;
    this.#points = 0;
  }

  get name() {
    return this.#name;
  }

  get points() {
    return this.#points;
  }

  scorePoint() {
    this.#points++;
  }
}

class PubTriviaGame extends EventTarget {
  #teams;

  constructor() {
    super();
    this.#teams = [];

    for (let teamOfNames of TEAMS_OF_NAMES) {
      let teamOfPlayers = [];

      for (let playerName of teamOfNames) {
        let player = new TriviaPlayer(playerName);
        teamOfPlayers.push(player);
      }

      this.#teams.push(teamOfPlayers);
    }
  }

  begin() {
    let scoreboard = document.getElementById("scoreboard");
    scoreboard.setTeams(this.#teams);

    setInterval(this.scorePoint.bind(this), 1000);
  }

  scorePoint() {
    let team = this.#teams[Math.floor(Math.random() * this.#teams.length)];
    let player = team[Math.floor(Math.random() * team.length)];
    player.scorePoint();

    console.log(player.name + " scored a point");

    this.dispatchEvent(new CustomEvent("PointScored", {
      bubbles: true,
      detail: {
        player,
      }
    }));
  }
}

new PubTriviaGame().begin();