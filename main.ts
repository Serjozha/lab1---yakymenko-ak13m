// відображення IO
let ioInfo = {
    ls1: DigitalPin.P13, ls2: DigitalPin.P14, ls3: DigitalPin.P15, ls4: DigitalPin.P16,
    lvs1: DigitalPin.P8, lvs2: DigitalPin.P9, lvs3: DigitalPin.P16,
    t1: AnalogPin.P0, t2: AnalogPin.P1,
    rt1: AnalogPin.P2,
    sb1: DigitalPin.P5, sb2: DigitalPin.P11
};
enum states { init, idle, load1, load2, load3, rt1, rt2, unload };
let state = states.idle;
serial.writeLine('Program started');
basic.forever(function () {
    let sb1Strt = (pins.digitalReadPin(ioInfo.sb1) === 1) || input.buttonIsPressed(Button.A);
    let sb2Stop = (pins.digitalReadPin(ioInfo.sb2) === 1) || input.buttonIsPressed(Button.B);
    let ls1Emp = pins.digitalReadPin(ioInfo.ls1);
    let ls2Lo = pins.digitalReadPin(ioInfo.ls2);
    let ls3Mdl = pins.digitalReadPin(ioInfo.ls3);
    let ls4Hi = pins.digitalReadPin(ioInfo.ls4);
    let rt1 = pins.analogReadPin(ioInfo.rt1);
    let t1 = pins.analogReadPin(ioInfo.t1);
    let t2 = pins.analogReadPin(ioInfo.t2);
    switch (state) {
        case states.idle:
            pins.digitalWritePin(ioInfo.lvs1, 0);
            pins.digitalWritePin(ioInfo.lvs2, 0);
            pins.digitalWritePin(ioInfo.lvs3, 0);
            pins.digitalWritePin(ioInfo.ls1, 0);
            pins.digitalWritePin(ioInfo.ls2, 0);
            pins.digitalWritePin(ioInfo.ls3, 0);
            pins.digitalWritePin(ioInfo.ls4, 0);
            pins.analogWritePin(ioInfo.rt1, 0);
            pins.analogWritePin(ioInfo.t1, 0);
            pins.analogWritePin(ioInfo.t2, 0);
            if (sb1Strt) {
                pins.digitalWritePin(ioInfo.sb1, 1)
                if (ls1Emp === 1) {
                    state = states.unload;
                    serial.writeLine('Unloading')
                } else {
                    state = states.load1;
                    serial.writeLine('Loading 1')
                }
            }
            break
        case states.load1:
            pins.digitalWritePin(ioInfo.lvs1, (1023 * 0.50));
            if (ls1Emp === 1) {
                if (ls2Lo === 1) {
                    state = states.load2;
                    serial.writeLine('Loading 2')
                }
            }
            break
        case states.load2:
            pins.digitalWritePin(ioInfo.lvs1, 0);
            pins.digitalWritePin(ioInfo.lvs2, 1);
            if (ls3Mdl === 1) {
                pins.digitalWritePin(ioInfo.lvs2, 0);
                state = states.rt1;
                pins.analogWritePin(ioInfo.rt1, 1023);
                serial.writeLine('Start Rotating 1');
                serial.writeLine('Time 210s');

            }
            break
        case states.rt1:
            if (t1 === 1023) {
                pins.analogWritePin(ioInfo.rt1, 0);
                state = states.load3;
                serial.writeLine('Loading 3')
            }
            break
        case states.load3:
            pins.digitalWritePin(ioInfo.lvs1, 1023);
            if (ls4Hi === 1) {
                pins.digitalWritePin(ioInfo.lvs1, 0);
                state = states.rt2;
                pins.analogWritePin(ioInfo.rt1, 1023);
                serial.writeLine('Start Rotating 2');
                serial.writeLine('Time 900s');

            }
            break
        case states.rt2:
            if (t2 === 1023) {
                pins.analogWritePin(ioInfo.rt1, 0);
                state = states.unload;
                serial.writeLine('Unloading')
            }
            break
        default:
            state = states.idle;
    }
    basic.pause(200);
})