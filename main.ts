// відображення IO
let ioInfo = {
    le1: DigitalPin.P13, le2: DigitalPin.P14, le3: DigitalPin.P15, le4: DigitalPin.P16,
    lvs1: AnalogPin.P0, lvs2: DigitalPin.P4, lvs3: DigitalPin.P6,
    t1: AnalogPin.P1, t2: AnalogPin.P2,
    rt1: AnalogPin.P10,
    sb1: DigitalPin.P5, sb2: DigitalPin.P11
};
enum states { init, idle, load1, load2, load3, rt1, rt2, unload };
let state = states.idle;
serial.writeLine('Program started');
basic.forever(function () {
    let sb1Strt = (pins.digitalReadPin(ioInfo.sb1) === 1) || input.buttonIsPressed(Button.A);
    let sb2Stop = (pins.digitalReadPin(ioInfo.sb2) === 1) || input.buttonIsPressed(Button.B);
    let le1Emp = pins.digitalReadPin(ioInfo.le1);
    let le2Lo = pins.digitalReadPin(ioInfo.le2);
    let le3Mdl = pins.digitalReadPin(ioInfo.le3);
    let le4Hi = pins.digitalReadPin(ioInfo.le4);
    let rt1 = pins.analogReadPin(ioInfo.rt1);
    let t1 = pins.analogReadPin(ioInfo.t1);
    let t2 = pins.analogReadPin(ioInfo.t2);
    switch (state) {
        case states.idle:
            pins.analogWritePin(ioInfo.lvs1, 0);
            pins.digitalWritePin(ioInfo.lvs2, 0);
            pins.digitalWritePin(ioInfo.lvs3, 0);
            pins.digitalWritePin(ioInfo.le1, 0);
            pins.digitalWritePin(ioInfo.le2, 0);
            pins.digitalWritePin(ioInfo.le3, 0);
            pins.digitalWritePin(ioInfo.le4, 0);
            pins.analogWritePin(ioInfo.rt1, 0);
            pins.analogWritePin(ioInfo.t1, 0);
            pins.analogWritePin(ioInfo.t2, 0);
            if (sb1Strt) {
                if (le1Emp === 1) {
                    state = states.unload;
                    serial.writeLine('Unloading')
                } else {
                    state = states.load1;
                    serial.writeLine('Loading 1')
                }
            }
            break
        case states.load1:
            pins.analogWritePin(ioInfo.lvs1, (1023*0.9));
            if (le1Emp === 1) {
                if (le2Lo === 1) {
                    state = states.load2;
                    serial.writeLine('Loading 2')
                }
            }
            break
        case states.load2:
            pins.analogWritePin(ioInfo.lvs1, 0);
            pins.digitalWritePin(ioInfo.lvs2, 1);
            if (le3Mdl === 1) {
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
            pins.analogWritePin(ioInfo.lvs1, 1023);
            if (le4Hi === 1) {
                pins.analogWritePin(ioInfo.lvs1, 0);
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