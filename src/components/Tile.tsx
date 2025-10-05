import type { ITile } from '../App';
import '../styles/Tile.css';

interface Props {
	tile: ITile;
}

const Tile = ({ tile }: Props) => {
	return <div className={`tile ${tile.status}`}>{tile.value}</div>;
};

export default Tile;
