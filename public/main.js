//disable form submit
$('form').submit(false);

let device;
let port = navigator.serial;
let portOptions = {
    baudRate: 115200,
    dataBits: 8,
    parity: "none",
    stopBits: 1
}

let baudRate = 9600;

port.onconnect = event => {
    console.log(event)
};
port.ondisconnect = event => {
    console.log(event)
};

async function deviceConnect(baudRate) {
    portOptions.baudRate = baudRate;

    await port.requestPort();

    await port.getPorts().then(devices => {
        console.log(devices);

        device = devices[0];
        device.open(portOptions).then(result => {
            console.log("Connected");
            readPort();
            $('#btn_connect').prop('disabled', true);
            $('#masthead').addClass('d-none');
            $('#card_control').removeClass('d-none');
        });
    })
}

async function readPort() {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = device.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    try {
        while (true) {
            const {
                value,
                done
            } = await reader.read();
            if (done) {
                // |reader| has been canceled.
                break;
            }
            // Do something with |value|...
            //console.log(value);
            $('#txt_payload').val($('#txt_payload').val() + value);
            $('#txt_payload').scrollTop($('#txt_payload')[0].scrollHeight);
        }
    } catch (error) {
        // Handle |error|...
    } finally {
        reader.releaseLock();
    }
}

function sendData() {
    let payload = $('#txt_sendPayload').val()
    writePort(payload);
}

async function writePort(payload) {
    payload += "\r\n";
    console.log(payload);


    $('#txt_payload').val($('#txt_payload').val() + ">> " + payload);
    $('#txt_payload').scrollTop($('#txt_payload')[0].scrollHeight);

    const encoder = new TextEncoder();
    const writer = device.writable.getWriter();
    await writer.write(encoder.encode(payload));
    writer.releaseLock();
}

async function closePort() {
    await device.readable.releaseLock();
    await device.close();
}

function getMsg() {
    alert(document.getElementById('txt_payload').value)
}

function clearConsole() {
    $('#txt_payload').val("");
}

document.querySelector('#txt_sendPayload').addEventListener('keyup', function (e) {
    $('#txt_sendPayload').val($('#txt_sendPayload').val().toUpperCase())

    if (e.key === 'Enter') {
        let payload = $('#txt_sendPayload').val()
        writePort(payload);
    }
});

document.querySelector('#txt_interval_payload').addEventListener('keyup', function (e) {
    $('#txt_interval_payload').val($('#txt_interval_payload').val().toUpperCase());
});


var count = 0;
var timer = 0
var interval;

function setPayloadInterval() {
    let payload = $('#txt_interval_payload').val().toUpperCase();
    let time = Math.trunc($('#txt_interval_time').val())

    let error = false

    if (payload.length == 0) error = true;
    if (time < 1) error = true;
    if (time > 3600) error = true;

    if (!error) {

        $('#txt_interval_payload').prop("disabled", true);
        $('#txt_interval_time').prop("disabled", true);

        $('#btn_setInterval').addClass("d-none");
        $('#btn_clearInterval').removeClass("d-none");

        $('#txt_payload').val($('#txt_payload').val() + "\n****************************************");
        $('#txt_payload').val($('#txt_payload').val() + "\nSTARTED SEND-INTERVAL\n\n- Time: " + time + " seconds" + "\n- Command: " + payload)
        $('#txt_payload').val($('#txt_payload').val() + "\n****************************************");
        $('#txt_payload').val($('#txt_payload').val() + "\n\n");

        writePort(payload);
        console.log("Interval: " + count++);

        timer = time;

        interval = setInterval(function () {
            count++;
            timer--;

            $('#txt_interval_time').val(timer + 1)

            if (timer == -1) {
                console.log("Interval: " + count);
                $('#txt_interval_time').val("SEND")

                timer = time;
                writePort(payload);
            }



        }, 1000);
    }


}


function clearPayloadInterval() {
    clearInterval(interval)

    $('#btn_clearInterval').addClass("d-none");
    $('#btn_setInterval').removeClass("d-none");

    $('#txt_interval_payload').prop("disabled", false);
    $('#txt_interval_time').prop("disabled", false);
}


function overrideView() {
    $('#btn_connect').prop('disabled', true);
    $('#masthead').addClass('d-none');
    $('#card_control').removeClass('d-none');
}

//setPayloadInterval(10, "00")