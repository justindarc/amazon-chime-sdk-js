const { KiteTestError, Status } = require('kite-common');
const AppTestStep = require('../utils/AppTestStep');

class UserAuthenticationCheck extends AppTestStep {
  constructor(kiteBaseTest) {
    super(kiteBaseTest);
  }

  static async executeStep(KiteBaseTest) {
    const step = new UserAuthenticationCheck(KiteBaseTest);
    await step.execute(KiteBaseTest);
  }

  stepDescription() {
    return 'Check if the user has authenticated';
  }

  metricName() {
    return 'UserAuthenticationCheck'
  }

  async run() {
    let authenticated = await this.page.checkIfMeetingAuthenticated();
    if (authenticated === false) {
      throw new KiteTestError(Status.FAILED, 'Authentication failed');
    }
  }
}

module.exports = UserAuthenticationCheck;
