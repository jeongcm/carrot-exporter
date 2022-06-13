const sizeToBytes = (strSize: string) => {
  if (!strSize) {
    return 0;
  }

  if (strSize.indexOf('Ki') > 0) {
    return parseFloat(strSize.replace('Ki', '')) * 1024;
  } else if (strSize.indexOf('Mi') > 0) {
    return parseFloat(strSize.replace('Mi', '')) * 1024 * 1024;
  } else if (strSize.indexOf('Gi') > 0) {
    return parseFloat(strSize.replace('Gi', '')) * 1024 * 1024 * 1024;
  } else if (strSize.indexOf('Ti') > 0) {
    return parseFloat(strSize.replace('Ti', '')) * 1024 * 1024 * 1024 * 1024;
  } else {
    return parseFloat(strSize);
  }
};

export default sizeToBytes;
