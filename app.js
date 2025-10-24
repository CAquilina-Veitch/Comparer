// Pokemon Memorability Ranker
// Using ELO rating system for ranking

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const TOTAL_POKEMON = 1025; // Total Pokemon in API (as of Gen 9)
const K_FACTOR = 32; // ELO K-factor (higher = more volatile ratings)
const INITIAL_RATING = 1500; // Starting ELO rating

class PokemonRanker {
    constructor() {
        this.pokemon = [];
        this.currentPair = { left: null, right: null };
        this.currentNameTestGroup = [];
        this.selectedNameTestIds = new Set();
        this.totalComparisons = 0;
        this.currentScreen = 'loading';
        this.currentMode = 'battle'; // 'battle' or 'nametest'

        this.init();
    }

    async init() {
        // Load saved data or fetch fresh
        await this.loadData();
        this.setupEventListeners();
        this.showScreen('menu');
    }

    async loadData() {
        const savedData = localStorage.getItem('pokemonRankings');

        if (savedData) {
            const data = JSON.parse(savedData);
            this.pokemon = data.pokemon;
            this.totalComparisons = data.totalComparisons || 0;
            this.updateLoadingText('Loaded from storage!');
            this.updateMenuStats();
        } else {
            await this.fetchAllPokemon();
        }
    }

    async fetchAllPokemon() {
        try {
            this.updateLoadingText(`Fetching Pokemon data...`);

            // Fetch all Pokemon (limit to first 1025)
            const promises = [];
            for (let i = 1; i <= TOTAL_POKEMON; i++) {
                promises.push(this.fetchPokemon(i));

                // Batch requests to avoid overwhelming the API
                if (i % 50 === 0) {
                    const batch = await Promise.all(promises.splice(0, 50));
                    this.pokemon.push(...batch.filter(p => p !== null));
                    this.updateLoadingText(`Loaded ${this.pokemon.length}/${TOTAL_POKEMON} Pokemon...`);
                }
            }

            // Get remaining Pokemon
            if (promises.length > 0) {
                const batch = await Promise.all(promises);
                this.pokemon.push(...batch.filter(p => p !== null));
            }

            this.updateLoadingText('All Pokemon loaded!');
            this.saveData();
            this.updateMenuStats();
        } catch (error) {
            console.error('Error fetching Pokemon:', error);
            this.updateLoadingText('Error loading Pokemon. Please refresh.');
        }
    }

    async fetchPokemon(id) {
        try {
            const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`);
            if (!response.ok) return null;

            const data = await response.json();

            return {
                id: data.id,
                name: data.name,
                number: data.id,
                sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
                rating: INITIAL_RATING,
                wins: 0,
                losses: 0,
                matches: 0
            };
        } catch (error) {
            console.error(`Error fetching Pokemon ${id}:`, error);
            return null;
        }
    }

    saveData() {
        const data = {
            pokemon: this.pokemon,
            totalComparisons: this.totalComparisons,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('pokemonRankings', JSON.stringify(data));
    }

    resetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            localStorage.removeItem('pokemonRankings');
            this.pokemon = [];
            this.totalComparisons = 0;
            this.showScreen('loading');
            this.fetchAllPokemon().then(() => {
                this.showScreen('menu');
            });
        }
    }

    // ELO Rating System
    calculateELO(winner, loser) {
        const expectedWinner = 1 / (1 + Math.pow(10, (loser.rating - winner.rating) / 400));
        const expectedLoser = 1 / (1 + Math.pow(10, (winner.rating - loser.rating) / 400));

        winner.rating = Math.round(winner.rating + K_FACTOR * (1 - expectedWinner));
        loser.rating = Math.round(loser.rating + K_FACTOR * (0 - expectedLoser));

        winner.wins++;
        loser.losses++;
        winner.matches++;
        loser.matches++;
    }

    // Get random pair of Pokemon
    getRandomPair() {
        const shuffled = [...this.pokemon].sort(() => Math.random() - 0.5);
        return {
            left: shuffled[0],
            right: shuffled[1]
        };
    }

    // Handle Pokemon selection
    selectPokemon(winner, loser) {
        this.calculateELO(winner, loser);
        this.totalComparisons++;
        this.saveData();

        // Show next pair
        this.showBattle();
    }

    // UI Methods
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${screenName}-screen`).classList.add('active');
        this.currentScreen = screenName;

        if (screenName === 'menu') {
            this.updateMenuStats();
        } else if (screenName === 'battle') {
            this.showBattle();
        } else if (screenName === 'rankings') {
            this.showRankings();
        }
    }

    updateLoadingText(text) {
        document.getElementById('loading-text').textContent = text;
    }

    updateMenuStats() {
        document.getElementById('total-comparisons').textContent = this.totalComparisons;
        document.getElementById('pokemon-count').textContent = this.pokemon.length;

        // Show least memorable Pokemon stats
        const sorted = [...this.pokemon].sort((a, b) => a.rating - b.rating);
        const leastMemorable = sorted[0];
        const leastMemorableStat = document.getElementById('least-memorable-stat');
        const ratingRangeStat = document.getElementById('rating-range-stat');

        if (this.totalComparisons > 0) {
            leastMemorableStat.textContent = `Least Memorable: ${leastMemorable.name} (${leastMemorable.rating} ELO)`;

            const lowestRating = sorted[0].rating;
            const highestRating = sorted[sorted.length - 1].rating;
            const ratingSpread = highestRating - lowestRating;

            ratingRangeStat.textContent = `Rating Range: ${lowestRating} - ${highestRating} (spread: ${ratingSpread})`;
        } else {
            leastMemorableStat.textContent = 'Start comparing to find the least memorable!';
            ratingRangeStat.textContent = '';
        }
    }

    showBattle() {
        this.currentPair = this.getRandomPair();

        // Update comparison count
        document.getElementById('current-comparison').textContent = this.totalComparisons + 1;

        // Update left Pokemon
        document.getElementById('pokemon-left-img').src = this.currentPair.left.sprite;
        document.getElementById('pokemon-left-name').textContent = this.currentPair.left.name;
        document.getElementById('pokemon-left-number').textContent = this.currentPair.left.number;
        document.getElementById('pokemon-left-wins').textContent = this.currentPair.left.wins;
        document.getElementById('pokemon-left-losses').textContent = this.currentPair.left.losses;

        // Update right Pokemon
        document.getElementById('pokemon-right-img').src = this.currentPair.right.sprite;
        document.getElementById('pokemon-right-name').textContent = this.currentPair.right.name;
        document.getElementById('pokemon-right-number').textContent = this.currentPair.right.number;
        document.getElementById('pokemon-right-wins').textContent = this.currentPair.right.wins;
        document.getElementById('pokemon-right-losses').textContent = this.currentPair.right.losses;
    }

    showRankings(searchTerm = '', sortBy = 'rating') {
        const rankingsContainer = document.getElementById('rankings-list');
        rankingsContainer.innerHTML = '';

        // Filter Pokemon
        let filtered = [...this.pokemon];
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.number.toString().includes(searchTerm)
            );
        }

        // Sort Pokemon
        filtered.sort((a, b) => {
            switch(sortBy) {
                case 'rating':
                    return b.rating - a.rating;
                case 'wins':
                    return b.wins - a.wins;
                case 'losses':
                    return b.losses - a.losses;
                case 'matches':
                    return b.matches - a.matches;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'number':
                    return a.number - b.number;
                default:
                    return b.rating - a.rating;
            }
        });

        // Display rankings
        filtered.forEach((pokemon, index) => {
            const item = document.createElement('div');
            item.className = 'ranking-item';

            const position = document.createElement('div');
            position.className = 'ranking-position';
            if (index < 3 && sortBy === 'rating') {
                position.classList.add('top-3');
            }
            position.textContent = `#${index + 1}`;

            const image = document.createElement('div');
            image.className = 'ranking-image';
            const img = document.createElement('img');
            img.src = pokemon.sprite;
            img.alt = pokemon.name;
            image.appendChild(img);

            const info = document.createElement('div');
            info.className = 'ranking-info';

            const name = document.createElement('div');
            name.className = 'ranking-name';
            name.textContent = `${pokemon.name} (#${pokemon.number})`;

            const details = document.createElement('div');
            details.className = 'ranking-details';
            details.textContent = `W: ${pokemon.wins} | L: ${pokemon.losses} | Matches: ${pokemon.matches}`;

            info.appendChild(name);
            info.appendChild(details);

            const rating = document.createElement('div');
            rating.className = 'ranking-rating';
            rating.textContent = pokemon.rating;

            item.appendChild(position);
            item.appendChild(image);
            item.appendChild(info);
            item.appendChild(rating);

            rankingsContainer.appendChild(item);
        });

        // Show message if no results
        if (filtered.length === 0) {
            rankingsContainer.innerHTML = '<p style="text-align: center; color: white; padding: 20px;">No Pokemon found</p>';
        }
    }

    // Name Test Mode Methods
    showNameTest() {
        this.currentNameTestGroup = this.getRandomGroup(5);
        this.selectedNameTestIds.clear();

        const grid = document.getElementById('nametest-grid');
        grid.innerHTML = '';

        this.currentNameTestGroup.forEach(pokemon => {
            const card = document.createElement('div');
            card.className = 'nametest-card';
            card.dataset.pokemonId = pokemon.id;

            const imageContainer = document.createElement('div');
            imageContainer.className = 'nametest-card-image';
            const img = document.createElement('img');
            img.src = pokemon.sprite;
            img.alt = '?';
            imageContainer.appendChild(img);

            const number = document.createElement('div');
            number.className = 'nametest-card-number';
            number.textContent = `#${pokemon.number}`;

            card.appendChild(imageContainer);
            card.appendChild(number);

            card.addEventListener('click', () => {
                card.classList.toggle('selected');
                if (card.classList.contains('selected')) {
                    this.selectedNameTestIds.add(pokemon.id);
                } else {
                    this.selectedNameTestIds.delete(pokemon.id);
                }
            });

            grid.appendChild(card);
        });
    }

    submitNameTest() {
        // Process results: selected = wins, unselected = losses
        this.currentNameTestGroup.forEach(pokemon => {
            if (this.selectedNameTestIds.has(pokemon.id)) {
                // User recognized this Pokemon - they win against the group average
                // Calculate wins against all unselected Pokemon
                const unselected = this.currentNameTestGroup.filter(p => !this.selectedNameTestIds.has(p.id));
                unselected.forEach(loser => {
                    this.calculateELO(pokemon, loser);
                });
            }
        });

        this.totalComparisons += this.currentNameTestGroup.length;
        this.saveData();

        // Show next group
        this.showNameTest();
        document.getElementById('current-comparison').textContent = this.totalComparisons;
    }

    getRandomGroup(count) {
        // Use same weighted selection as battle mode
        const biasFactor = Math.min(this.totalComparisons / 500, 1);

        if (biasFactor < 0.2) {
            // Early stage: fully random
            const shuffled = [...this.pokemon].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, count);
        }

        // Later stages: weighted selection favoring lower-rated Pokemon
        const sorted = [...this.pokemon].sort((a, b) => a.rating - b.rating);
        const medianRating = sorted[Math.floor(sorted.length / 2)].rating;

        const weightedPool = this.pokemon.map(p => {
            const ratingDiff = medianRating - p.rating;
            const baseWeight = 1;
            const biasWeight = Math.max(0.1, 1 + (ratingDiff / 200) * biasFactor);
            return {
                pokemon: p,
                weight: baseWeight + biasWeight * biasFactor * 3
            };
        });

        const selected = [];
        const remainingPool = [...weightedPool];

        for (let i = 0; i < count && remainingPool.length > 0; i++) {
            const pokemon = this.weightedRandomSelect(remainingPool);
            selected.push(pokemon);
            const index = remainingPool.findIndex(item => item.pokemon.id === pokemon.id);
            if (index > -1) remainingPool.splice(index, 1);
        }

        return selected;
    }

    switchMode(mode) {
        this.currentMode = mode;

        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`mode-${mode}`).classList.add('active');

        // Update title and bias indicator
        const title = document.getElementById('battle-title');
        const biasIndicator = document.getElementById('bias-indicator');

        if (mode === 'battle') {
            title.textContent = 'Which is more memorable?';
            document.getElementById('vs-mode-container').classList.add('active-mode');
            document.getElementById('nametest-mode-container').classList.remove('active-mode');
            biasIndicator.style.display = 'inline-block';
            this.showBattle();
        } else {
            title.textContent = 'Name Recognition Test';
            document.getElementById('vs-mode-container').classList.remove('active-mode');
            document.getElementById('nametest-mode-container').classList.add('active-mode');
            biasIndicator.style.display = 'inline-block';
            this.showNameTest();
        }

        // Update bias indicator for both modes
        const biasFactor = Math.min(this.totalComparisons / 500, 1);
        if (biasFactor < 0.2) {
            biasIndicator.textContent = '🔀 Random Mode - Building initial data';
        } else if (biasFactor < 0.5) {
            biasIndicator.textContent = '📊 Slightly focusing on lower-rated Pokemon';
        } else if (biasFactor < 0.8) {
            biasIndicator.textContent = '🎯 Focusing on less memorable Pokemon';
        } else {
            biasIndicator.textContent = '🔍 Hunting for the least memorable Pokemon';
        }
    }

    setupEventListeners() {
        // Menu buttons
        document.getElementById('start-ranking-btn').addEventListener('click', () => {
            this.showScreen('battle');
        });

        document.getElementById('view-rankings-btn').addEventListener('click', () => {
            this.showScreen('rankings');
        });

        document.getElementById('reset-data-btn').addEventListener('click', () => {
            this.resetData();
        });

        // Battle screen
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.showScreen('menu');
        });

        document.getElementById('pokemon-left').addEventListener('click', () => {
            this.selectPokemon(this.currentPair.left, this.currentPair.right);
        });

        document.getElementById('pokemon-right').addEventListener('click', () => {
            this.selectPokemon(this.currentPair.right, this.currentPair.left);
        });

        // Mode toggle
        document.getElementById('mode-battle').addEventListener('click', () => {
            this.switchMode('battle');
        });

        document.getElementById('mode-nametest').addEventListener('click', () => {
            this.switchMode('nametest');
        });

        // Name test submit
        document.getElementById('submit-nametest').addEventListener('click', () => {
            this.submitNameTest();
        });

        // Rankings screen
        document.getElementById('rankings-back-btn').addEventListener('click', () => {
            this.showScreen('menu');
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            const sortBy = document.getElementById('sort-select').value;
            this.showRankings(searchTerm, sortBy);
        });

        document.getElementById('sort-select').addEventListener('change', (e) => {
            const sortBy = e.target.value;
            const searchTerm = document.getElementById('search-input').value;
            this.showRankings(searchTerm, sortBy);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.currentScreen === 'battle') {
                if (this.currentMode === 'battle') {
                    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                        this.selectPokemon(this.currentPair.left, this.currentPair.right);
                    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                        this.selectPokemon(this.currentPair.right, this.currentPair.left);
                    }
                } else if (this.currentMode === 'nametest') {
                    if (e.key === 'Enter') {
                        this.submitNameTest();
                    }
                }
            }
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PokemonRanker();
});
