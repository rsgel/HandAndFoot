# Hand and Foot Scorer

A small web app for tracking scores in the card game **Hand and Foot**. It is built with [Astro](https://astro.build/), React and Tailwind CSS.

The application lets two teams record their points across four rounds, automatically calculating bonuses and penalties. You can share the current game state via the **Copy Game Link** button, which encodes the match data into the URL hash.

## Installation

1. Install dependencies using npm:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   The site will be available at `http://localhost:4321`.

For a production build run `npm run build` and preview it with `npm run preview`.

## How to Play and Score

Hand and Foot is played in four rounds with increasing meld requirements of 50, 90, 120 and 150 points. Each team has a **hand** of 11 cards and a **foot** of 15 cards. Books consist of seven cards of the same rank.

The scoring categories used in this app are:

### Books
- **Red (clean)** &ndash; 500 points
- **Black (dirty)** &ndash; 300 points
- **Sevens** &ndash; 5000 points
- **Fives** &ndash; 3000 points
- **Wilds** &ndash; 2500 points

### Card Points
Enter the total value of all melded cards. Card values are:
- Jokers: 50 points
- Aces and 2s: 20 points
- 8 through King: 10 points
- 4 through 7: 5 points

### Penalties
- Black 3s left in hand/foot: **-100** each
- Red 3s left in hand/foot: **-500** each
- Points from any remaining cards are subtracted from the score

### Bonuses
- Going out: **+100** points
- Red 3s collected: **+100** each
- Collecting all seven red 3s gives an extra **+300** points

At the end of each round the total is computed from the values above. The team with the highest cumulative score after all rounds wins.

---
Licensed under the MIT License. See `LICENSE` for details.
