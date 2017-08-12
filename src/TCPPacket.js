import PseudoHeader from './PseudoHeader';
const getWord = (buffer, offset) => buffer.readUInt16BE(offset);
const getDWord = (buffer, offset) => buffer.readUInt32BE(offset);

const bitIsSet = (byte, bit) => (byte & (1 << bit)) === (1 << bit);

export default class TCPPacket {
  constructor(buffer) {
    this.srcPort = getWord(buffer, 0);
    this.dstPort = getWord(buffer, 2);
    this.seqNumber = getDWord(buffer, 4);
    this.ackNumber = getDWord(buffer, 8);
    this.dataOffset = (buffer[12] & 0xF0) >> 4;

    this.tcpHeader = buffer.slice(0, this.dataOffset * 4);


    this.ns = bitIsSet(buffer[12], 0);

    this.flags = buffer[13];
    this.cwr = bitIsSet(buffer[13], 7);
    this.ece = bitIsSet(buffer[13], 6);
    this.urg = bitIsSet(buffer[13], 5);
    this.ack = bitIsSet(buffer[13], 4);
    this.psh = bitIsSet(buffer[13], 3);
    this.rst = bitIsSet(buffer[13], 2);
    this.syn = bitIsSet(buffer[13], 1);
    this.fin = bitIsSet(buffer[13], 0);

    if(!this.ack) {
      this.ackNumber = 0;
    }

    this.windowSize = getWord(buffer, 14);
    this.checkSum = getWord(buffer, 16);
    this.urgentPointer = getWord(buffer,18)
    if(!this.urg) {
      this.urgentPointer = 0;
    }
    this.options = null;
    if(this.dataOffset > 5) {
      this.options = buffer.slice(20, this.dataOffset * 4);
      this.decodedOptions = this.decodeOptions();
    }

    this.contentPacket = buffer.slice(this.dataOffset * 4);
    this.length = this.contentPacket.length;
  }

  decodeOptions() {
    const optionsBuffer = this.options;
    const decodedOptions = [];
    let optionsPointer = 0;
    while(optionsPointer < optionsBuffer.length) {
      const type = optionsBuffer[optionsPointer];
      if (type === 0) { // Padding
        optionsPointer += 1;
      } else if (type === 1) {
        decodedOptions.push({ type: 'NOP' });
        optionsPointer += 1;
      } else {
        const optionLength = optionsBuffer[optionsPointer+1];
        const optionBuffer = optionsBuffer.slice(optionsPointer, optionsPointer + optionLength);
        let option = { type, optionBuffer };
        if(type === 2) {
          option = {
            type: 'MSS',
            ss: optionBuffer.readUInt16BE(2)
          }
        } else if(type === 3) {
          option = {
            type: 'Window Scale',
            scale: optionBuffer.readUIntBE(1)
          }
        } else if(type === 4) {
          option = {
            type: 'Selective ACK permitted',
          }
        } else if(type === 8) {
          option = {
            type: 'TS',
            timestamp: optionBuffer.readUInt32BE(2),
            echo: optionBuffer.readUInt32BE(6)
          }
        }
        decodedOptions.push(option);
        optionsPointer += optionLength;
      }
    }
    return decodedOptions;
  }

  createPseudoHeader(srcIP, dstIP) {
    this.pseudoHeader = new PseudoHeader(srcIP, dstIP, 6);
    this.pseudoHeader.setLength(this.tcpHeader.length + this.contentPacket.length);
  }
}
