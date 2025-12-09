import { useParams } from 'react-router-dom';

export default function Fact() {
  const { id } = useParams();
  return <div className="p-8">Fact page for topic: {id}</div>;
}
