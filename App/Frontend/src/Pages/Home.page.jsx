import { useDispatch, useSelector } from 'react-redux';
import { logoutSuccess } from '../Store/auth.slice.js';

export default function HomePage() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const logout = () => {
    // Backend doesn't expose logout; clear client state. Cookie will expire later or can be cleared via server in future.
    dispatch(logoutSuccess());
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome to CEMS</h1>
        {isAuthenticated && (
          <button onClick={logout} className="bg-gray-200 rounded px-3 py-1">Logout</button>
        )}
      </div>
      <p className="mt-4">You are logged in. Explore the app.</p>
    </div>
  );
}


