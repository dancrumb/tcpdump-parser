import ip from 'ip';

const getWord = (buffer, offset) => buffer.readUInt16BE(offset);
const getDWord = (buffer, offset) => buffer.readUInt32BE(offset);

const PROTOCOLS = {
  1: 'icmp',
  6: 'tcp',
  17: 'udp'
};

export default class IP6Packet {
  constructor(buffer) {
    this.ipVersion = (buffer[0] & 0xF0) >> 4;
    if(this.ipVersion !== 6) {
      throw new Error('Buffer is not an IPv6 packet');
    }
    this.trafficClass = ((buffer[0] & 0x0F) << 4) + ((buffer[1] & 0xF0) >>4);
    this.flowLabel = getWord(buffer, 2) + ((buffer[1] & 0x0F) << 12);
    this.payloadLength = getWord(buffer, 4);
    this.nextHeader = buffer[6];
    this.hopLimit = buffer[7];
    this.src = buffer.slice(8, 23);
    this.dst = buffer.slice(24, 39);

    this.ipHeader = buffer.slice(0, 39);
    this.contentPacket = buffer.slice(40);
  }

  getSrcAddress() {
    return ip.toString(Buffer.from(this.src));
  }

  getDstAddress() {
    return ip.toString(Buffer.from(this.dst));
  }

  checksumIsValid() {
    return true;
  }
}
