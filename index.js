const cp = require('child_process');
const ws = require('ws');
const fs = require('fs');
const fse = require('fs-extra');

let sockets = [];
let server = new ws.Server({ port: 25566 });

let serverdir = '/home/ubuntu/killerfuckmcserver';
let mcserver = cp.spawn('java', [ '-Xmx14g', '-Xms14g', '-jar', 'fabric-server.jar' ], { cwd: serverdir });

server.on('connection', ( socket ) => {
    sockets.push(socket);

    socket.on('message', ( data ) => {
        mcserver.stdin.write(data + '\n');
    })

    socket.on('close', () => {
        sockets = sockets.filter(x => x !== socket);
    })
})

mcserver.stdout.on('data', ( data ) => {
    sockets.forEach(s => s.send(data));
})

mcserver.stderr.on('data', ( data ) => {
    sockets.forEach(s => s.send(data));
})

mcserver.on('spawn', () => {
    setInterval(() => {
        mcserver.stdin.write('say Backing Server Up...\n');
        mcserver.stdin.write('save-all\n');

        if(!fs.existsSync(__dirname + '/backups'))
            fs.mkdirSync(__dirname + '/backups');

        fse.copySync(serverdir + '/world', __dirname + '/backups/'+getDateFormatted());

        let files = fs.readdirSync(__dirname + '/backups');
        let date = Date.now();

        files.forEach(file => {
            let timestamp = parseInt(file.replace('(', '').split(')')[0]);

            if(timestamp + 172800000 < date)
                fs.rmdirSync(__dirname + '/backups/' + file);
        });

        mcserver.stdin.write('say Finished Backups.\n');
    }, 1800000);
})

let getDateFormatted = ( timestamp = Date.now() ) => {
    let d = new Date(timestamp);
    return '(' + timestamp + ') ' + d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() + ' ' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds();
}