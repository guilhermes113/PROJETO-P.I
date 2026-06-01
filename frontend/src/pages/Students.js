import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Plus, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/students');
      setStudents(response.data);
    } catch (error) {
      toast.error('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/students', formData);
      toast.success('Aluno criado com sucesso!');
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '' });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao criar aluno');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente remover este aluno?')) {
      try {
        await api.delete(`/admin/students/${id}`);
        toast.success('Aluno removido com sucesso!');
        fetchStudents();
      } catch (error) {
        toast.error('Erro ao remover aluno');
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#F4F0FA' }}>Alunos</h1>
            <p style={{ color: '#A291B5' }}>Gerencie os alunos da escola</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            data-testid="create-student-button"
            className="flex items-center space-x-2 px-6 py-3 font-semibold transition-colors duration-200"
            style={{ background: '#FFB800', color: '#090412', borderRadius: '0' }}
            onMouseEnter={(e) => e.target.style.background = '#FFC933'}
            onMouseLeave={(e) => e.target.style.background = '#FFB800'}
          >
            <Plus size={20} weight="bold" />
            <span>Novo Aluno</span>
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
                <th className="text-left p-4 text-xs uppercase tracking-wider font-semibold" style={{ color: '#A291B5' }}>Telefone</th>
                <th className="text-right p-4 text-xs uppercase tracking-wider font-semibold" style={{ color: '#A291B5' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  data-testid={`student-row-${student.id}`}
                  className="transition-colors duration-200 cursor-pointer"
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  <td className="p-4 font-medium" style={{ color: '#FFB800' }}>{student.name}</td>
                  <td className="p-4" style={{ color: '#A291B5' }}>{student.email || '-'}</td>
                  <td className="p-4" style={{ color: '#A291B5' }}>{student.phone || '-'}</td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDelete(student.id)}
                      data-testid={`delete-student-${student.id}`}
                      className="p-2 transition-colors duration-200"
                      style={{ color: '#EF4444' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && !loading && (
            <div className="p-8 text-center" style={{ color: '#A291B5' }}>
              Nenhum aluno cadastrado
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
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#F4F0FA' }}>Novo Aluno</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="student-name-input"
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
                  data-testid="student-email-input"
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
                <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>Telefone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="student-phone-input"
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
                  data-testid="submit-student-button"
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
    </Layout>
  );
};

export default Students;
