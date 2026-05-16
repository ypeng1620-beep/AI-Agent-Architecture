# FusionWorkspace

FusionWorkspace is a TypeScript AI Agent runtime focused on long-running internal stability before external channel expansion. It combines TAOR loop execution, memory, skills, permissions, Phoenix audit/recovery, gateway health, and external adapter readiness gates.

## Current Runtime Goal

The project is built to run as a durable agent service foundation similar in operating posture to OpenClaw or Hermes:

- internal memory, skill, permission, runtime lifecycle, Phoenix audit, FlameBreaker, and antibody modules are initialized first;
- external channels must pass readiness validation before provider traffic is connected;
- startup, shutdown, retry, and health states are observable through runtime status and health reports;
- real external channels such as WeChat and Feishu should be connected only after the internal control plane is stable.

## Requirements

- Node.js `>=22.14.0`
- npm dependencies installed with `npm install`

SQLite native bindings are optional for local development. On this Windows machine, the supported default smoke-test path uses the JSON memory backend explicitly.

## Run

```powershell
npm install
npm run build
npm test
npm run check
```

`npm run check` starts FusionWorkspace in agent mode with `--memory-backend json`, prints the health report, and shuts down cleanly. A healthy local smoke test should end with top-level `"status": "ok"`.

## Long-Running Modes

Run the production-template server:

```powershell
npm run serve
```

`npm run serve` loads:

```text
config/runtime.production.template.json
```

Run a server manually with HTTP probes and WebSocket gateway:

```powershell
npm start -- --mode server --memory-backend json
```

Runtime probe endpoints:

```text
http://localhost:8080/api/live
http://localhost:8080/api/ready
http://localhost:8080/api/health
```

`/api/live` is a lightweight liveness probe for the HTTP/WebSocket process.
`/api/ready` and `/api/health` expose readiness from `FusionWorkspace.getHealthReport()`.

Run stdio mode for command-line integration:

```powershell
npm start -- --mode stdio --memory-backend json
```

Use strict SQLite when the native binding is installed and required:

```powershell
npm start -- --mode server --memory-backend sqlite
```

If SQLite is required but unavailable, startup fails fast instead of silently running with the wrong persistence backend.

## External Adapter Boundary

Production external adapter config should start from:

```text
config/external-adapters.production.template.json
```

Adapters can be checked and registered through:

```powershell
npm start -- --mode server --memory-backend json --external-adapter-config config/external-adapters.production.template.json
```

Enable auto-registration only after the config validates as production-ready:

```powershell
npm start -- --mode server --memory-backend json --external-adapter-config config/external-adapters.production.template.json --external-adapter-auto-register
```

External channels are not allowed to bypass internal permissions, memory policy, runtime audit, or Phoenix boundary checks.

## Validation

Before treating a change as complete:

```powershell
npm run build
npm test
npm run check
```

Optional focused checks:

```powershell
npx tsx tests\testRuntimeStatus.ts
npx tsx tests\testPhoenixRuntimeDocs.ts
npx tsx tests\testPackageRuntimeEntry.ts
```

Known local test noise includes `better-sqlite3` native binding fallback warnings and intentional gateway/adapter failure logs from fault-injection tests. Passing exit codes are the source of truth.
