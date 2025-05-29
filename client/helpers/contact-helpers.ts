export const formatPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, "");
};
