import Clock from '../app/clock'

let testListener = (fixedTimestamp: number) => ({
  nextStateTimestamp: (timestamp: number) => fixedTimestamp
})

describe('Clock', () => {

  it('ticks on timestamp', done => {
    let listener = testListener(10000)
    
    let tickCallback = (timestamp: number) => {
      try {
        expect(timestamp).toBe(10000);
        done();
      } catch (error) {
        done(error);
      }
    }

    let clock = new Clock()

    clock.register([listener], tickCallback, 0)
  });

  it('ticks on earliest timestamp', done => {
    let earlyListener = testListener(10000)
    let lateListener = testListener(20000)
    
    let tickCallback = (timestamp: number) => {
      try {
        expect(timestamp).toBe(10000);
        done();
      } catch (error) {
        done(error);
      }
    }

    let clock = new Clock()

    clock.register([lateListener, earlyListener], tickCallback, 0)
  });
})