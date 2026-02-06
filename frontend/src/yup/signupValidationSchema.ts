import * as yup from "yup";

export const signupValidationSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  roleId: yup
    .string()
    .required("Please select a role"),
});

export type SignupFormValues = yup.InferType<typeof signupValidationSchema>;
