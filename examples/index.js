import TCPDumpParser from '../TCPDumpParser';
import ScreenWriter from './ScreenWriter';

const parser = new TCPDumpParser();
const screen = new ScreenWriter({objectMode: true});

// input.pipe(parser).pipe(screen);
process.stdin.pipe(parser).pipe(screen);

