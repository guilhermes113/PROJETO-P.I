import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Plus, Calendar, CheckCircle, XCircle, ClipboardText } from '@phosphor-icons/react';
import { toast } from 'sonner';

const Sessions = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [formData, setFormData] = useState({ class_id: '', scheduled_date: '', notes: '' });
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/teacher/classes');
      setClasses(response.data);
    } catch (error) {
      toast.error('Erro ao carregar turmas');
    }
  };

  const fetchSessions = async (classId) => {
    setSelectedClass(classId);
    try {
      const response = await api.get(`/teacher/classes/${classId}/sessions`);
      setSessions(response.data);
    } catch (error) {
      toast.error('Erro ao carregar aulas');
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teacher/sessions', {
        ...formData,
        class_id: selectedClass
      });
      toast.success('Aula agendada com sucesso!');
      setShowCreateModal(false);
      setFormData({ class_id: '', scheduled_date: '', notes: '' });
      fetchSessions(selectedClass);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao agendar aula');
    }
  };

  const openAttendance = async (sessionId) => {
    try {
      const response = await api.get(`/teacher/sessions/${sessionId}/attendance`);
      setAttendanceList(response.data.map(a => ({
        student_id: a.student_id,
        name: a.name,
        status: a.status || 'present'
      })));
      setCurrentSessionId(sessionId);
      setShowAttendanceModal(true);
    } catch (error) {
      toast.error('Erro ao carregar chamada');
    }
  };

  const handleMarkAttendance = async () => {
    try {
      for (const att of attendanceList) {
        await api.post(`/teacher/sessions/${currentSessionId}/attendance`, {
          student_id: att.student_id,
          status: att.status,
          notes: ''
        });
      }
      toast.success('Chamada registrada com sucesso!');
      setShowAttendanceModal(false);
      setAttendanceList([]);
      fetchSessions(selectedClass);
    } catch (error) {
      toast.error('Erro ao registrar chamada');
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendanceList(prev =>
      prev.map(att =>
        att.student_id === studentId
          ? { ...att, status: att.status === 'present' ? 'absent' : 'present' }
          : att
      )
    );
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

  return (
    <Layout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#F4F0FA' }}>Aulas</h1>
          <p style={{ color: '#A291B5' }}>Agende aulas e registre a frequência dos alunos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de turmas */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#F4F0FA' }}>Turmas</h2>
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => fetchSessions(cls.id)}
                data-testid={`session-class-${cls.id}`}
                className="w-full text-left p-4 transition-colors duration-200"
                style={{
                  background: selectedClass === cls.id ? 'rgba(255, 184, 0, 0.1)' : 'rgba(26, 11, 46, 0.6)',
                  backdropFilter: 'blur(16px)',
                  border: selectedClass === cls.id ? '1px solid rgba(255, 184, 0, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '0'
                }}
              >
                <h3 className="font-bold mb-1" style={{ color: selectedClass === cls.id ? '#FFB800' : '#F4F0FA' }}>{cls.name}</h3>
                <p className="text-sm" style={{ color: '#A291B5' }}>{cls.instrument}</p>
                <p className="text-xs mt-1" style={{ color: '#A291B5' }}>{cls.schedule}</p>
              </button>
            ))}
            {classes.length === 0 && (
              <p className="text-center py-8" style={{ color: '#A291B5' }}>Nenhuma turma atribuída</p>
            )}
          </div>

          {/* Lista de aulas da turma */}
          <div className="lg:col-span-2">
            <div
              className="p-6"
              style={{
                background: 'rgba(26, 11, 46, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0'
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold" style={{ color: '#F4F0FA' }}>Aulas Agendadas</h2>
                {selectedClass && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    data-testid="create-session-button"
                    className="flex items-center space-x-2 px-4 py-2 font-semibold transition-colors duration-200"
                    style={{ background: '#FFB800', color: '#090412', borderRadius: '0' }}
                    onMouseEnter={(e) => e.target.style.background = '#FFC933'}
                    onMouseLeave={(e) => e.target.style.background = '#FFB800'}
                  >
                    <Plus size={18} weight="bold" />
                    <span>Agendar Aula</span>
                  </button>
                )}
              </div>

              {!selectedClass ? (
                <div className="text-center py-16">
                  <Calendar size={48} weight="duotone" color="#A291B5" className="mx-auto mb-4" />
                  <p style={{ color: '#A291B5' }}>Selecione uma turma para ver as aulas</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar size={48} weight="duotone" color="#A291B5" className="mx-auto mb-4" />
                  <p style={{ color: '#A291B5' }}>Nenhuma aula agendada. Clique em "Agendar Aula" para criar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      data-testid={`session-row-${session.id}`}
                      className="flex items-center justify-between p-4"
                      style={{
                        background: 'rgba(9, 4, 18, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '0'
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-12 h-12 flex items-center justify-center"
                          style={{ background: 'rgba(255, 184, 0, 0.1)', border: '1px solid rgba(255, 184, 0, 0.3)' }}
                        >
                          <Calendar size={24} weight="duotone" color="#FFB800" />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: '#F4F0FA' }}>{formatDate(session.scheduled_date)}</p>
                          {session.notes && (
                            <p className="text-sm" style={{ color: '#A291B5' }}>{session.notes}</p>
                          )}
                          <p className="text-xs mt-1" style={{ color: session.attendance_count > 0 ? '#10B981' : '#A291B5' }}>
                            {session.attendance_count > 0
                              ? `✓ Chamada feita (${session.attendance_count} alunos)`
                              : 'Chamada pendente'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => openAttendance(session.id)}
                        data-testid={`attendance-button-${session.id}`}
                        className="flex items-center space-x-2 px-4 py-2 font-semibold transition-colors duration-200"
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255, 184, 0, 0.5)',
                          color: '#FFB800',
                          borderRadius: '0'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 184, 0, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <ClipboardText size={18} />
                        <span>{session.attendance_count > 0 ? 'Editar Chamada' : 'Fazer Chamada'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Agendar Aula */}
      {showCreateModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowCreateModal(false)}
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
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#F4F0FA' }}>Agendar Nova Aula</h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>Data e Hora</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  required
                  data-testid="session-date-input"
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
                <label className="block text-sm font-medium mb-2" style={{ color: '#F4F0FA' }}>Observações (opcional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  data-testid="session-notes-input"
                  rows="3"
                  className="w-full px-4 py-3 outline-none"
                  style={{
                    background: '#090412',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F4F0FA',
                    borderRadius: '0'
                  }}
                  placeholder="Tema da aula, conteúdo previsto, etc."
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  data-testid="submit-session-button"
                  className="flex-1 px-4 py-3 font-semibold transition-colors duration-200"
                  style={{ background: '#FFB800', color: '#090412', borderRadius: '0' }}
                  onMouseEnter={(e) => e.target.style.background = '#FFC933'}
                  onMouseLeave={(e) => e.target.style.background = '#FFB800'}
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Fazer Chamada */}
      {showAttendanceModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-lg p-6"
            style={{
              background: '#1A0B2E',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0'
            }}
          >
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#F4F0FA' }}>Registrar Chamada</h2>
            <p className="text-sm mb-6" style={{ color: '#A291B5' }}>Clique para alternar presença/falta de cada aluno</p>
            
            {attendanceList.length === 0 ? (
              <p className="text-center py-8" style={{ color: '#A291B5' }}>Nenhum aluno matriculado nesta turma</p>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {attendanceList.map((att) => (
                    <button
                      key={att.student_id}
                      onClick={() => toggleAttendance(att.student_id)}
                      data-testid={`attendance-${att.student_id}`}
                      className="w-full flex items-center justify-between p-4 transition-colors duration-200"
                      style={{
                        background: att.status === 'present' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: att.status === 'present' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '0'
                      }}
                    >
                      <span style={{ color: '#F4F0FA' }}>{att.name}</span>
                      {att.status === 'present' ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold" style={{ color: '#10B981' }}>PRESENTE</span>
                          <CheckCircle size={24} weight="fill" color="#10B981" />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold" style={{ color: '#EF4444' }}>FALTOU</span>
                          <XCircle size={24} weight="fill" color="#EF4444" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowAttendanceModal(false)}
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
                    onClick={handleMarkAttendance}
                    data-testid="submit-attendance-button"
                    className="flex-1 px-4 py-3 font-semibold transition-colors duration-200"
                    style={{ background: '#FFB800', color: '#090412', borderRadius: '0' }}
                    onMouseEnter={(e) => e.target.style.background = '#FFC933'}
                    onMouseLeave={(e) => e.target.style.background = '#FFB800'}
                  >
                    Salvar Chamada
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Sessions;
