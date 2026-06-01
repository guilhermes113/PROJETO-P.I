import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft, GraduationCap, EnvelopeSimple, Phone, CheckCircle, XCircle,
  ChartLine, Notepad, Plus, Calendar, MusicNote
} from '@phosphor-icons/react';
import { toast } from 'sonner';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/students/${id}/profile`);
      setData(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao carregar perfil');
      navigate(user?.role === 'admin' ? '/students' : '/my-classes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await api.post(`/students/${id}/notes`, { note_text: newNote });
      toast.success('Anotação adicionada com sucesso!');
      setNewNote('');
      setShowNoteModal(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao adicionar anotação');
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateOnly = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  if (loading || !data) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p style={{ color: '#FFB800' }}>Carregando perfil...</p>
        </div>
      </Layout>
    );
  }

  const { student, classes, stats, attendance_history, notes } = data;

  const StatCard = ({ label, value, icon: Icon, color, bg }) => (
    <div
      className="p-5"
      style={{
        background: 'rgba(26, 11, 46, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '0'
      }}
      data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#A291B5' }}>
          {label}
        </p>
        <div className="w-9 h-9 flex items-center justify-center" style={{ background: bg }}>
          <Icon size={18} weight="duotone" color={color} />
        </div>
      </div>
      <p className="text-3xl font-bold" style={{ color: '#F4F0FA' }}>{value}</p>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl">
        {/* Header com botão voltar */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            data-testid="back-button"
            className="flex items-center space-x-2 mb-4 text-sm transition-colors duration-200"
            style={{ color: '#A291B5' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#F4F0FA'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#A291B5'}
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-16 h-16 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FFB800 0%, #FFC933 100%)' }}
              >
                <GraduationCap size={32} weight="duotone" color="#090412" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-1" style={{ color: '#F4F0FA' }}>{student.name}</h1>
                <div className="flex items-center space-x-4 text-sm" style={{ color: '#A291B5' }}>
                  {student.email && (
                    <div className="flex items-center space-x-1">
                      <EnvelopeSimple size={14} />
                      <span>{student.email}</span>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone size={14} />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>Matrícula: {formatDateOnly(student.enrollment_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {user?.role === 'teacher' && (
              <button
                onClick={() => setShowNoteModal(true)}
                data-testid="add-note-button"
                className="flex items-center space-x-2 px-5 py-3 font-semibold transition-colors duration-200"
                style={{ background: '#FFB800', color: '#090412', borderRadius: '0' }}
                onMouseEnter={(e) => e.target.style.background = '#FFC933'}
                onMouseLeave={(e) => e.target.style.background = '#FFB800'}
              >
                <Plus size={18} weight="bold" />
                <span>Nova Anotação</span>
              </button>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Presenças"
            value={stats.total_present}
            icon={CheckCircle}
            color="#10B981"
            bg="rgba(16, 185, 129, 0.15)"
          />
          <StatCard
            label="Faltas"
            value={stats.total_absent}
            icon={XCircle}
            color="#EF4444"
            bg="rgba(239, 68, 68, 0.15)"
          />
          <StatCard
            label="Total de Aulas"
            value={stats.total_classes}
            icon={Calendar}
            color="#8B5CF6"
            bg="rgba(139, 92, 246, 0.15)"
          />
          <StatCard
            label="Taxa de Frequência"
            value={`${stats.attendance_rate}%`}
            icon={ChartLine}
            color="#FFB800"
            bg="rgba(255, 184, 0, 0.15)"
          />
        </div>

        {/* Turmas matriculadas */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#F4F0FA' }}>Turmas Matriculadas</h2>
          {classes.length === 0 ? (
            <div
              className="p-6 text-center"
              style={{
                background: 'rgba(26, 11, 46, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0',
                color: '#A291B5'
              }}
            >
              Aluno não está matriculado em nenhuma turma
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-5"
                  style={{
                    background: 'rgba(26, 11, 46, 0.6)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0'
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'rgba(255, 184, 0, 0.1)' }}>
                      <MusicNote size={20} weight="duotone" color="#FFB800" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold" style={{ color: '#F4F0FA' }}>{cls.name}</h3>
                      <p className="text-sm" style={{ color: '#A291B5' }}>{cls.instrument} • {cls.schedule}</p>
                      <p className="text-xs mt-1" style={{ color: '#A291B5' }}>Professor: {cls.teacher_name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Histórico de Presenças */}
          <div
            className="p-6"
            style={{
              background: 'rgba(26, 11, 46, 0.6)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '0'
            }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2" style={{ color: '#F4F0FA' }}>
              <ChartLine size={22} weight="duotone" color="#FFB800" />
              <span>Histórico de Frequência</span>
            </h2>
            {attendance_history.length === 0 ? (
              <p className="text-center py-8" style={{ color: '#A291B5' }}>Nenhuma chamada registrada ainda</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {attendance_history.map((att, idx) => (
                  <div
                    key={idx}
                    data-testid={`attendance-row-${idx}`}
                    className="flex items-center justify-between p-3"
                    style={{
                      background: 'rgba(9, 4, 18, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '0'
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#F4F0FA' }}>{att.class_name}</p>
                      <p className="text-xs" style={{ color: '#A291B5' }}>{formatDate(att.scheduled_date)}</p>
                    </div>
                    {att.status === 'present' ? (
                      <div className="flex items-center space-x-2 px-3 py-1" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                        <CheckCircle size={16} weight="fill" color="#10B981" />
                        <span className="text-xs font-semibold" style={{ color: '#10B981' }}>PRESENTE</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-1" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                        <XCircle size={16} weight="fill" color="#EF4444" />
                        <span className="text-xs font-semibold" style={{ color: '#EF4444' }}>FALTOU</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Anotações de Desempenho */}
          <div
            className="p-6"
            style={{
              background: 'rgba(26, 11, 46, 0.6)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '0'
            }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2" style={{ color: '#F4F0FA' }}>
              <Notepad size={22} weight="duotone" color="#FFB800" />
              <span>Desempenho e Anotações</span>
            </h2>
            {notes.length === 0 ? (
              <p className="text-center py-8" style={{ color: '#A291B5' }}>Nenhuma anotação registrada</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    data-testid={`note-row-${note.id}`}
                    className="p-4"
                    style={{
                      background: 'rgba(9, 4, 18, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '0',
                      borderLeft: '3px solid #FFB800'
                    }}
                  >
                    <p className="text-sm mb-2" style={{ color: '#F4F0FA' }}>{note.note_text}</p>
                    <div className="flex items-center justify-between text-xs" style={{ color: '#A291B5' }}>
                      <span>{note.teacher_name}</span>
                      <span>{formatDate(note.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal adicionar anotação */}
      {showNoteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowNoteModal(false)}
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
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#F4F0FA' }}>Nova Anotação</h2>
            <p className="text-sm mb-6" style={{ color: '#A291B5' }}>
              Sobre: <span style={{ color: '#FFB800' }}>{student.name}</span>
            </p>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>Anotação de Desempenho</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  required
                  rows={5}
                  data-testid="note-text-input"
                  className="w-full px-4 py-3 outline-none resize-none"
                  style={{
                    background: '#090412',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F4F0FA',
                    borderRadius: '0'
                  }}
                  placeholder="Ex: Aluno demonstrou grande evolução na técnica de acordes..."
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
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
                  data-testid="submit-note-button"
                  className="flex-1 px-4 py-3 font-semibold transition-colors duration-200"
                  style={{ background: '#FFB800', color: '#090412', borderRadius: '0' }}
                  onMouseEnter={(e) => e.target.style.background = '#FFC933'}
                  onMouseLeave={(e) => e.target.style.background = '#FFB800'}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StudentProfile;
