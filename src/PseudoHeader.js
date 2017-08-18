import packetSerializer from "./packetSerializer";

export default class PseudoHeader {
  constructor(srcIp, dstIp, protocol) {
    this.version = srcIp.length === 4 ? 4 : 6;
    this.src = srcIp;
    this.dst = dstIp;
    this.protocol = protocol;
    this.length = 0;
  }

  setLength(length) {
    this.length = length;
  }

  asBuffer() {
    const buf = Buffer.alloc(this.version === 4 ? 12 : 40);
    this.src.copy(buf);
    this.dst.copy(buf, this.src.length);
    if(this.version === 4) {
      buf.writeUIntBE(0,8);
      buf.writeUIntBE(6,9);
      buf.writeUInt16BE(this.length, 10)
    }
    if(this.version === 6) {
      buf.writeUInt32BE(this.length, 32);
      buf.writeUInt32BE(0,36);
      buf.writeUIntBE(0,38);
      buf.writeUIntBE(6,39);
    }
  }

  toJSON() {
    return packetSerializer(this);
  }
}
