require('dotenv').config({ path: `${__dirname}/.env` });

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = Number(process.env.PORT || 5000);
const host = process.env.HOST || '0.0.0.0';
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'quest_global_todos';
const frontendOrigin = process.env.FRONTEND_ORIGIN || '';

const corsOptions = frontendOrigin
  ? {
      origin(origin, callback) {
        if (!origin || origin === frontendOrigin) {
          callback(null, true);
          return;
        }
        callback(new Error('CORS blocked for this origin.'));
      },
    }
  : {};

app.use(cors(corsOptions));
app.use(express.json());

const mongoClient = new MongoClient(mongoUri);
let todosCollection;

function mapTodo(doc) {
  return {
    ...doc,
    _id: String(doc._id),
  };
}

app.get('/api/todos', async (_req, res) => {
  try {
    const todos = await todosCollection.find().sort({ createdAt: -1 }).toArray();
    res.json(todos.map(mapTodo));
  } catch {
    res.status(500).json({ message: 'Unable to fetch todos.' });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    if (!title) {
      res.status(400).json({ message: 'Title is required.' });
      return;
    }

    const now = new Date().toISOString();
    const todo = {
      title,
      completed: Boolean(req.body?.completed),
      clientId: null,
      createdAt: now,
      updatedAt: now,
      __v: 0,
    };

    const result = await todosCollection.insertOne(todo);
    const created = await todosCollection.findOne({ _id: result.insertedId });
    res.status(201).json(mapTodo(created));
  } catch {
    res.status(500).json({ message: 'Unable to create todo.' });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const id = String(req.params.id || '');
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid todo id.' });
      return;
    }

    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    if (!title) {
      res.status(400).json({ message: 'Title is required.' });
      return;
    }

    const todoId = new ObjectId(id);
    const result = await todosCollection.findOneAndUpdate(
      { _id: todoId },
      {
        $set: {
          title,
          completed: Boolean(req.body?.completed),
          updatedAt: new Date().toISOString(),
        },
        $inc: { __v: 1 },
      },
      { returnDocument: 'after' },
    );

    if (!result) {
      res.status(404).json({ message: 'Todo not found.' });
      return;
    }

    res.json(mapTodo(result));
  } catch {
    res.status(500).json({ message: 'Unable to update todo.' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const id = String(req.params.id || '');
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid todo id.' });
      return;
    }

    const result = await todosCollection.deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) {
      res.status(404).json({ message: 'Todo not found.' });
      return;
    }

    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Unable to delete todo.' });
  }
});

app.post('/api/todos/sync', async (req, res) => {
  try {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const syncedAt = typeof req.body?.syncedAt === 'string' ? req.body.syncedAt : '';
    const incoming = Array.isArray(req.body?.todos) ? req.body.todos : [];

    if (!username || !syncedAt) {
      res.status(400).json({ message: 'username and syncedAt are required.' });
      return;
    }

    const now = new Date().toISOString();
    const docs = incoming
      .filter((todo) => todo && typeof todo.title === 'string' && todo.title.trim())
      .map((todo) => {
        const incomingId = typeof todo.id === 'string' ? todo.id : '';
        const hasObjectId = ObjectId.isValid(incomingId);
        return {
          _id: hasObjectId ? new ObjectId(incomingId) : new ObjectId(),
          title: todo.title.trim(),
          completed: Boolean(todo.completed),
          clientId: hasObjectId ? null : incomingId || null,
          createdAt: now,
          updatedAt: now,
          __v: 0,
        };
      });

    await todosCollection.deleteMany({});
    if (docs.length) {
      await todosCollection.insertMany(docs);
    }

    res.json({
      message: 'Sync completed.',
      username,
      syncedAt,
      count: docs.length,
    });
  } catch {
    res.status(500).json({ message: 'Unable to sync todos.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

async function startServer() {
  await mongoClient.connect();
  const db = mongoClient.db(dbName);
  todosCollection = db.collection('todos');
  await todosCollection.createIndex({ createdAt: -1 });

  app.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`Todo API server running at http://${host}:${port}`);
  });
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
});
