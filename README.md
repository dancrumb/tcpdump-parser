# TCPDumpParser

A `Transform` stream that converts the ouput from

```bash
tcpdump -i en0 -X     
```

to a stream of JS objects.

You have to specific the network interface or the decoding of
tcpdump will fail.

## Example

In the example below, `ScreenWriter` is just a `WriteableStream`
that prints chunks to the screen.

```javascript 1.8
const TCPDumpParser = require('TCPDumpParser');
const ScreenWriter = require('ScreenWriter');

const parser = new TCPDumpParser();
const screen = new ScreenWriter({objectMode: true});

// input.pipe(parser).pipe(screen);
process.stdin.pipe(parser).pipe(screen);

```

This example would be used via:

```bash
tcpdump -i en0 -X | node example.js
```

## Building

There's a `build`run-script and a `build:examples` run-script that
npm or yarn users can use.

After that:

```bash
node dist/examples/index.js < examples/dump2.txt
```

Will show you and example of what you get.
