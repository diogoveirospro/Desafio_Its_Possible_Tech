# Task Manager - Desafio Its Possible Tech
Este projeto é uma aplicação de gerenciamento de tarefas (To-Do List) que permite aos usuários criar, visualizar, concluir e excluir tarefas.
O objetivo é demonstrar competências no desenvolvimento de APIs RESTful com Node.js e interfaces reativas com React.

## 1. Tecnologias

### Backend:

- Node.js & Express: Servidor e rotas da API.

- MongoDB & Mongoose: Banco de dados NoSQL e modelagem de dados.

- Cors: Gerenciamento de permissões de acesso.

- Dotenv: Gerenciamento de variáveis de ambiente.

### Frontend:

- React & Vite: Framework para a interface.

- Axios: Cliente HTTP para consumo da API.

- CSS: Para estilização rápida e moderna.

## 2. Estrutura do Projeto

### Backend

```
Backend/
├── eslint.config.js
├── jest.config.js
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── api/
    │   ├── index.ts
    │   └── routes/
    │       └── taskRoute.ts
    ├── config/
    │   └── index.ts
    ├── controllers/
    │   ├── TaskController.ts
    │   └── IControllers/
    │       └── ITaskController.ts
    ├── core/
    │   └── ...
    ├── dataschema/
    │   └── ITaskPersistence.ts
    ├── domain/
    │   └── Task/
    │       ├── Entities/
    │       │   └── Task.ts
    │       └── ValueObjects/
    │           ├── TaskID.ts
    │           ├── TaskTitle.ts
    │           └── TaskStatus.ts
    ├── dto/
    │   └── ITaskDTO.ts
    ├── loaders/
    │   ├── index.ts
    │   ├── mongoose.ts
    │   ├── express.ts
    │   ├── logger.ts
    │   └── dependencyInjector.ts
    ├── mappers/
    │   └── TaskMapper.ts
    ├── persistence/
    │   └── schemas/
    │       └── TaskSchema.ts
    ├── repos/
    │   └── TaskRepository.ts
    ├── services/
    │   ├── TaskService.ts
    │   ├── IServices/
    │   │   └── ITaskService.ts
    │   └── IRepos/
    │       └── ITaskRepository.ts
    ├── tests/
    │   └── ...
    └── utils/
        └── IdGenerator.ts
```

### Frontend

```
Frontend/
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
│   └── vite.svg
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── assets/
    │   └── react.svg
    ├── components/
    │   └── Modal/
    │       ├── index.ts
    │       └── Modal.tsx
    ├── features/
    │   └── tasks/
    │       ├── components/
    │       │   ├── TaskCreate.tsx
    │       │   ├── TaskEdit.tsx
    │       │   └── TaskList.tsx
    │       ├── dtos/
    │       │   └── TaskDTO.ts
    │       ├── mappers/
    │       │   ├── TaskMapper.ts
    │       │   └── TaskMapper.spec.ts
    │       ├── models/
    │       │   └── Task.ts
    │       └── viewmodels/
    │           ├── TaskCreateViewModel.ts
    │           ├── TaskCreateViewModel.spec.ts
    │           ├── TaskEditViewModel.ts
    │           ├── TaskEditViewModel.spec.ts
    │           ├── TaskListViewModel.ts
    │           └── TaskListViewModel.spec.ts
    ├── services/
    │   ├── TaskService.ts
    │   └── TaskService.spec.ts
    └── styles/
        └── global.css
```

## 3. Instalação e Configuração
 
### 1. Clonar o repositório
   
``` Bash
git clone https://github.com/diogoveirospro/Desafio_Its_Possible_Tech.git
cd Desafio_Its_Possible_Tech
```

### 2. Configurar o Backend
   
1. Entre na pasta: **cd backend**

2. Instale as dependências: **npm install**

3. Crie um arquivo .env na raiz do backend:

```ENV
PORT=3000
MONGODB_URI='mongodb://localhost:27017/DesafioItsPossibleTech'
```
4. Inicie o servidor: **npm run start**

### 3. Configurar o Frontend
   
1. Entre na pasta: **cd frontend**

2. Instale as dependências: **npm install**

3. Inicie a aplicação: **npm run dev**

## 4. Endpoints da API (Backend)

| Método | Endpoint       | Descrição                             |
|--------|----------------|---------------------------------------|
| GET    | /api/tasks     | Lista todas as tarefas.               |
| POST   | /api/tasks     | Cria uma nova tarefa.                 |
| PATCH  | /api/tasks/:id | Marca tarefa como concluída/pendente. |
| DELETE | /api/tasks/:id | Remove uma tarefa.                    |

## 5. Passos para o Desenvolvimento

### Fase 1: Backend

1. Configurar o servidor Express.
2. Conectar ao MongoDB usando Mongoose.
3. Definir a estrutura do projeto.
4. Criar o modelo de dados para tarefas.
5. Implementar os endpoints da API.
6. Criar testes para os endpoints e funcionalidades.

### Fase 2: Frontend

1. Configurar o projeto React.
2. Definir a estrutura do projeto.
3. Criar os componentes principais.
4. Implementar a comunicação com a API.
5. Adicionar funcionalidades de criação, visualização, conclusão e exclusão de tarefas.
6. Testar a interface e a integração com o backend.
