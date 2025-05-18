import * as Yup from "yup";

export const validateRegform = () => {
  const phoneRegExp = /^(\+?\d{1,3}[- ]?)?\d{10}$/;

  const Schema = Yup.object().shape({
    phoneNumber: Yup.string()
      .required("Phone number is required")
      .matches(phoneRegExp, "Phone number is not valid"),
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  return Schema;
};

export const validateVerificationform = () => {
  const Schema = Yup.object().shape({
    verificationCode: Yup.string()
      .required("Verification code is required")
      .matches(/^\d{6}$/, "Verification code must be 6 digits"),
  });

  return Schema;
};
