import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import api from '../utils/api';
import { ChartBar, Users, GraduationCap as Student, Chalkboard, CheckCircle, XCircle } from '@phosphor-icons/react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, gradient }) => (
    <div
      className="p-6"
      style={{
        background: 'rgba(26, 11, 46, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '0'
      }}
      data-testid={`stat-card-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: '#A291B5' }}>
            {title}
          </p>
          <p className="text-3xl font-bold" style={{ color: '#F4F0FA' }}>{value}</p>
        </div>
        <div
          className="w-12 h-12 rounded-sm flex items-center justify-center"
          style={{ background: gradient }}
        >
          <Icon size={24} weight="duotone" color="#090412" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p style={{ color: '#FFB800' }}>Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#F4F0FA' }}>
            Bem-vindo, {user?.name}
          </h1>
          <p className="text-base" style={{ color: '#A291B5' }}>
            Visão geral do sistema
          </p>
        </div>

        {user?.role === 'admin' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total de Professores"
              value={stats?.total_teachers || 0}
              icon={Chalkboard}
              gradient="linear-gradient(135deg, #FFB800 0%, #FFC933 100%)"
            />
            <StatCard
              title="Total de Alunos"
              value={stats?.total_students || 0}
              icon={Student}
              gradient="linear-gradient(135deg, #10B981 0%, #34D399 100%)"
            />
            <StatCard
              title="Total de Turmas"
              value={stats?.total_classes || 0}
              icon={Users}
              gradient="linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)"
            />
            <StatCard
              title="Taxa de Presença"
              value={stats?.total_presences && stats?.total_absences 
                ? `${Math.round((stats.total_presences / (stats.total_presences + stats.total_absences)) * 100)}%`
                : '0%'
              }
              icon={ChartBar}
              gradient="linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Minhas Turmas"
              value={stats?.my_classes || 0}
              icon={Users}
              gradient="linear-gradient(135deg, #FFB800 0%, #FFC933 100%)"
            />
            <StatCard
              title="Meus Alunos"
              value={stats?.my_students || 0}
              icon={Student}
              gradient="linear-gradient(135deg, #10B981 0%, #34D399 100%)"
            />
            <StatCard
              title="Presenças"
              value={stats?.my_presences || 0}
              icon={CheckCircle}
              gradient="linear-gradient(135deg, #10B981 0%, #34D399 100%)"
            />
            <StatCard
              title="Ausências"
              value={stats?.my_absences || 0}
              icon={XCircle}
              gradient="linear-gradient(135deg, #EF4444 0%, #F87171 100%)"
            />
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className="p-6"
            style={{
              background: 'rgba(26, 11, 46, 0.6)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '0'
            }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: '#F4F0FA' }}>
              Resumo de Atividades
            </h3>
            <div className="space-y-3">
              {user?.role === 'admin' ? (
                <>
                  <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span style={{ color: '#A291B5' }}>Professores Ativos</span>
                    <span className="font-bold" style={{ color: '#FFB800' }}>{stats?.total_teachers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span style={{ color: '#A291B5' }}>Alunos Matriculados</span>
                    <span className="font-bold" style={{ color: '#10B981' }}>{stats?.total_students || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#A291B5' }}>Turmas Ativas</span>
                    <span className="font-bold" style={{ color: '#8B5CF6' }}>{stats?.total_classes || 0}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span style={{ color: '#A291B5' }}>Turmas Atribuídas</span>
                    <span className="font-bold" style={{ color: '#FFB800' }}>{stats?.my_classes || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span style={{ color: '#A291B5' }}>Alunos sob Responsabilidade</span>
                    <span className="font-bold" style={{ color: '#10B981' }}>{stats?.my_students || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#A291B5' }}>Taxa de Frequência</span>
                    <span className="font-bold" style={{ color: '#3B82F6' }}>
                      {stats?.my_presences && stats?.my_absences 
                        ? `${Math.round((stats.my_presences / (stats.my_presences + stats.my_absences)) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            className="p-6"
            style={{
              background: 'rgba(26, 11, 46, 0.6)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '0'
            }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: '#F4F0FA' }}>
              Ações Rápidas
            </h3>
            <div className="space-y-2">
              {user?.role === 'admin' ? (
                <>
                  <p className="text-sm" style={{ color: '#A291B5' }}>
                    • Cadastrar novo professor
                  </p>
                  <p className="text-sm" style={{ color: '#A291B5' }}>
                    • Adicionar novo aluno
                  </p>
                  <p className="text-sm" style={{ color: '#A291B5' }}>
                    • Criar nova turma
                  </p>
                  <p className="text-sm" style={{ color: '#A291B5' }}>
                    • Matricular aluno em turma
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm" style={{ color: '#A291B5' }}>
                    • Agendar nova aula
                  </p>
                  <p className="text-sm" style={{ color: '#A291B5' }}>
                    • Fazer chamada
                  </p>
                  <p className="text-sm" style={{ color: '#A291B5' }}>
                    • Adicionar anotações sobre alunos
                  </p>
                  <p className="text-sm" style={{ color: '#A291B5' }}>
                    • Ver histórico de frequência
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;