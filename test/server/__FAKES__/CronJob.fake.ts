import { ICronJob } from '../../../src/server/cron-jobs/ICronJob'

class CronJob_FAKE implements ICronJob {
  START = jest.fn()
  REFRESH = jest.fn()

  start = this.START
  refresh = this.REFRESH
}

export default CronJob_FAKE
