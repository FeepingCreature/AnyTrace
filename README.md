# AnyTrace

A microservice tracing tool that allows you to trace configurable events through a microservice system by invoking shell scripts.

## Features

- Web-based UI for configuring and viewing traces
- Backend capability to execute shell scripts
- Real-time trace visualization
- Configurable event tracking

## Setup

```bash
npm install
```

## Configuration

Create a `config.yaml` file in your project directory:

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

You can specify a custom config location using the CONFIG_PATH environment variable:

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

## Security Note

This tool executes shell commands on the host system. Please ensure proper security measures are in place and only run trusted configurations.
