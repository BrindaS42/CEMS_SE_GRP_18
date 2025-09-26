import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '../Store/auth.slice.js';

export default function LoginPage() {
  const dispatch = useDispatch();
  const { status, error, isAuthenticated } = useSelector((s) => s.auth);

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'student' });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      dispatch(registerUser({ username: form.username, email: form.email, password: form.password, role: form.role }));
    } else {
      dispatch(loginUser({ username: form.username, password: form.password }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow rounded p-6">
        <h2 className="text-2xl font-semibold mb-4 text-center">{isRegister ? 'Register' : 'Login'}</h2>
        {isAuthenticated && (
          <div className="mb-3 text-green-700 text-sm">Authenticated. You can go to Home.</div>
        )}
        {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter username"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter email"
                required={isRegister}
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter password"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm mb-1">Role</label>
              <select name="role" value={form.role} onChange={onChange} className="w-full border rounded px-3 py-2">
                <option value="student">student</option>
                <option value="organizer">organizer</option>
                <option value="sponsor">sponsor</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-sm text-center">
          <button className="text-blue-600" onClick={() => setIsRegister((v) => !v)}>
            {isRegister ? 'Have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}


