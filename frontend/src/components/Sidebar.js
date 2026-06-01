import React from 'react';
import { MusicNote as Music, SignOut, House, Users, GraduationCap as Student, Chalkboard, ChartBar } from '@phosphor-icons/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const adminMenuItems = [
    { path: '/', label: 'Dashboard', icon: House },
    { path: '/teachers', label: 'Professores', icon: Chalkboard },
    { path: '/students', label: 'Alunos', icon: Student },
    { path: '/classes', label: 'Turmas', icon: Users },
  ];

  const teacherMenuItems = [
    { path: '/', label: 'Dashboard', icon: House },
    { path: '/my-classes', label: 'Minhas Turmas', icon: Users },
    { path: '/sessions', label: 'Aulas', icon: ChartBar },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : teacherMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 h-screen flex flex-col" style={{
      background: '#090412',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div className="p-6 flex items-center space-x-3" style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, #FFB800 0%, #FFC933 100%)'
        }}>
          <Music size={20} weight="duotone" color="#090412" />
        </div>
        <div>
          <h2 className="text-sm font-bold" style={{ color: '#F4F0FA' }}>Escola de Música</h2>
          <p className="text-xs" style={{ color: '#A291B5' }}>
            {user?.role === 'admin' ? 'Administrador' : 'Professor'}
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              data-testid={`sidebar-${item.label.toLowerCase().replace(' ', '-')}`}
              className="w-full flex items-center space-x-3 px-4 py-3 transition-colors duration-200"
              style={{
                background: active ? 'rgba(255, 184, 0, 0.1)' : 'transparent',
                border: active ? '1px solid rgba(255, 184, 0, 0.3)' : '1px solid transparent',
                color: active ? '#FFB800' : '#A291B5',
                borderRadius: '0'
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={20} weight={active ? 'fill' : 'regular'} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="mb-4 p-3" style={{
          background: 'rgba(26, 11, 46, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '0'
        }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#A291B5' }}>USUÁRIO</p>
          <p className="text-sm font-medium" style={{ color: '#F4F0FA' }}>{user?.name}</p>
          <p className="text-xs" style={{ color: '#A291B5' }}>{user?.email}</p>
        </div>
        
        <button
          onClick={handleLogout}
          data-testid="logout-button"
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 transition-colors duration-200"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#F4F0FA',
            borderRadius: '0'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <SignOut size={18} />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;