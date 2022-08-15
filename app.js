#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline')


const commands = {
	dev: [
		{
			id: 'admin',
			cwd: path.join(__dirname, 'admin'),
			env: {
				API_URL: "http://localhost:9999/",
				BUILD_PREFIXED: "admin",
			},
			command: '../node_modules/.bin/vue-cli-service',
			args: ['serve'],
		},
		{
			id: 'frontend',
			cwd: path.join(__dirname, 'frontend'),
			env: {
				API_URL: "http://localhost:9999/",
			},
			command: '../node_modules/.bin/vue-cli-service',
			args: ['serve', '--port', '8090'],
		},
		{
			id: 'backend',
			cwd: path.join(__dirname, 'backend'),
			env: {
				PORT: "9999",
			},
			command: '../node_modules/.bin/nodemon',
			args: ['app.js'],
		},
	],
	build: [
		{
			id: 'notify',
			cwd: path.join(__dirname, 'backend'),
			env: {
			},
			command: 'node',
			args: ['prebuild.js'],
		},
		{
			id: 'admin',
			cwd: path.join(__dirname, 'admin'),
			env: {
				BUILD_PREFIXED: "admin",
				API_URL: "/",
				NODE_ENV: "production"
			},
			command: '../node_modules/.bin/vue-cli-service',
			args: ['build', '--mode production'],
		},
		{
			id: 'frontend',
			cwd: path.join(__dirname, 'frontend'),
			env: {
				BUILD_PREFIXED: "",
				API_URL: "/",
				NODE_ENV: "production"
			},
			command: '../node_modules/.bin/vue-cli-service',
			args: ['build', '--mode production'],
		},
	],
	run: [
		{
			id: 'backend',
			cwd: path.join(__dirname, 'backend'),
			env: {
				PORT: process.env.PORT || "9999",
			},
			command: 'node',
			args: ['app.js'],
		},
	],
};


function clearConsole() {
	if (process.stdout.isTTY) {
		const blank = '\n'.repeat(process.stdout.rows);
		console.log(blank);
		readline.cursorTo(process.stdout, 0, 0);
		readline.clearScreenDown(process.stdout);
	}
}

const out = {};
let clearConsoleTimeout = null;

function log(processId, str) {
	if (!out[processId]) {
		out[processId] = [];
	}

	const data = (''+str).trim();
	if (data) {
		out[processId].push(data);
		console.log(`${processId}: ${data}`);
	}

	clearTimeout(clearConsoleTimeout);
	clearConsoleTimeout = setTimeout(()=>{
		clearConsole();

		for (let processId in out) {
			const toDisplay = out[processId].slice(-5);
			for (let line of toDisplay) {
				console.log(`${processId}: ${line}`);
			}
			console.log('');
			console.log('');
		}

	}, 2000);
}

const spawned = [];

async function doSpawn(settings) {
	const envCopy = {...process.env};
	Object.assign(envCopy, settings.env);

	const options = {
		env: envCopy,
		cwd: settings.cwd,
	};


	const proc = spawn(settings.command, settings.args, options);
	spawned.push(proc);

	return await new Promise((res)=>{
		proc.stdout.on('data', (data) => {
			log(settings.id, data);
			// console.log(`${settings.id}: ${(''+data).trim()}`);
		});
		proc.stderr.on('data', (data) => {
			log(settings.id, data);
			// console.log(`${settings.id}: ${(''+data).trim()}`);
		});
		proc.on('close', () => {
			// console.log(`child process ${settings.id} exited with code ${code}`);
			res(true);
		});
		proc.on('error', (data) => {
			log(settings.id, 'error: '+data);
			// console.log(`${settings.id}: error: ${(''+data).trim()}`);
			res(false);
			// console.log(`child process ${settings.id} exited with code ${err}`);
		});
	});

}

function cleanUpServer() {
	console.log('Finishing sub processes...');
	for (let proc of spawned) {
		proc.kill('SIGHUP');
	}
	console.log('Done.');
}

[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
	process.on(eventType, cleanUpServer.bind(null, eventType));
});

async function run(what) {
	if (!commands[what]) {
		console.error('Invalid task name: '+what);
		console.error('Available commands are: '+Object.keys(commands).join(', '));
		return false;
	}

	const settings = commands[what];
	const promises = [];
	for (let commandSetting of settings) {
		promises.push( doSpawn(commandSetting) );
	}

	return await Promise.all(promises);
}

const args = process.argv.slice(2);
run(args[0]).then(()=>{
	console.log('');
});