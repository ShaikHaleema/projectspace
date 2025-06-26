import Amplify from 'aws-amplify';
import awsConfig from './aws-exports';

Amplify.configure(awsConfig);

import { withAuthenticator } from '@aws-amplify/ui-react';

function App() {
  return (
    <div>
      <h2>Welcome to my E-Commerce Site</h2>
    </div>
  );
}

export default withAuthenticator(App);
