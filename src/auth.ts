// TODO: implement a real authentication system
function foo() {
  let isAuthenticated = false;

  return {
    isAuthenticated: () => true,
    checkCreds: (username: string, password: string) => {
      const creds = {
        username: 'acrenwelge',
        password: 'myrandompassword'
      };
      if (username === creds.username && password === creds.password) {
        isAuthenticated = true;
        return auth.isAuthenticated;
      } else {
        isAuthenticated = false;
        return auth.isAuthenticated;
      }
    }
  }
}

let auth = foo();

export default auth;
