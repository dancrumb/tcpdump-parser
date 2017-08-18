import PseudoHeader from './PseudoHeader';
import packetSerializer from "./packetSerializer";

const getWord = (buffer, offset) => buffer.readUInt16BE(offset);

export default class UDPPacket {
  constructor(buffer) {
    this.srcPort = getWord(buffer, 0);
    this.dstPort = getWord(buffer, 2);
    this.length = getWord(buffer, 4);
    this.checkSum = getWord(buffer, 8);

    this.header = buffer.slice(0,8);

    this.contentPacket = buffer.slice(8);
    this.contentLength = this.contentPacket.length;
  }

  createPseudoHeader(srcIP, dstIP) {
    this.pseudoHeader = new PseudoHeader(srcIP, dstIP, 17);
    this.pseudoHeader.setLength(this.length);
  }

  toJSON() {
    return packetSerializer(this);
  }
}
