import assert from  'assert';
import byteStringToByte from './byteStringToByte';

let num = 0;

while (num <256) {
  let byteString = Number(num).toString(16);
  if(byteString.length === 1) {
    byteString = '0'+byteString;
  }
  assert(byteStringToByte(byteString) === parseInt(byteString, 16));
  num += 1;
}

