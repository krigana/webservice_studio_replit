import { Client, Environment, OAuthAuthorizationController } from '@paypal/paypal-server-sdk';

async function testPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  console.log('=== PayPal Credentials Test ===');
  console.log('Client ID exists:', !!clientId);
  console.log('Client Secret exists:', !!clientSecret);
  console.log('Client ID length:', clientId ? clientId.length : 0);
  console.log('Client Secret length:', clientSecret ? clientSecret.length : 0);
  console.log('Client ID starts with:', clientId ? clientId.substring(0, 10) + '...' : 'not set');
  console.log('Environment:', process.env.NODE_ENV || 'development');

  if (!clientId || !clientSecret) {
    console.error('❌ Missing PayPal credentials');
    return;
  }

  try {
    const client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,
        oAuthClientSecret: clientSecret,
      },
      environment: Environment.Production,
      timeout: 10000,
    });

    const oAuthController = new OAuthAuthorizationController(client);
    
    console.log('\n=== Testing PayPal Authentication ===');
    
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    console.log('Auth header created successfully');

    const { result } = await oAuthController.requestToken(
      {
        authorization: `Basic ${auth}`,
      },
      { intent: 'sdk_init', response_type: 'client_token' }
    );

    console.log('✅ PayPal authentication successful!');
    console.log('Access token received:', result.accessToken ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('❌ PayPal authentication failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    
    if (error.body) {
      console.error('Response body:', error.body);
    }
  }
}

testPayPalCredentials();