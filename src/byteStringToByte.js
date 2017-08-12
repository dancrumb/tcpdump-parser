const nibbles = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'];

const lsbMap = x => x;
const msbMap = x => x<<4;

const builder = (nibbles, mapper) => nibbles.reduce((map, nibble, index) => {
  map[nibble] = mapper(index);
  if(nibble.toUpperCase) {
    map[nibble.toUpperCase()] = map[nibble];
  }
  return map;
}, {});

const LSB = builder(nibbles,lsbMap);
const MSB = builder(nibbles,msbMap);

export default function byteStringToByte(byteString) {
  return MSB[byteString[0]] + LSB[byteString[1]];
}
