import Tile from './Tile';
import '../styles/Line.css';
import type { ITile } from '../App';

interface Props {
	guess: ITile[];
}

const Line = ({ guess }: Props) => {
	return (
		<div className='line'>
			{guess.map((tile, idx) => (
				<Tile tile={tile} key={idx} />
			))}
		</div>
	);
};

export default Line;
