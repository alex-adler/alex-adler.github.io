# alex-adler.github.io

## Development

Compiler for scss:

```bash
sass --watch css/
```

Compiler for typescript (after ensuring tsconfig.json is correct):

```bash
tsc -w
```

Transit is currently using ESLint to bundle files:

```bash
./node_modules/.bin/esbuild transit/transit.ts --bundle --outdir=transit --watch
```
