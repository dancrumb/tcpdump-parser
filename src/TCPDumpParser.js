import { Transform } from 'stream';
import byteStringToByte from "./byteStringToByte";
import assert from 'assert';
import IPPacket from './IPPacket';
import TCPPacket from './TCPPacket';
import UDPPacket from './UDPPacket';

const HEX_MATCH = /.*0x[0-9a-f]{4}:\s+((?:[0-9a-f]{2,4}\s){1,8})/

const ProtocolPacketConstructors = {
  tcp: TCPPacket,
  udp: UDPPacket
};

export default class TCPDumpParser extends Transform {
  constructor(options={}) {
    options.readableObjectMode = true;
    super(options);

    this.packet = '';
    this.previousLine = null;
  }

  _transform(chunk, encoding, callback) {
    let chunkString = chunk;
    if(encoding === 'buffer') {
      chunkString = chunk.toString('utf8');
    }
    if(!this.previousLine){
      this.previousLine = chunkString;
    } else {
      this.previousLine += chunkString;
    }

    const lines = this.previousLine.split("\n");
    this.previousLine = lines.pop();

    lines.forEach(line => {
      let packetData;
      if(packetData = line.match(HEX_MATCH)) {
        let packetBytes = packetData[1].split(' ').join('');
        this.packet += packetBytes;
      } else if(this.packet) {
        const packetBuffer = Buffer.from(this.packet.match(/.{1,2}/g).map(byteStringToByte));
        this.packet =  '';

        const ipPacket = IPPacket.fromBuffer(packetBuffer);
        assert(ipPacket.checksumIsValid());

        const ProtocolPacketConstructor = ProtocolPacketConstructors[ipPacket.protocolName];
        let protocolPacket;
        if (ProtocolPacketConstructor) {
          try {
            protocolPacket = new ProtocolPacketConstructor(ipPacket.contentPacket);
            protocolPacket.createPseudoHeader(ipPacket.src.readUInt32BE(), ipPacket.dst.readUInt32BE());
          } catch (e) {
            console.log(ipPacket);
            throw e;
          }
        }

        this.push({ ipPacket, protocolPacket });
      }
    });

    return callback();

  }

  _flush(callback) {
    const line = this.previousLine;

    let packetData;
    if(packetData = line.match(HEX_MATCH)) {
      let packetBytes = packetData[1].split(' ').join('');
      this.packet += packetBytes;
    }

    if(this.packet) {
      const packetBuffer = Buffer.from(this.packet.match(/.{1,2}/g).map(byteStringToByte));
      this.packet =  '';

      const ipPacket = IPPacket.fromBuffer(packetBuffer);
      assert(ipPacket.checksumIsValid());

      const ProtocolPacketConstructor = ProtocolPacketConstructors[ipPacket.protocolName];
      let protocolPacket;
      if (ProtocolPacketConstructor) {
        try {
          protocolPacket = new ProtocolPacketConstructor(ipPacket.contentPacket);
          protocolPacket.createPseudoHeader(ipPacket.src, ipPacket.dst);
        } catch (e) {
          console.log(ipPacket);
          throw e;
        }
      }

      this.push({ ipPacket, protocolPacket });
    }

    callback();
  }

}
