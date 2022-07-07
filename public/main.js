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
            console.log(value);
            $('#txt_payload').val($('#txt_payload').val() + value);
            $('#txt_payload').scrollTop($('#txt_payload')[0].scrollHeight);
        }
    } catch (error) {
        // Handle |error|...
    } finally {
        reader.releaseLock();
    }
}

async function writePort() {
    //let payload = "AT+SEND=2:000000000000000000000000000000000000000000000026";
    let payload = $('#txt_sendPayload').val().toUpperCase() ;
    payload += "\r\n";
    console.log(payload);

    
    $('#txt_payload').val($('#txt_payload').val() + ">> " + payload);
    $('#txt_payload').scrollTop($('#txt_payload')[0].scrollHeight);

    const encoder = new TextEncoder();
    const writer = device.writable.getWriter();
    await writer.write(encoder.encode(payload));
    writer.releaseLock();
}

document.querySelector('#txt_sendPayload').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        writePort();
    }
});
async function closePort() {
    await device.readable.releaseLock();
    await device.close();
}


function getMsg() {
    alert(document.getElementById('txt_payload').value)
}




var count = 0;
function setPayloadInterval(time, payload){
    /* TEST INTERVAL */
    console.log(count++);
    $('#txt_sendPayload').val("AT+SEND=10:"+payload)
    writePort()
    setInterval(function () {
        $('#txt_sendPayload').val("AT+SEND=10:"+payload)
        writePort();
    }, time*1000);
}

setPayloadInterval(10, "00")



