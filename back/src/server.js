// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Conexão com MongoDB
mongoose.connect('mongodb+srv://username:password@cluster0.mongodb.net/encanalogica?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Modelo para os scores
const Score = mongoose.model('Score', {
  name: String,
  score: Number,
  level: Number,
  date: { type: Date, default: Date.now }
});

io.on('connection', socket => {
  console.log('Novo jogador conectado');

  // Envia os rankings quando um cliente se conecta
  updateRankings(socket);

  socket.on('submit-score', async (playerData) => {
    try {
      // Salva o novo score
      const newScore = new Score({
        name: playerData.name,
        score: playerData.score,
        level: playerData.level
      });
      await newScore.save();
      
      // Atualiza todos os clientes
      updateRankings(io);
    } catch (err) {
      console.error('Erro ao salvar score:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Jogador desconectado');
  });
});

async function updateRankings(target) {
  try {
    const rankings = await Score.find()
      .sort({ score: -1 })
      .limit(10)
      .exec();
    
    target.emit('update-rankings', rankings);
  } catch (err) {
    console.error('Erro ao buscar rankings:', err);
  }
}

// Rota para a página de rankings
app.get('/rankings', async (req, res) => {
  try {
    const rankings = await Score.find()
      .sort({ score: -1 })
      .limit(10)
      .exec();
    
    res.json(rankings);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar rankings' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});