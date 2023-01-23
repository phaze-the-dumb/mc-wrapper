const ws = require('ws');
let ws = new ws('ws://127.0.0.1:25566');

ws.on('connection', () => {
    console.log('Connected');
})

ws.on('data', ( data ) => {
    process.stdout.write(data);
})

ws.on('close', () => {
    console.log('Connection Closed');
})

process.stdin.on('data', ( data ) => {
    ws.send(data);
})