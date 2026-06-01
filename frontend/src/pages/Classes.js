import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Plus, Trash, Pencil } from '@phosphor-icons/react';
import { toast } from 'sonner';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({ name: '', instrument: '', schedule: '', teacher_id: '' });
  const [enrollData, setEnrollData] = useState({ student_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes, studentsRes] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/teachers'),
        api.get('/admin/students')
      ]);
      setClasses(classesRes.data);
      setTeachers(teachersRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/classes', formData);
      toast.success('Turma criada com sucesso!');
      setShowModal(false);
      setFormData({ name: '', instrument: '', schedule: '', teacher_id: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao criar turma');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente remover esta turma?')) {
      try {
        await api.delete(`/admin/classes/${id}`);
        toast.success('Turma removida com sucesso!');
        fetchData();
      } catch (error) {
        toast.error('Erro ao remover turma');
      }
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/classes/${selectedClass}/enroll`, enrollData);
      toast.success('Aluno matriculado com sucesso!');
      setShowEnrollModal(false);
      setEnrollData({ student_id: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao matricular aluno');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#F4F0FA' }}>Turmas</h1>
            <p style={{ color: '#A291B5' }}>Gerencie as turmas e matrículas</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            data-testid="create-class-button"
            className="flex items-center space-x-2 px-6 py-3 font-semibold transition-colors duration-200"
            style={{ background: '#FFB800', color: '#090412', borderRadius: '0' }}
            onMouseEnter={(e) => e.target.style.background = '#FFC933'}
            onMouseLeave={(e) => e.target.style.background = '#FFB800'}
          >
            <Plus size={20} weight="bold" />
            <span>Nova Turma</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              data-testid={`class-card-${cls.id}`}
              className="p-6"
              style={{
                background: 'rgba(26, 11, 46, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0'
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: '#F4F0FA' }}>{cls.name}</h3>
                  <p className="text-sm mb-2" style={{ color: '#A291B5' }}>{cls.instrument}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedClass(cls.id);
                      setShowEnrollModal(true);
                    }}
                    className="p-2 transition-colors duration-200"
                    style={{ color: '#10B981' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    data-testid={`delete-class-${cls.id}`}
                    className="p-2 transition-colors duration-200"
                    style={{ color: '#EF4444' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span className="text-sm" style={{ color: '#A291B5' }}>Professor:</span>
                  <span className="text-sm font-medium" style={{ color: '#F4F0FA' }}>{cls.teacher_name || 'Não atribuído'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm" style={{ color: '#A291B5' }}>Horário:</span>
                  <span className="text-sm font-medium" style={{ color: '#F4F0FA' }}>{cls.schedule || '-'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {classes.length === 0 && !loading && (
          <div className="text-center py-16" style={{ color: '#A291B5' }}>
            Nenhuma turma cadastrada
          </div>
        )}
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
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#F4F0FA' }}>Nova Turma</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>Nome da Turma</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="class-name-input"
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
                <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>Instrumento</label>
                <input
                  type="text"
                  value={formData.instrument}
                  onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                  data-testid="class-instrument-input"
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
                <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>Horário</label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  data-testid="class-schedule-input"
                  className="w-full px-4 py-3 outline-none"
                  style={{
                    background: '#090412',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F4F0FA',
                    borderRadius: '0'
                  }}
                  placeholder="Ex: Segunda e Quarta 14h-15h"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>Professor</label>
                <select
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  data-testid="class-teacher-select"
                  className="w-full px-4 py-3 outline-none"
                  style={{
                    background: '#090412',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F4F0FA',
                    borderRadius: '0'
                  }}
                >
                  <option value="">Selecione um professor</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
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
                  data-testid="submit-class-button"
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

      {showEnrollModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowEnrollModal(false)}
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
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#F4F0FA' }}>Matricular Aluno</h2>
            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>Selecione o Aluno</label>
                <select
                  value={enrollData.student_id}
                  onChange={(e) => setEnrollData({ student_id: e.target.value })}
                  required
                  data-testid="enroll-student-select"
                  className="w-full px-4 py-3 outline-none"
                  style={{
                    background: '#090412',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F4F0FA',
                    borderRadius: '0'
                  }}
                >
                  <option value="">Selecione um aluno</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
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
                  data-testid="submit-enroll-button"
                  className="flex-1 px-4 py-3 font-semibold transition-colors duration-200"
                  style={{ background: '#FFB800', color: '#090412', borderRadius: '0' }}
                  onMouseEnter={(e) => e.target.style.background = '#FFC933'}
                  onMouseLeave={(e) => e.target.style.background = '#FFB800'}
                >
                  Matricular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Classes;
