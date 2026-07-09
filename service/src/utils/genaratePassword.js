import bcrypt from "bcryptjs";

export const generatePassword = async (name, phoneNumber) => {
  const namePart = name
    .replace(/\s+/g, "")
    .substring(0, 4)
    .toUpperCase();

  const numberPart = phoneNumber.toString().slice(-4);

  const Password = `${namePart}@${numberPart}`;

  const hashedPassword = await bcrypt.hash(Password, 10);

  return hashedPassword
};