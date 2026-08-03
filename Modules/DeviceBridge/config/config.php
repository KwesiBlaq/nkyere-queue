<?php

return [
    'name' => 'DeviceBridge',

    'printer' => [
        // "null" logs instead of printing — the safe default with no hardware attached.
        // Set PRINTER_DRIVER=escpos and PRINTER_HOST to a real network printer's IP to print for real.
        'driver' => env('PRINTER_DRIVER', 'null'),
        'host' => env('PRINTER_HOST', '127.0.0.1'),
        'port' => env('PRINTER_PORT', 9100),
    ],
];
