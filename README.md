# 🎵 Sistema de Gestão Escolar (Escola de Música) - Projeto P.I.

Um sistema web completo desenvolvido para facilitar a gestão de uma escola de música. A plataforma permite o controle de alunos, professores, turmas, presenças e anotações de desempenho, oferecendo painéis dedicados com níveis de acesso estruturados para Administradores e Professores.

## 🚀 Funcionalidades

* **Autenticação e Segurança:** Login seguro com criptografia de senhas (bcrypt) e tokens de acesso (JWT).
* **Controle de Acesso (RBAC):** Rotas e visualizações protegidas dependendo do cargo do usuário (Admin vs. Teacher).
* **Gestão de Usuários:** Cadastro, listagem e remoção de alunos e professores (Exclusivo para Administradores).
* **Gestão de Turmas:** Criação de turmas por instrumento, definição de horários e atribuição de professores responsáveis.
* **Controle de Frequência:** Registro interativo de presença/falta e visualização do histórico detalhado por aluno.
* **Acompanhamento de Desempenho:** Sistema de anotações e feedback contínuo para os alunos durante as aulas.
* **Dashboard Interativo:** Painel de controle com estatísticas em tempo real sobre total de matrículas, aulas, faltas e presenças.

## 🛠️ Tecnologias Utilizadas

**Frontend:**
* React (v19)
* Tailwind CSS (Estilização)
* React Day Picker (Gerenciamento de calendário e datas)

**Backend:**
* Python 3
* Flask & Flask-CORS (Criação da API RESTful)
* SQLite3 (Banco de dados leve, rápido e embutido)
* JWT (JSON Web Tokens para autenticação)
* Bcrypt (Hashing de senhas)

## 💻 Guia de Inicialização (Como rodar localmente)

### Pré-requisitos
* [Node.js e npm](https://nodejs.org/) instalados.
* [Python 3](https://www.python.org/) instalado.
* Git instalado em sua máquina.

### 1. Clonando o Repositório
Abra o seu terminal e rode os comandos:
```bash
git clone [https://github.com/guilhermes113/PROJETO-P.I.git](https://github.com/guilhermes113/PROJETO-P.I.git)
cd PROJETO-P.I/app

```

### 2. Configurando o Backend (Terminal 1)

Abra um terminal, navegue até a pasta do backend e inicie o servidor da API:

```bash
cd backend

# Ative o ambiente virtual (No Windows)
venv\Scripts\activate

# Instale as dependências necessárias
pip install -r requirements.txt
pip install asgiref

# Crie um arquivo .env na pasta backend com as seguintes variáveis:
# CORS_ORIGINS="*"
# JWT_SECRET="sua_chave_secreta_local"

# Inicie o servidor
python server.py

```

> **Nota:** O banco de dados (`music_school.db`) será criado e populado automaticamente com os dados iniciais assim que o servidor for iniciado. O backend rodará na porta `http://localhost:8001`.

### 3. Configurando o Frontend (Terminal 2)

Mantenha o backend rodando, abra um segundo terminal e configure a interface:

```bash
cd frontend

# Instale as dependências (ignorando o rigor de conflitos de versão do React 19)
npm install --legacy-peer-deps

# Crie um arquivo .env na pasta frontend com as variáveis:
# REACT_APP_BACKEND_URL=http://localhost:8001
# ENABLE_HEALTH_CHECK=false

# Inicie a aplicação
npm start

```

A aplicação abrirá automaticamente no seu navegador. Basta realizar o login com as credenciais geradas no banco de dados para acessar o sistema.

## 🗄️ Estrutura do Banco de Dados

O projeto utiliza um banco relacional estruturado em SQLite com as seguintes tabelas principais:

* `users` (Gestão de Administradores e Professores)
* `students` (Dados cadastrais dos alunos)
* `classes` (Turmas associadas aos instrumentos)
* `enrollments` (Matrículas que ligam alunos às turmas)
* `class_sessions` (Sessões e agendamentos de aulas)
* `attendance` (Registros de presença/falta)
* `student_notes` (Anotações gerais e relatórios de desempenho)

---

*Este README foi elaborado com a assistência da inteligência artificial GEMINI PRO.*

```

```
