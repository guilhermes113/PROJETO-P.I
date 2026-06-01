# PRD - Sistema de Gestão de Escola de Música

## Declaração original do problema
Sistema web simples, interno e funcional para a gestão de uma escola de música.

## Arquitetura
- **Backend**: Flask + asgiref (wrapper WsgiToAsgi para uvicorn) + SQLite
- **Frontend**: React + Tailwind + Ícones de fósforo + Sonner (brindes)
- **Auth**: JWT (bcrypt + PyJWT) com 2 perfis: admin e teacher
- **Banco de dados**: SQLite com 8 tabelas relacionais

## Personas do usuário
1. **Coordenador (Admin)**: Gerencia toda a escola - turmas, professores, alunos
2. **Professor**: Acesso restrito às suas turmas - aulas, chamada, anotações

## Requisitos Básicos
### Administrador
- CRUD de Professores (criar, listar, excluir, registrar ausência)
- CRUD de Alunos (criar, listar, excluir)
- CRUD de Turmas (criar, atualizar, excluir, aceitar professor)
- Alunos matriculados em turmas
- Dashboard com métricas globais

### Professor
- Visualizar turmas atribuídas
- Visualizar alunos das suas turmas
- Agendar aulas
- Fazer chamada (presente/ausente)
- Adicionar anotações sobre alunos
- Dashboard com avaliações pessoais

## Status de implementação (27/05/2026)

### Implementado ✅
- [x] Backend Flask + SQLite com 8 tabelas
- [x] Schema SQL completo com relacionamentos
- [x] Autenticação JWT (bcrypt + PyJWT)
- [x] Endpoints Admin completos (CRUD + matrículas)
- [x] Endpoints Professor completos (turmas, aulas, chamada, anotações)
- [x] Dashboard com métricas baseadas em funções
- [x] Dados iniciais: 1 coordenador + 2 professores + 3 alunos + 2 turmas
- [x] Frontend React com 7 páginas (Login, Dashboard, Professores, Alunos, Turmas, MyClasses, Sessões)
- [x] Tema roxo escuro/meia-noite seguindo as diretrizes de design
- [x] Barra lateral baseada em funções (menus diferentes por perfil)
- [x] ProtectedRoute com seleção de função
- [x] Toasts com Sonner para feedback
- [x] data-testid em todos os elementos interativos
- [x] Agente de testes: Backend 100% (28/28) + Frontend 100%

## Credenciais de teste
Ver `/app/memory/test_credentials.md`
- Administrador: coordenador@escola.com / admin123
-Maria Silva: maria.silva@escola.com/prof123
- João Santos: joao.santos@escola.com / prof123

## Backlog Priorizado (P0/P1/P2)

### P1 - Melhorias de Segurança
- [ ] Verificação de titularidade em mark_attendance (professor só marca presença em suas turmas)
- [ ] Verificação de propriedade em add_student_note (professor só anota sobre alunos das suas turmas)
- [ ] JWT_SECRET obrigatório via env (não codificado)
- [] Limitação de taxa/proteção de força bruta em /api/auth/login

### P2 - Funcionalidades Avançadas
- [ ] Página de visualização do histórico de presença
- [ ] Página de visualização de anotações por aluno
- [ ] Registrador de ausências de professores via UI
- [ ] Gráficos no dashboard (recharts)
- [ ] Exportar relatórios em PDF
- [ ] Notificações de aulas próximas
- [ ] Edição inline de turmas/alunos (não só criar/deletar)
- [ ] Página específica de detalhes do aluno

### P2 - Refatorações
- [ ] Dividir server.py em blueprints (auth, admin, teacher, dashboard)
- [] Substituir estilos inline por classes Tailwind
- [ ] Adicionar testes unitários sem frontend

## Próximas tarefas
1. Implementar melhorias de segurança P1
2. Adicionar gráficos no painel
3. Implementar visualizações de histórico (presença + anotações)