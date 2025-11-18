export const environment = {
  production: false,
  //Local Server

  // API: 'http://localhost:8081/api/v1',

  //UAT Server

  API: 'http://207.180.213.111:8081/api/v1',

  //Live Server

  // API:'/api/v1',

  tokenWhitelist: ['/security/auth/login', '/security/auth/register'],
};
