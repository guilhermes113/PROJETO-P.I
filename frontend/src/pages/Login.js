import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MusicNote as Music, Lock, Envelope } from '@phosphor-icons/react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#090412' }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full" style={{
          background: 'radial-gradient(circle, rgba(255, 184, 0, 0.1) 0%, transparent 70%)',
          top: '10%',
          left: '20%',
          filter: 'blur(60px)'
        }}></div>
        <div className="absolute w-96 h-96 rounded-full" style={{
          background: 'radial-gradient(circle, rgba(138, 43, 226, 0.15) 0%, transparent 70%)',
          bottom: '20%',
          right: '10%',
          filter: 'blur(80px)'
        }}></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass-effect p-8 border" style={{
          background: 'rgba(26, 11, 46, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0'
        }}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{
              background: 'linear-gradient(135deg, #FFB800 0%, #FFC933 100%)'
            }}>
              <Music size={32} weight="duotone" color="#090412" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: '#F4F0FA' }}>Sistema de Gestão</h1>
            <p className="text-sm mt-2" style={{ color: '#A291B5' }}>Escola de Música</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Envelope size={20} color="#A291B5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="login-email-input"
                  className="w-full pl-11 pr-4 py-3 text-base outline-none"
                  style={{
                    background: '#090412',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F4F0FA',
                    borderRadius: '0'
                  }}
                  placeholder="seu@email.com"
                  onFocus={(e) => e.target.style.border = '1px solid #FFB800'}
                  onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>
                Senha
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Lock size={20} color="#A291B5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="login-password-input"
                  className="w-full pl-11 pr-4 py-3 text-base outline-none"
                  style={{
                    background: '#090412',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F4F0FA',
                    borderRadius: '0'
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => e.target.style.border = '1px solid #FFB800'}
                  onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                borderRadius: '0'
              }} data-testid="login-error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit-button"
              className="w-full py-3 font-semibold text-base transition-colors duration-200"
              style={{
                background: loading ? '#A291B5' : '#FFB800',
                color: '#090412',
                borderRadius: '0',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = '#FFC933')}
              onMouseLeave={(e) => !loading && (e.target.style.background = '#FFB800')}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <p className="text-xs text-center" style={{ color: '#A291B5' }}>
              Credenciais de teste: coordenador@escola.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;