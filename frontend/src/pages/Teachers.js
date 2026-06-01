import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Plus, Trash, Key } from '@phosphor-icons/react';
import { toast } from 'sonner';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/admin/teachers');
      setTeachers(response.data);
    } catch (error) {
      toast.error('Erro ao carregar professores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/teachers', formData);
      toast.success('Professor criado com sucesso!');
      setShowModal(false);
      setFormData({ name: '', email: '', password: '' });
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao criar professor');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente remover este professor?')) {
      try {
        await api.delete(`/admin/teachers/${id}`);
        toast.success('Professor removido com sucesso!');
        fetchTeachers();
      } catch (error) {
        toast.error('Erro ao remover professor');
      }
    }
  };

  const openPasswordModal = (teacher) => {
    setSelectedTeacher(teacher);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    try {
      await api.put(`/admin/teachers/${selectedTeacher.id}/password`, { password: newPassword });
      toast.success(`Senha do professor ${selectedTeacher.name} alterada com sucesso!`);
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedTeacher(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao alterar senha');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#F4F0FA' }}>Professores</h1>
            <p style={{ color: '#A291B5' }}>Gerencie os professores da escola</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            data-testid="create-teacher-button"
            className="flex items-center space-x-2 px-6 py-3 font-semibold transition-colors duration-200"
            style={{ background: '#FFB800', color: '#090412', borderRadius: '0' }}
            onMouseEnter={(e) => e.target.style.background = '#FFC933'}
            onMouseLeave={(e) => e.target.style.background = '#FFB800'}
          >
            <Plus size={20} weight="bold" />
            <span>Novo Professor</span>
          </button>
        </div>

        <div
          className="overflow-hidden"
          style={{
            background: 'rgba(26, 11, 46, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '0'
          }}
        >
          <table className="w-full">
            <thead style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <tr>
                <th className="text-left p-4 text-xs uppercase tracking-wider font-semibold" style={{ color: '#A291B5' }}>Nome</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider font-semibold" style={{ color: '#A291B5' }}>Email</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider font-semibold" style={{ color: '#A291B5' }}>Status</th>
                <th className="text-right p-4 text-xs uppercase tracking-wider font-semibold" style={{ color: '#A291B5' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  data-testid={`teacher-row-${teacher.id}`}
                  className="transition-colors duration-200"
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="p-4" style={{ color: '#F4F0FA' }}>{teacher.name}</td>
                  <td className="p-4" style={{ color: '#A291B5' }}>{teacher.email}</td>
                  <td className="p-4">
                    <span
                      className="px-3 py-1 text-xs font-semibold"
                      style={{
                        background: teacher.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: teacher.active ? '#10B981' : '#EF4444',
                        borderRadius: '0'
                      }}
                    >
                      {teacher.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => openPasswordModal(teacher)}
                        data-testid={`change-password-teacher-${teacher.id}`}
                        title="Alterar senha"
                        className="p-2 transition-colors duration-200"
                        style={{ color: '#FFB800' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 184, 0, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Key size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        data-testid={`delete-teacher-${teacher.id}`}
                        title="Remover professor"
                        className="p-2 transition-colors duration-200"
                        style={{ color: '#EF4444' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {teachers.length === 0 && !loading && (
            <div className="p-8 text-center" style={{ color: '#A291B5' }}>
              Nenhum professor cadastrado
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md p-6"
            style={{
              background: '#1A0B2E',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#F4F0FA' }}>Novo Professor</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="teacher-name-input"
                  className="w-full px-4 py-3 outline-none"
                  style={{
                    background: '#090412',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F4F0FA',
                    borderRadius: '0'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="teacher-email-input"
                  className="w-full px-4 py-3 outline-none"
                  style={{
                    background: '#090412',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F4F0FA',
                    borderRadius: '0'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>Senha</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  data-testid="teacher-password-input"
                  className="w-full px-4 py-3 outline-none"
                  style={{
                    background: '#090412',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F4F0FA',
                    borderRadius: '0'
                  }}
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  data-testid="cancel-teacher-button"
                  className="flex-1 px-4 py-3 font-semibold transition-colors duration-200"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#F4F0FA',
                    borderRadius: '0'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  data-testid="submit-teacher-button"
                  className="flex-1 px-4 py-3 font-semibold transition-colors duration-200"
                  style={{ background: '#FFB800', color: '#090412', borderRadius: '0' }}
                  onMouseEnter={(e) => e.target.style.background = '#FFC933'}
                  onMouseLeave={(e) => e.target.style.background = '#FFB800'}
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Alterar senha do professor */}
      {showPasswordModal && selectedTeacher && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="w-full max-w-md p-6"
            style={{
              background: '#1A0B2E',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#F4F0FA' }}>Alterar Senha</h2>
            <p className="text-sm mb-6" style={{ color: '#A291B5' }}>
              Professor: <span style={{ color: '#FFB800' }}>{selectedTeacher.name}</span>
            </p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>Nova Senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  data-testid="new-password-input"
                  className="w-full px-4 py-3 outline-none"
                  style={{
                    background: '#090412',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F4F0FA',
                    borderRadius: '0'
                  }}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-3 font-semibold transition-colors duration-200"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#F4F0FA',
                    borderRadius: '0'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  data-testid="submit-password-button"
                  className="flex-1 px-4 py-3 font-semibold transition-colors duration-200"
                  style={{ background: '#FFB800', color: '#090412', borderRadius: '0' }}
                  onMouseEnter={(e) => e.target.style.background = '#FFC933'}
                  onMouseLeave={(e) => e.target.style.background = '#FFB800'}
                >
                  Alterar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Teachers;