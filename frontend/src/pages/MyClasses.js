import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Users, GraduationCap as Student } from '@phosphor-icons/react';
import { toast } from 'sonner';

const MyClasses = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/teacher/classes');
      setClasses(response.data);
    } catch (error) {
      toast.error('Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await api.get(`/teacher/classes/${classId}/students`);
      setStudents(response.data);
      setSelectedClass(classId);
    } catch (error) {
      toast.error('Erro ao carregar alunos');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#F4F0FA' }}>Minhas Turmas</h1>
          <p style={{ color: '#A291B5' }}>Gerencie suas turmas e alunos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#F4F0FA' }}>Turmas</h2>
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => fetchStudents(cls.id)}
                data-testid={`teacher-class-${cls.id}`}
                className="w-full text-left p-4 transition-colors duration-200"
                style={{
                  background: selectedClass === cls.id ? 'rgba(255, 184, 0, 0.1)' : 'rgba(26, 11, 46, 0.6)',
                  backdropFilter: 'blur(16px)',
                  border: selectedClass === cls.id ? '1px solid rgba(255, 184, 0, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '0'
                }}
              >
                <div className="flex items-start space-x-3">
                  <Users size={24} weight="duotone" color={selectedClass === cls.id ? '#FFB800' : '#A291B5'} />
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: selectedClass === cls.id ? '#FFB800' : '#F4F0FA' }}>{cls.name}</h3>
                    <p className="text-sm" style={{ color: '#A291B5' }}>{cls.instrument}</p>
                    <p className="text-xs mt-1" style={{ color: '#A291B5' }}>{cls.schedule}</p>
                  </div>
                </div>
              </button>
            ))}
            {classes.length === 0 && !loading && (
              <p className="text-center py-8" style={{ color: '#A291B5' }}>Nenhuma turma atribuída</p>
            )}
          </div>

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
              <h2 className="text-xl font-bold mb-6" style={{ color: '#F4F0FA' }}>Alunos da Turma</h2>
              {selectedClass ? (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      data-testid={`student-item-${student.id}`}
                      onClick={() => navigate(`/students/${student.id}`)}
                      className="flex items-center justify-between p-4 transition-colors duration-200 cursor-pointer"
                      style={{
                        background: 'rgba(9, 4, 18, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '0'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 184, 0, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 184, 0, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(9, 4, 18, 0.5)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #FFB800 0%, #FFC933 100%)' }}
                        >
                          <Student size={20} weight="duotone" color="#090412" />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: '#F4F0FA' }}>{student.name}</p>
                          <p className="text-sm" style={{ color: '#A291B5' }}>{student.email || 'Sem email'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: '#A291B5' }}>Matrícula: {new Date(student.enrolled_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  ))}
                  {students.length === 0 && (
                    <p className="text-center py-8" style={{ color: '#A291B5' }}>Nenhum aluno matriculado</p>
                  )}
                </div>
              ) : (
                <p className="text-center py-16" style={{ color: '#A291B5' }}>Selecione uma turma para ver os alunos</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyClasses;