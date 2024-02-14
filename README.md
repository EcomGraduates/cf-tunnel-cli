
# CF-Tunnel-CLI

CF-Tunnel-CLI is a simple command-line tool designed to facilitate the creation of secure tunnels using Cloudflare for Node.js projects. This tool automates the process of setting up Cloudflare tunnels, making it easier for developers to expose their local servers to the internet securely.

## Features

- Easy setup of Cloudflare tunnels with minimal configuration.
- Automatic generation of `tunnel.yml` configuration files.
- Support for custom base URLs for tunnel access.
- Pre-flight check to ensure Cloudflare's `cloudflared` is installed.

## Installation

Ensure you have Node.js installed on your machine. Then, you can install CF-Tunnel-CLI globally via npm:

```bash
npm install -g cf-tunnel-cli
```

This will install CF-Tunnel-CLI and make it available from anywhere on your system.

## Prerequisites

Before using CF-Tunnel-CLI, you must have Cloudflare's `cloudflared` installed on your machine. If `cloudflared` is not installed, the tool will provide instructions on how to install it. For detailed installation instructions, please visit [Cloudflare's Official Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation).

## Usage

CF-Tunnel-CLI can be used in two ways:

1. **Direct Command Line Arguments:**

   If you know the tunnel name and port ahead of time, you can specify them as command-line arguments:

   ```bash
   cf-tunnel-cli <tunnel-name> <port>
   ```

2. **Interactive Prompts:**

   If you run `cf-tunnel-cli` without arguments, it will prompt you for the tunnel name and port:

   ```bash
   cf-tunnel-cli
   ```

   Follow the interactive prompts to complete the tunnel setup.

## Configuration

On the first run, CF-Tunnel-CLI will ask for the base URL for your tunnels (e.g., `graduatesapi.com`). This setting will be saved in a configuration file located in your home directory (`.egTunnelsConfig.json`) for future use.

## Demo usage
https://github.com/EcomGraduates/cf-tunnel-cli/assets/74157486/e31adb77-429c-4952-b0ae-badfb8c84def


## Contributing

Contributions are welcome! Please feel free to submit a pull request or create an issue for bugs, questions, or new features.

## License

CF-Tunnel-CLI is open-source software licensed under the MIT License. See the LICENSE file for more details.

## Support

If you encounter any issues or have any questions, please file an issue on the [GitHub repository](https://github.com/EcomGraduates/cf-tunnel-cli/issues).
