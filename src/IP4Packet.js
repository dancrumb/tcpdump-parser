import ip from 'ip';

const getWord = (buffer, offset) => buffer.readUInt16BE(offset);
const getDWord = (buffer, offset) => buffer.readUInt32BE(offset);

const PROTOCOLS = {
  1: 'icmp',
  6: 'tcp',
  17: 'udp'
};

export default class IP4Packet {
  constructor(buffer) {
    this.ipVersion = (buffer[0] & 0xF0) >> 4;
    if(this.ipVersion !== 4) {
      throw new Error('Buffer is not an IPv4 packet');
    }
    this.ihl = buffer[0] & 0x0F;
    const ipHeader = buffer.slice(0, this.ihl*4);
    this.ipHeader = ipHeader;
    this.dscp = (ipHeader[1] & 0b11111100) >> 2;
    this.ecn = ipHeader[1] & 0x03;
    this.totalLength = getWord(buffer, 2);
    this.identification = getWord(buffer, 2);
    this.flags = (ipHeader[6] & 0b11100000) >> 5;
    this.fragmentOffset = (ipHeader[6] & 0b11111) << 8 + ipHeader[7];
    this.ttl = ipHeader[8];
    this.protocol = ipHeader[9];
    this.protocolName = PROTOCOLS[this.protocol] || 'unknown';
    this.headerChecksum = getWord(ipHeader,10);
    this.src = new Buffer(4);
    this.src.writeUInt32BE(getDWord(ipHeader,12));
    this.dst = new Buffer(4);
    this.dst.writeUInt32BE(getDWord(ipHeader,16));

    this.contentPacket = buffer.slice(this.ihl * 4);
  }

  getSrcAddress() {
    return ip.toString(Buffer.from(this.src));
  }

  getDstAddress() {
    return ip.toString(Buffer.from(this.dst));
  }

  checksumIsValid() {
    const ihl =this.ihl;
    let offset;
    let total = 0;
    for(offset = 0; offset < ihl*2; offset += 1) {
      total +=  getWord(this.ipHeader, offset * 2);
    }
    total = (total & 0xFFFF) + ((total & 0xFF0000) >> 16);
    return total === 0xffff;
  }
}
