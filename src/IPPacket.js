import IP4Packet from './IP4Packet';
import IP6Packet from './IP6Packet';

export default class IPPacket {
  static fromBuffer(buffer) {
    const ipVersion = (buffer[0] & 0xF0) >> 4;
    if (ipVersion === 4) {
      return new IP4Packet(buffer);
    } else if (ipVersion === 6) {
      return new IP6Packet(buffer);
    } else {
      throw new Error(`Unknown IP version: ${ipVersion}`);
    }
  }
}
