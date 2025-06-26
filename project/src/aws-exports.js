import Amplify from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_g8bOH8Wic',
    userPoolWebClientId: '6cmn3gsaf83jikkjgbo2vsnpsi ',
    mandatorySignIn: false,
  }
});
