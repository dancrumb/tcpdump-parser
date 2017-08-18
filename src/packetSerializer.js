const packetSerializer = (packet={}, encoding='base64') =>
  Object.keys(packet).reduce((jsonObject, key) => {
    const val = packet[key];
    if(Buffer.isBuffer(val)) {
      jsonObject[key] = val.toString(encoding);
    } else {
      jsonObject[key] = val;
    }
    return jsonObject;
  }, {});

export default packetSerializer;
