import { Linking } from 'react-native';

export const initiateUPIPayment = async (upiId, name, amount, note = '') => {
  // Format: upi://pay?pa=upiid@bank&pn=Name&am=AMOUNT&cu=INR
  const url = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return { success: true, message: 'UPI app opened' };
    } else {
      return { success: false, message: 'No UPI apps found on the device' };
    }
  } catch (error) {
    console.error("UPI Payment Error", error);
    return { success: false, message: 'Failed to initiate UPI payment' };
  }
};
