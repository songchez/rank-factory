import { useParams } from 'react-router-dom';

export default function Tier() {
  const { id } = useParams();
  return <div className="p-8">Tier page for topic: {id}</div>;
}
