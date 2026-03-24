export const extractUpiFromQR = (qrData) => {
  if (qrData && qrData.startsWith('upi://pay')) {
    const paramsString = qrData.split('?')[1];
    if (!paramsString) return null;
    
    const params = paramsString.split('&');
    const result = { upiId: null, name: null, amount: null };
    
    params.forEach(param => {
      const [key, value] = param.split('=');
      if (key === 'pa') result.upiId = decodeURIComponent(value);
      if (key === 'pn') result.name = decodeURIComponent(value);
      if (key === 'am') result.amount = decodeURIComponent(value);
    });
    
    return result;
  }
  return null;
};
