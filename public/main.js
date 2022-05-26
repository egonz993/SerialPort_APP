
    //disable form submit
    $('form').submit(false);

    let device;
    let port = navigator.serial;
    let portOptions = {
    baudRate: 9600,
    dataBits: 8,
    parity: "none",
    stopBits: 1
    }

    let baudRate = 9600;

    port.onconnect = event => { console.log(event) };
    port.ondisconnect = event => { console.log(event) };

    async function deviceConnect(){
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

    async function readPort(){
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = device.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    try {
        while (true) {
        const { value, done } = await reader.read();
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

    async function writePort(){
    //let payload = "AT+SEND=2:000000000000000000000000000000000000000000000026";
    let payload = $('#txt_sendPayload').val();
    payload += "\r\n";
    console.log(payload);

    const encoder = new TextEncoder();
    const writer = device.writable.getWriter();
    await writer.write(encoder.encode(payload));
    writer.releaseLock();
    }

    async function closePort(){
    await device.readable.releaseLock();
    await device.close();
    }


    function getMsg(){
    alert(document.getElementById('txt_payload').value)
    }
