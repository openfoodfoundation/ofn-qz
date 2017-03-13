var privateKey = "-----BEGIN RSA PRIVATE KEY-----\n" +
"MIIEpQIBAAKCAQEAtBSLWGEn9GoqIti/ZjnEGmfoFxvMAGocPI6xCr/Hu47ZbsYT\n" +
"qA8lfURERKNwddMNa/aIS81PcQJC4CUB5YngGuF2/59BoFQBX3Vo5QTlIAqtUF9V\n" +
"pbFveKZBvVb6AiwaiY3lO0qhouyTx/8q4B+YzPtJ8EqyjooBaLZ2utKlIMRfZFEN\n" +
"xGiD2Iqgb7ODBmQvbElfneyGVF8uL8foRsCC4nGUn/9EMxQ4bdBhzNjY4gHcrlDD\n" +
"H5FaW6AAA/JyLxDrFJbU5WlTTxZpXmOkKqyjVbJCTUxoFZdtkRYMeIneUvANt1CX\n" +
"lrJBadDA+27YmPjEt4bG6dzP3Pv4C1mnioLMLwIDAQABAoIBAQCu6hmjgdNWU9yT\n" +
"tmbK+6cgYvcLoyNW77p3k74hi8CMzKckMt+a6QNoFmwdI4ez2ol56Z/fyQ+13BVr\n" +
"NGcQNwjn80Ir7tvGyHIA78EwWr3XjqdjnwZJB/0Xep32NEpo27/3Bk23drlj0FmG\n" +
"9LIHuokn6Zma/mNLkn7l3/2ZX8um85TWuYOxyPWKltKAYz1UJEko3wSkBCaMt0Cp\n" +
"ZpZwdiAL5Tiv8x5gucTEd2PiWzUI4z66EIxeqOW08DbvROw2QlBdTpBkcW8UTLkJ\n" +
"p2hWx725/gpEnylaKLNj2LuK/NBZiv0tIS6U9oP0TamrmFiz1m4Tw3baeIbhpt2F\n" +
"iNCbgEsJAoGBAOc+/TeQOmV4VtMGmAVtERSg7tpeSbitjz8TtUljSPQTcg1bpWjC\n" +
"p36zqN2Ax5W7Yc3Pa/91onmBwF1DKoDP+I5gQpR3HNJ8dlgnufLwy7jQ/EO9fKMX\n" +
"8nEC05VOetNrmI7G7FBlERx9uV3Byqrv0Jn2cS8fo9eHPrqh0/s03PODAoGBAMdb\n" +
"a4OSX9X3LIwRSi6XB6WlWF3uAd7dSPP+Q5Rmb0aCT2HMKN2E2HcGVYF/yMOilZ6j\n" +
"0/Tc1jyemq/OGNKIkTxFqQgAGddzvM3MeNKJLeP+FAufANg4d6+BK0JyZqq2+SOo\n" +
"R6E1LAyLV6Xp3Z77vjQVXaorL0bVvPxfwKDqhajlAoGBALwGk44iT9lByBc+PU3s\n" +
"KP9E+/HCyN7JALihJb7OY/tR9GK4Kf7Mh7SWELBKjf5JpnTaO040MC/sOKWcf2rN\n" +
"r6TU0E43q8/aM7/qTWAkOwHDq9rIsBdM2Wzah3/XmDdgPWOai3uzMf6gm6CIemoT\n" +
"JOKLZ+yRJX+SEIdgHiUcDqxRAoGBAI30EOiNL+ShrnzGSvZF4NIYnIW11mslUq86\n" +
"nFBtaEriuze+MlMaJzEJt5UQsppriPJ/YYv4PCzKGweYT6CKUjCCwcvKlpwN86Dv\n" +
"OhFgUOcJoqhrviQ4gTDdXzpfT6+7vkefqfGmdQkxp2Wi04ZDZ7qahCmJuo5L39gt\n" +
"LnLmy+npAoGAFPU5O1z/G93TpjXaqoCd7dCyNX3L8m0aha6C+yvbHPpcHAzpzmE0\n" +
"BCqMBsR3Pxg9dr79U6c8YF1Upg4twztY3j+jCSFecjL6iucCJOp1D/I9h+iHw5zy\n" +
"jihmfNB9ZIuFE3cO5e+yna9ODFrW3+Gz4DG/JMuUTFZ9AKJ+9yuGStY=\n" +
"-----END RSA PRIVATE KEY-----";

qz.security.setSignaturePromise(function(toSign) {
    return function(resolve, reject) {
        try {
            var pk = new RSAKey();
            pk.readPrivateKeyFromPEMString(strip(privateKey));
            var hex = pk.signString(toSign, 'sha1');
            resolve(stob64(hextorstr(hex)));
        } catch (err) {
            displayError(err);
            reject(err);
        }
    };
});

function strip(key) {
    if (key.indexOf('-----') !== -1) {
        return key.split('-----')[2].replace(/\r?\n|\r/g, '');
    }
}

qz.security.setCertificatePromise(function(resolve, reject) {
    $.ajax("/assets/qz/cert.pem").then(resolve, reject);
});

function displayPrinters() {
    qz.printers.find().then(function(data) {
        var printerList = $("#printer-list");
        for(var i = 0; i < data.length; i++) {
            var printer = data[i];
            $('<a>', {
                text: printer + "\n",
                href: 'javascript:printTo("' + printer + '");',
            }).appendTo(printerList);
            $('<br>').appendTo(printerList);
        }
    }).catch(displayError);
};

function printTo(printer) {
    var config = qz.configs.create(printer, { encoding: 'windows-1252' });
    qz.print(config, printData).catch(displayError);
    localStorage.setItem('ticket-printer', printer);
}

function displayError(error) {
    alert(error);
}

$(document).ready(function() {
    qz.api.setSha256Type(Sha256.hash);
    qz.websocket.connect().then(function() {
        if (!localStorage.getItem('ticket-printer') || location.hash.indexOf('#select-printer') != -1)
            displayPrinters();
        else
            printTo(localStorage.getItem('ticket-printer'));
    }).catch(displayError);
});
