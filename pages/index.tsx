import { useState, useEffect } from 'react';
import Head from 'next/head';
import SEO from '@/components/SEO';
import { useAnalytics } from '@/hooks/useAnalytics';
import Header from '@/components/Header';


// Dummy data for historical figures
const dummyFigures = [
  { name: "Napoleon Bonaparte", era: "19th Century", nationality: "French", yearBorn: 1769, yearDied: 1821, field: "Military" },
  { name: "Albert Einstein", era: "20th Century", nationality: "German", yearBorn: 1879, yearDied: 1955, field: "Science" },
  { name: "Marie Curie", era: "20th Century", nationality: "Polish", yearBorn: 1867, yearDied: 1934, field: "Science" },
  { name: "Abraham Lincoln", era: "19th Century", nationality: "American", yearBorn: 1809, yearDied: 1865, field: "Politics" },
  { name: "Winston Churchill", era: "20th Century", nationality: "British", yearBorn: 1874, yearDied: 1965, field: "Politics" },
  { name: "Cleopatra", era: "Ancient", nationality: "Egyptian", yearBorn: -69, yearDied: -30, field: "Royalty" },
  { name: "Leonardo da Vinci", era: "Renaissance", nationality: "Italian", yearBorn: 1452, yearDied: 1519, field: "Art" },
  { name: "Mahatma Gandhi", era: "20th Century", nationality: "Indian", yearBorn: 1869, yearDied: 1948, field: "Politics" },
  { name: "Alexander the Great", era: "Ancient", nationality: "Macedonian", yearBorn: -356, yearDied: -323, field: "Military" },
  { name: "Queen Victoria", era: "19th Century", nationality: "British", yearBorn: 1819, yearDied: 1901, field: "Royalty" },
];

// Game state interface
interface GameState {
  mysteryFigure: typeof dummyFigures[0] | null;
  guesses: typeof dummyFigures[0][];
  gameOver: boolean;
  won: boolean;
  gaveUp: boolean;
  loading: boolean;
  maxGuesses: number;
}

export default function Home() {
  const { trackEvent } = useAnalytics();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFigures, setFilteredFigures] = useState<typeof dummyFigures>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    mysteryFigure: null,
    guesses: [],
    gameOver: false,
    won: false,
    gaveUp: false,
    loading: true,
    maxGuesses: 8
  });

  // Initialize game on component mount
  useEffect(() => {
    // Select a random figure as the mystery figure
    const randomIndex = Math.floor(Math.random() * dummyFigures.length);
    setGameState(prev => ({
      ...prev,
      mysteryFigure: dummyFigures[randomIndex],
      loading: false
    }));
    
    // Check if user has played before
    const hasPlayed = localStorage.getItem('historyWordleHasPlayed');
    if (hasPlayed) {
      setShowInstructions(false);
    } else {
      localStorage.setItem('historyWordleHasPlayed', 'true');
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 0) {
      const filtered = dummyFigures.filter(figure => 
        figure.name.toLowerCase().includes(term.toLowerCase()) &&
        !gameState.guesses.some(guess => guess.name === figure.name)
      );
      setFilteredFigures(filtered);
    } else {
      setFilteredFigures([]);
    }
  };

  // Handle figure selection
  const selectFigure = (figure: typeof dummyFigures[0]) => {
    setSearchTerm('');
    setFilteredFigures([]);
    
    // Track the guess activity
    trackEvent('select_figure', {
      category: 'game_interaction',
      label: figure.name,
    });
    
    // Check if figure is already guessed
    if (gameState.guesses.some(guess => guess.name === figure.name)) {
      return;
    }
    
    // Check if figure is the mystery figure
    const isCorrect = figure.name === gameState.mysteryFigure?.name;
    
    const newGuesses = [...gameState.guesses, figure];
    
    setGameState(prev => ({
      ...prev,
      guesses: newGuesses,
      gameOver: isCorrect || newGuesses.length >= prev.maxGuesses,
      won: isCorrect
    }));
  };
  // Handle give up
  const handleGiveUp = () => {
    trackEvent('give_up', {
      category: 'game_interaction',
      label: gameState.mysteryFigure?.name || 'unknown',
      value: gameState.guesses.length,
    });
    
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      gaveUp: true
    }));
  };

  // Handle new game
  const handleNewGame = () => {
    trackEvent('new_game', {
      category: 'game_interaction',
    });
    
    const randomIndex = Math.floor(Math.random() * dummyFigures.length);
    setGameState(prev => ({
      ...prev,
      mysteryFigure: dummyFigures[randomIndex],
      guesses: [],
      gameOver: false,
      won: false,
      gaveUp: false,
      loading: false,
      maxGuesses: 8
    }));
  };

 // Check if a property matches the mystery figure
 const isMatch = (guess: typeof dummyFigures[0], property: keyof typeof dummyFigures[0]) => {
  if (!gameState.mysteryFigure) return false;
  return guess[property] === gameState.mysteryFigure[property];
};

// Get directional hint for numeric values
const getDirectionalHint = (guess: typeof dummyFigures[0], property: 'yearBorn' | 'yearDied') => {
  if (!gameState.mysteryFigure) return null;
  
  if (guess[property] === gameState.mysteryFigure[property]) {
    return null;
  }
  
  if (guess[property] < gameState.mysteryFigure[property]) {
    return <span className={`directionalHint higher`}>↑</span>;
  } else {
    return <span className={`directionalHint lower`}>↓</span>;
  }
};

// Share results
const shareResults = () => {
  if (!gameState.mysteryFigure) return;
  
  trackEvent('share_results', {
    category: 'social_interaction',
    label: gameState.mysteryFigure.name,
    value: gameState.guesses.length,
  });
  
  let shareText = `History Wordle - ${gameState.mysteryFigure.name}\n`;
  shareText += gameState.won ? `I got it in ${gameState.guesses.length}/${gameState.maxGuesses} guesses!` : 'I gave up!';
  shareText += '\n\n';
  
  // Add emoji grid representation of guesses
  gameState.guesses.forEach(guess => {
    const eraMatch = isMatch(guess, 'era') ? '🟩' : '⬜';
    const nationalityMatch = isMatch(guess, 'nationality') ? '🟩' : '⬜';
    const yearBornMatch = isMatch(guess, 'yearBorn') ? '🟩' : '⬜';
    const yearDiedMatch = isMatch(guess, 'yearDied') ? '🟩' : '⬜';
    const fieldMatch = isMatch(guess, 'field') ? '🟩' : '⬜';
    
    shareText += `${eraMatch}${nationalityMatch}${yearBornMatch}${yearDiedMatch}${fieldMatch}\n`;
  });
  
  shareText += '\nPlay at: https://historywordle.me';
  
  navigator.clipboard.writeText(shareText)
    .then(() => alert('Results copied to clipboard!'))
    .catch(() => alert('Failed to copy results. Please try again.'));
};

  if (gameState.loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="w-full">
      <Header/>
    <SEO/>

    <main className="main">
      
      {showInstructions && (
        <div className="instructions">
          <p>Guess the mystery historical figure in {gameState.maxGuesses} tries or less!</p>
          <p>Green cells indicate a match with the mystery figure.</p>
          <p>For years, arrows indicate if the mystery figure's year is later (↑) or earlier (↓).</p>
          <button 
            className="newGameButton" 
            onClick={() => setShowInstructions(false)}
          >
            Got it!
          </button>
        </div>
      )}
      
      {!gameState.gameOver ? (
          <>
           <div className="gameControls">
              <div className="searchContainer">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Start typing to guess a historical figure..."
                  className="searchInput"
                />
                {filteredFigures.length > 0 && (
                  <div className="dropdown">
                    {filteredFigures.map((figure) => (
                      <div 
                        key={figure.name} 
                        className="dropdownItem"
                        onClick={() => selectFigure(figure)}
                      >
                        {figure.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="buttonContainer">
                <button 
                  className="guessButton"
                  onClick={() => {
                    if (filteredFigures.length > 0) {
                      selectFigure(filteredFigures[0]);
                    }
                  }}
                  disabled={filteredFigures.length === 0}
                >
                  Guess
                </button>
                <button 
                  className="giveUpButton"
                  onClick={handleGiveUp}
                  disabled={gameState.guesses.length === 0}
                >
                  Give up
                </button>
              </div>
            </div>

            <div className="guessCount">
              Guesses: {gameState.guesses.length}/{gameState.maxGuesses}
            </div>
            <div className="guessesContainer">
              {gameState.guesses.length > 0 && (
                <table className="guessTable">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Era</th>
                      <th>Nationality</th>
                      <th>Year Born</th>
                      <th>Year Died</th>
                      <th>Field</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameState.guesses.map((guess, index) => (
                      <tr key={index}>
                        <td>{guess.name}</td>
                        <td className={isMatch(guess, 'era') ? "match" : ''}>
                          {guess.era}
                        </td>
                        <td className={isMatch(guess, 'nationality') ? "match" : ''}>
                          {guess.nationality}
                        </td>
                        <td className={isMatch(guess, 'yearBorn') ? "match" : ''}>
                          {guess.yearBorn < 0 ? `${Math.abs(guess.yearBorn)} BCE` : guess.yearBorn}
                          {!isMatch(guess, 'yearBorn') && getDirectionalHint(guess, 'yearBorn')}
                        </td>
                        <td className={isMatch(guess, 'yearDied') ? "match" : ''}>
                          {guess.yearDied < 0 ? `${Math.abs(guess.yearDied)} BCE` : guess.yearDied}
                          {!isMatch(guess, 'yearDied') && getDirectionalHint(guess, 'yearDied')}
                        </td>
                        <td className={isMatch(guess, 'field') ? "match" : ''}>
                          {guess.field}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
         ) : (
          <div className="gameOverContainer">
            <h2>The mystery figure was:</h2>
            <h1 className="mysteryFigureReveal">
              {gameState.mysteryFigure?.name}
            </h1>
            
            {gameState.won ? (
              <p>You got it in {gameState.guesses.length} tries!</p>
            ) : (
              <p>You {gameState.gaveUp ? 'gave up' : 'ran out of guesses'} after {gameState.guesses.length} guesses.</p>
            )}
            
            <button 
              className="shareButton"
              onClick={shareResults}
            >
              Share Results
            </button>
            
            <button 
              className="newGameButton"
              onClick={handleNewGame}
            >
              New Game
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>History Wordle - Guess historical figures from different eras.</p>
      </footer>
    </div>
  );
}