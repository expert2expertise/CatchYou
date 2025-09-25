#!/usr/bin/env node
/**
 * Windows service manager for the standalone AI Monitoring Agent.
 *
 * Provides install/uninstall/start/stop/restart/status commands that integrate
 * with the `node-windows` Service wrapper. The script intentionally keeps the
 * operations simple so it can be invoked from npm scripts or batch files.
 */

const path = require('path');
const { exec } = require('child_process');

const command = (process.argv[2] || '').toLowerCase();
const isWindows = process.platform === 'win32';
const serviceName = 'AI Monitoring Agent';
const serviceDescription = 'AI Monitoring Agent Windows Service';
const scriptPath = path.join(__dirname, 'standalone-agent.js');

let Service;
if (isWindows) {
  ({ Service } = require('node-windows'));
}

function ensureWindows() {
  if (!isWindows) {
    console.error('Service management commands are only available on Windows.');
    process.exit(1);
  }
}

function createService() {
  ensureWindows();

  return new Service({
    name: serviceName,
    description: serviceDescription,
    script: scriptPath,
    wait: 2,
    grow: 0.5,
    maxRestarts: 5,
    workingDirectory: __dirname
  });
}

function runShellCommand(shellCommand, successMessage) {
  ensureWindows();

  exec(shellCommand, { windowsHide: true, shell: 'cmd.exe' }, (error, stdout, stderr) => {
    if (stdout) {
      process.stdout.write(stdout);
    }

    if (stderr) {
      process.stderr.write(stderr);
    }

    if (error) {
      console.error(`Command failed with exit code ${error.code ?? 1}.`);
      process.exit(typeof error.code === 'number' ? error.code : 1);
    }

    if (successMessage) {
      console.log(successMessage);
    }

    process.exit(0);
  });
}

function installService() {
  const svc = createService();

  if (typeof svc.exists === 'boolean' && svc.exists) {
    console.log(`Service "${serviceName}" is already installed.`);
    process.exit(0);
  }

  svc.on('install', () => {
    console.log(`Service "${serviceName}" installed successfully.`);
    console.log('Starting service...');
    svc.start();
  });

  svc.on('alreadyinstalled', () => {
    console.log(`Service "${serviceName}" is already installed.`);
    process.exit(0);
  });

  svc.on('start', () => {
    console.log(`Service "${serviceName}" started.`);
    process.exit(0);
  });

  svc.on('error', (err) => {
    console.error(`Failed to install service: ${err?.message ?? err}`);
    process.exit(1);
  });

  svc.install();
}

function uninstallService() {
  const svc = createService();

  if (typeof svc.exists === 'boolean' && !svc.exists) {
    console.log(`Service "${serviceName}" is not installed.`);
    process.exit(0);
  }

  svc.on('uninstall', () => {
    console.log(`Service "${serviceName}" uninstalled successfully.`);
    process.exit(0);
  });

  svc.on('error', (err) => {
    console.error(`Failed to uninstall service: ${err?.message ?? err}`);
    process.exit(1);
  });

  svc.uninstall();
}

function startService() {
  runShellCommand(`sc start "${serviceName}"`, `Start command sent to "${serviceName}".`);
}

function stopService() {
  runShellCommand(`sc stop "${serviceName}"`, `Stop command sent to "${serviceName}".`);
}

function restartService() {
  runShellCommand(
    `cmd /c "sc stop \"${serviceName}\" && sc start \"${serviceName}\""`,
    `Restart command sent to "${serviceName}".`
  );
}

function statusService() {
  runShellCommand(`sc query "${serviceName}"`, '');
}

function showHelp() {
  console.log(`
AI Monitoring Agent Service Manager

Usage: node service-manager.js <command>

Commands:
  install   Install the Windows service and start it
  uninstall Remove the Windows service
  start     Send a start signal to the service
  stop      Send a stop signal to the service
  restart   Restart the service
  status    Show the current service status
  help      Show this message
`);
}

switch (command) {
  case 'install':
    installService();
    break;
  case 'uninstall':
    uninstallService();
    break;
  case 'start':
    startService();
    break;
  case 'stop':
    stopService();
    break;
  case 'restart':
    restartService();
    break;
  case 'status':
    statusService();
    break;
  case 'help':
  case '':
    showHelp();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}
