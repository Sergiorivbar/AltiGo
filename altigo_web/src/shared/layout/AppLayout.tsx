import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';

export function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/routes" className="app-header__brand">🏔️ AltiGo</Link>
        <nav className="app-header__nav">
          {user ? (
            <>
              <span className={`role-pill ${user.isPremium ? 'role-pill--premium' : 'role-pill--free'}`}>
                {user.isPremium ? 'Premium' : 'Free'}
              </span>
              {!user.isPremium && <Link to="/upgrade">Hazte Premium</Link>}
              <button className="link-btn" onClick={handleLogout}>Salir</button>
            </>
          ) : (
            <Link to="/login">Iniciar sesión</Link>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
