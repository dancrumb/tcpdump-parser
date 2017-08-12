import { Writable } from 'stream';
import { inspect } from 'util';

export default class ScreenWriter extends Writable {
  constructor(options = {}) {
    super(options);
  }

  _write(chunk, encoding, callback) {
    console.log(inspect(chunk, { colors: true, depth: null }));
    callback();
  }
};
