#!/usr/bin/env node

// Import necessary modules from Node.js API
const { exec, spawn } = require("child_process");
const readline = require("readline");
const fs = require('fs');
const path = require('path');
const os = require('os');

// Define the path for the configuration file in the user's home directory
const configFilePath = path.join(os.homedir(), '.egTunnelsConfig.json');
let config = {};

// Create a readline interface for interactive command line input/output
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to check if cloudflared is installed
function checkCloudflaredInstalled(callback) {
    exec('cloudflared --version', (error, stdout, stderr) => {
        if (error) {
            console.error('Error: cloudflared is not installed. Please install cloudflared to use this tool. (https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation)');
            process.exit(1); // Exit the process if cloudflared is not installed
        } else {
            console.log('cloudflared is installed:', stdout.trim());
            callback(); // Proceed if cloudflared is installed
        }
    });
}

// Function to ensure a configuration file exists, or create one if it doesn't
function ensureConfig(callback) {
    // Check if the configuration file already exists
    if (fs.existsSync(configFilePath)) {
        // Read the existing configuration file
        config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
        callback();
    } else {
        // Prompt the user for base URL if the configuration file doesn't exist
        rl.question("Enter the base URL for your tunnels (e.g., graduatesapi.com): ", function (baseUrl) {
            config = { baseURL: baseUrl };
            // Write the new configuration to the file system
            fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
            console.log(`Configuration saved to ${configFilePath}`);
            callback();
        });
    }
}

// Process command line arguments
const myArgs = process.argv.slice(2);

// Check if cloudflared is installed, then proceed with the main logic
checkCloudflaredInstalled(() => {
    // Call ensureConfig and then create a tunnel based on the provided arguments or user input
    ensureConfig(() => {
        if (myArgs.length === 2) {
            // If there are two command line arguments, use them to create a tunnel
            createTunnel(myArgs[0], myArgs[1]);
        } else {
            // Otherwise, prompt the user for tunnel name and port
            rl.question("Enter tunnel name: ", function (name) {
                rl.question("Enter port: ", function (port) {
                    createTunnel(name, port);
                    rl.close();
                });
            });
        }
    });
});
// Function to create a tunnel using cloudflared
function createTunnel(name, port) {
    // Execute cloudflared command to create a tunnel
    exec(`cloudflared tunnel create ${name}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`Tunnel ${name} created successfully.`);

        // Extract the UUID from the command output
        let uuid = stdout.split(' ').pop().replace(/\s/g, '');
        console.log(`Tunnel UUID: ${uuid}`);

        // Define the path for the tunnel's credentials file
        let credentialsPath = `/Users/${os.userInfo().username}/.cloudflared/${uuid}.json`;

        // Create the content for the tunnel.yml file
        let fileContent = `url: http://localhost:${port}\ntunnel: ${uuid}\ncredentials-file: ${credentialsPath}`;

        // Write the tunnel.yml file to the current working directory
        const tunnelFilePath = path.join(process.cwd(), 'tunnel.yml');

        fs.writeFileSync(tunnelFilePath, fileContent);
        console.log('tunnel.yml created successfully at ' + tunnelFilePath);

        // Execute cloudflared command to add a route DNS for the tunnel
        exec(`cloudflared tunnel route dns ${uuid} ${name}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            if (stdout) {
                console.log(`stdout: ${stdout}`);
            }
        });

        // Modify the package.json to add a tunnel script and then run the tunnel
        modifyPackageJsonAndRunTunnel(name, () => {
            openUrl(name);
        });

        // Start the tunnel
        spawnTunnel(name);
    });
}

// Function to modify package.json to add a script for running the tunnel
function modifyPackageJsonAndRunTunnel(name, callback) {
    console.log('Current directory:', process.cwd());
    const packagePath = path.join(process.cwd(), 'package.json');

    fs.readFile(packagePath, 'utf8', function (err, data) {
        if (err) {
            console.error('Error reading package.json:', err);
            return;
        }
        let packageJson = JSON.parse(data);
        // Ensure scripts object exists and add the tunnel script
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts.tunnel = `cloudflared tunnel --config tunnel.yml run`;

        // Write the modified package.json back to disk
        fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2), function (err) {
            if (err) {
                console.error('Error writing package.json:', err);
                return;
            }
            console.log('Added tunnel script to package.json');
            callback();
        });
    });
}

// Function to spawn the tunnel process
function spawnTunnel(name) {
    console.log('Starting tunnel...');
    // Use npm to run the tunnel script defined in package.json
    const tunnelProcess = spawn('npm', ['run', 'tunnel'], { stdio: 'inherit' });

    tunnelProcess.on('error', (error) => {
        console.error(`Error starting tunnel: ${error.message}`);
    });

    tunnelProcess.on('close', (code) => {
        console.log(`Tunnel process exited with code ${code}`);
    });
}

// Function to open the tunnel URL in the default web browser
function openUrl(name) {
    const url = `https://${name}.${config.baseURL}`;
    console.log(`Opening ${url}`);
    // Use platform-specific command to open the URL
    switch (process.platform) {
        case 'win32':
            exec(`start ${url}`);
            break;
        case 'darwin':
            exec(`open ${url}`);
            break;
        case 'linux':
            exec(`xdg-open ${url}`);
            break;
        default:
            console.error('Platform not supported for opening URLs');
    }
}