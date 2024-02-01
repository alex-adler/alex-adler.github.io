# alex-adler.github.io

## Pages

### Space Time

Coming up with a system for time keeping across the solar system

-   [ ] Create an API that can provide string representation of time given unix timestamp and vice versa
-   [ ] Extend API to be able to convert between locales

### Arean Freight

Investing possibilities for cargo vehicles on Mars. Ideally looking for an analog to cargo ships.

-   [ ] Create a 3D design
-   [ ] Create a viewport to display 3D model

### Transit

Flightradar24 for a civilization that has spread throughout the solar system.

-   [ ] Impulse transfers (Lambert's problem)
-   [ ] Constant acceleration transfers
-   [ ] Scale indication
-   [ ] Mobile canvas support
-   [ ] Arbitrary precision floats
-   [ ] Different looks for each body
-   [ ] Different page style for each location
-   [ ] Moons

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
