import { Writable } from 'stream';

export default class ScreenWriter extends Writable {
  constructor(options = {}) {
    super(options);
  }

  _write(chunk, encoding, callback) {
    console.log(JSON.stringify(chunk));
    callback();
  }
};
