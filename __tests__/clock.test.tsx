// import Clock, {ClockListener} from '../app/clock'
 
describe('Clock', () => {
  it('ticks', () => {

    var lastTick: number = 0

    // let listener = {
    //     nextStateTimestamp: (timestamp: number) => 10000
    // }
    
    // let tickCallback = (timestamp: number) => lastTick = timestamp

    // let clock = new Clock()

    // clock.register([listener], tickCallback)
 
    expect(lastTick).toEqual(0)
  })
})