import crypto from "crypto";

const generatedOtp = () => {
    return crypto.randomInt(100000, 999999);
};
export default generatedOtp;
