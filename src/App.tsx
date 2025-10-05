import { useState, useEffect, useCallback } from 'react';
import Line from './components/Line';
import './styles/App.css';

const API_URL = '/api/fe/wordle-words';

const MAX_ROW_LENGTH = 6;

const MAX_COL_LENGTH = 5;

export interface ITile {
	value: string;
	status: 'correct' | 'present' | 'absent' | '';
}

const createEmptyRow = () =>
	Array.from(
		{ length: MAX_COL_LENGTH },
		(): ITile => ({ value: '', status: '' })
	);

function App() {
	const [solution, setSolution] = useState<string>('');
	const [guesses, setGuesses] = useState<ITile[][]>(
		Array.from({ length: MAX_ROW_LENGTH }, createEmptyRow)
	);
	const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
	const [currentLetterIndex, setCurrentLetterIndex] = useState(0);

	useEffect(() => {
		const fetchSolution = async () => {
			try {
				const res = await fetch(API_URL);
				const data: string[] = await res.json();
				const randomWord =
					data[Math.floor(Math.random() * data.length)].toUpperCase();
				setSolution(randomWord);
			} catch (err) {
				console.error(err);
			}
		};
		fetchSolution();
	}, []);

	const handleKeyDownInput = useCallback(
		(event: KeyboardEvent) => {
			if (currentGuessIndex >= MAX_ROW_LENGTH) return;

			const key = event.key.toUpperCase();
			const isLetter = /^[A-Z]$/.test(key);

			if (isLetter && currentLetterIndex < MAX_COL_LENGTH) {
				event.preventDefault();

				setGuesses(prevGuesses => {
					const newGuesses = [...prevGuesses];
					newGuesses[currentGuessIndex][currentLetterIndex].value = key;
					return newGuesses;
				});

				setCurrentLetterIndex(
					prevCurrentLetterIndex => prevCurrentLetterIndex + 1
				);
			} else if (key === 'BACKSPACE' || key === 'DELETE') {
				event.preventDefault();

				if (currentLetterIndex > 0) {
					setGuesses(prevGuesses => {
						const newGuesses = [...prevGuesses];
						const indexToClear = currentLetterIndex - 1;
						newGuesses[currentGuessIndex][indexToClear].value = '';
						return newGuesses;
					});

					setCurrentLetterIndex(
						prevCurrentLetterIndex => prevCurrentLetterIndex - 1
					);
				}
			} else if (key === 'ENTER') {
				event.preventDefault();

				if (currentLetterIndex === MAX_COL_LENGTH) {
					const newGuessRow: ITile[] = [...guesses[currentGuessIndex]];

					const solutionLetterCounts: { [key: string]: number } = {};

					for (const char of solution) {
						solutionLetterCounts[char] = (solutionLetterCounts[char] || 0) + 1;
					}

					let correctCount = 0;

					for (let i = 0; i < MAX_COL_LENGTH; i++) {
						const tile = newGuessRow[i];
						if (tile.value === solution[i]) {
							tile.status = 'correct';
							correctCount++;
							solutionLetterCounts[tile.value]--;
						}
					}

					for (let i = 0; i < MAX_COL_LENGTH; i++) {
						const tile = newGuessRow[i];

						if (tile.status === 'correct') continue;

						if (
							solutionLetterCounts[tile.value] &&
							solutionLetterCounts[tile.value] > 0
						) {
							tile.status = 'present';
							solutionLetterCounts[tile.value]--;
						} else {
							tile.status = 'absent';
						}
					}

					setGuesses(prevGuesses => {
						const newGuesses = [...prevGuesses];
						newGuesses[currentGuessIndex] = newGuessRow;
						return newGuesses;
					});

					if (correctCount === MAX_COL_LENGTH) {
						alert('You won! 🎉');
						setCurrentGuessIndex(MAX_ROW_LENGTH);
					} else if (currentGuessIndex < MAX_COL_LENGTH) {
						setCurrentGuessIndex(prevGuessIndex => prevGuessIndex + 1);
						setCurrentLetterIndex(0);
					} else {
						alert(`Game over! The solution was: ${solution}`);
						setCurrentGuessIndex(6);
					}
				} else {
					alert('Guess must be 5 letters long!');
				}
			}
		},
		[currentGuessIndex, currentLetterIndex, guesses, solution]
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDownInput);

		return () => {
			window.removeEventListener('keydown', handleKeyDownInput);
		};
	}, [handleKeyDownInput]);

	return (
		<main className='board'>
			{guesses.map((guess, idx) => (
				<Line guess={guess} key={idx} />
			))}
		</main>
	);
}

export default App;
