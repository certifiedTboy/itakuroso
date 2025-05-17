import * as Yup from "yup";

export const formValidation = () => {
  const phoneRegExp = /^(\+?\d{1,3}[- ]?)?\d{10}$/;

  const Schema = Yup.object().shape({
    phoneNumber: Yup.string()
      .required("Phone number is required")
      .matches(phoneRegExp, "Phone number is not valid"),
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  return Schema;
};
