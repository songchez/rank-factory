import { useParams } from 'react-router-dom';

export default function Ranking() {
  const { id } = useParams();
  return <div className="p-8">Ranking page for topic: {id}</div>;
}
