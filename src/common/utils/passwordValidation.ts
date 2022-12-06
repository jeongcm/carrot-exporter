import bcrypt from 'bcrypt';
/**
 * @param  {} req
 * @returns payload
 */
export const validatePassword = async (password, userData) => {
  console.log('password, userData', password, userData);
  //   const oldHashedPassword = await bcrypt.compare(password, findUser.password);
  //1. password should  not include firstname and last name
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
    return 'Password should atleast contatin  minimum eight characters, one uppercase letter, one lowercase letter, one number and one special character';
  }
  if (userData.firstName) {
    if (password.toLowerCase().includes(userData.firstName.toLowerCase())) {
      return "Password shouldn't contain the firstname";
    }
  }
  if (userData.lastName) {
    if (password.toLowerCase().includes(userData.lastName.toLowerCase())) {
      return "Password shouldn't contain the lastname";
    }
  }

  if (userData.oldPassword && userData.oldPassword.length) {
    for (let i = 0; i < userData.oldPassword.length; i++) {
      const oldHashedPassword = await bcrypt.compare(password, userData.oldPassword[i]);
      if (oldHashedPassword) {
        return 'This password has been used please add new password';
      }
    }
  }
  return true;
};
