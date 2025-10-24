# Pokemon Memorability Ranker

A mobile-friendly web app that ranks Pokemon based on memorability using an ELO rating system. Compare two Pokemon at a time and discover which ones are truly the most (and least) memorable!

## Features

- **1000+ Pokemon**: All Pokemon from Gen 1-9 (1025 total)
- **ELO Rating System**: Uses competitive ELO algorithm for accurate rankings
- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Local Storage**: All data saved in your browser (no server required)
- **Real-time Stats**: Track wins, losses, and total matches for each Pokemon
- **Searchable Rankings**: Filter and sort Pokemon by different criteria
- **Keyboard Shortcuts**: Use arrow keys (or A/D) to quickly compare

## How It Works

1. Click "Start Ranking" to begin comparing Pokemon
2. Two random Pokemon appear - click the one that's more memorable to you
3. The app uses ELO ratings to rank all Pokemon based on your choices
4. View rankings anytime to see which Pokemon are most/least memorable
5. The more comparisons you make, the more accurate the rankings become

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