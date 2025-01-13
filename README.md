# AnyTrace

A microservice tracing tool that allows you to trace configurable events through a microservice system by invoking shell scripts.

## Features

- Web-based UI for configuring and viewing traces
- Backend capability to execute shell scripts
- Real-time trace visualization
- Configurable event tracking
- YAML-based configuration system

## Setup

```bash
npm install
```

## Configuration

AnyTrace uses YAML configuration files to define samplers and flows. By default, it looks for `config.yaml` in the current directory.

### Default Configuration Location
Create `config.yaml` in your project directory:

```yaml
samplers:
  - id: example_sampler
    name: "Example Sampler"
    variables:
      - name: search_term
        type: string
        required: true
    command: "grep ${search_term} /var/log/example.log"
    timeout: 30

flows:
  - id: example_flow
    name: "Example Flow"
    samplers:
      - example_sampler
```

### Custom Configuration
You can specify a custom config location using:

```bash
CONFIG_PATH=/path/to/custom/config.yaml npm start
```

## Development

Start the development server:

```bash
npm run dev
```

## Building

Build the project:

```bash
npm run build
```

## Deployment

1. Build the project:
```bash
npm run build
```

2. Start with default config:
```bash
npm start
```

Or with custom config:
```bash
CONFIG_PATH=/etc/anytrace/config.yaml npm start
```

## Security Note

This tool executes shell commands on the host system. Please ensure:
- Only trusted configurations are used
- Input validation is enabled
- Proper access controls are in place
- Command execution is restricted as needed
