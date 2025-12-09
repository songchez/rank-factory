import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { adminCreateTopic } from '../lib/api';

export default function Admin() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!user) {
    return <div className="p-8">Please login to access admin panel</div>;
  }

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await adminCreateTopic(prompt);
      setResult(res.data);
      setPrompt('');
    } catch (err) {
      console.error(err);
      alert('Failed to generate topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Generate New Topic</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the topic you want to create..."
          className="w-full p-4 border rounded-lg mb-4 min-h-32"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Topic'}
        </button>
        {result && (
          <div className="mt-8 p-4 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Created: {result.title}</h3>
            <p className="text-sm text-muted-foreground">ID: {result.id}</p>
          </div>
        )}
      </div>
    </div>
  );
}
