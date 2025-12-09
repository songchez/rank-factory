import { useParams } from 'react-router-dom';

export default function Test() {
  const { id } = useParams();
  return <div className="p-8">Test page for topic: {id}</div>;
}
