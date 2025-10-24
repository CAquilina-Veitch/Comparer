# Pokemon Memorability Ranker

A mobile-friendly web app that ranks Pokemon based on memorability using an ELO rating system. Compare two Pokemon at a time and discover which ones are truly the most (and least) memorable!

## Features

- **1000+ Pokemon**: All Pokemon from Gen 1-9 (1025 total)
- **Dual Ranking Modes**:
  - **VS Mode**: Head-to-head comparisons between two Pokemon
  - **Name Test Mode**: Test name recognition with 5 Pokemon at once (faster data collection!)
- **ELO Rating System**: Uses competitive ELO algorithm for accurate rankings
- **Adaptive Algorithm**: Progressively focuses on lower-rated Pokemon as you collect more data
  - 0-100 comparisons: Fully random selection
  - 100-500 comparisons: Gradually shifts focus to less memorable Pokemon
  - 500+ comparisons: Heavily weighted toward finding the least memorable
- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Local Storage**: All data saved in your browser (no server required)
- **Real-time Stats**: Track wins, losses, total matches, and current least memorable Pokemon
- **Searchable Rankings**: Filter and sort Pokemon by different criteria
- **Keyboard Shortcuts**: Arrow keys (A/D) in VS Mode, Enter in Name Test Mode

## How It Works

1. Click "Start Ranking" to begin comparing Pokemon
2. Choose your mode:
   - **VS Mode**: Click the more memorable Pokemon between two options
   - **Name Test**: Click all Pokemon you can name, then submit
3. The app uses ELO ratings to rank all Pokemon based on your choices
4. As you make more comparisons, the algorithm adapts to focus on less memorable Pokemon
5. View rankings anytime to see which Pokemon are most/least memorable
6. The more comparisons you make, the more accurate the rankings become

## GitHub Pages Setup

To deploy this to GitHub Pages:

1. Push this repository to GitHub
2. Go to repository Settings > Pages
3. Under "Source", select "Deploy from a branch"
4. Select the `main` branch and `/ (root)` folder
5. Click Save
6. Your app will be live at `https://yourusername.github.io/Comparer/`

## Local Development

Simply open `index.html` in a web browser. No build process or server needed!

## Technical Details

- **ELO Rating**: Standard chess ELO algorithm with K-factor of 32
- **Starting Rating**: All Pokemon start at 1500 ELO
- **Adaptive Selection**: Weighted random selection that increasingly favors lower-rated Pokemon
  - Uses median rating as baseline for weighting
  - Lower-rated Pokemon can become up to 10x more likely to appear at full bias
- **Name Test Scoring**: Selected Pokemon gain ELO from each unselected Pokemon in the group
- **API**: Uses PokeAPI (https://pokeapi.co) for Pokemon data
- **Storage**: Browser localStorage for data persistence
- **Compatibility**: Works on all modern browsers (Chrome, Firefox, Safari, Edge)

## Future Enhancements

- Server-side storage for global rankings
- Share rankings with friends
- Generation filters
- Type-based filtering
- Export rankings data

## Credits

- Pokemon data from [PokeAPI](https://pokeapi.co)
- Pokemon images © Nintendo/Game Freak