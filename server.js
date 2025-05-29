const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rankings = [];

io.on('connection', socket => {
    console.log('Novo jogador conectado');

    socket.emit('update-rankings', rankings); // Envia ranking atual para novo jogador

    socket.on('submit-score', playerData => {
        rankings.push(playerData);
        rankings.sort((a, b) => b.score - a.score);
        rankings = rankings.slice(0, 10);

        io.emit('update-rankings', rankings);
    });

    socket.on('disconnect', () => {
        console.log('Jogador desconectado');
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
