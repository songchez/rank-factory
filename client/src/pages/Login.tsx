import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { user, signInWithOAuth } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 border rounded-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6">Login</h1>
        <button
          onClick={() => signInWithOAuth('google')}
          className="w-full p-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
