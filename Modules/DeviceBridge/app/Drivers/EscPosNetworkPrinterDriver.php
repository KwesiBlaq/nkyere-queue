<?php

namespace Modules\DeviceBridge\Drivers;

use Mike42\Escpos\Printer;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;
use Modules\DeviceBridge\Contracts\PrinterDriverInterface;
use Modules\DeviceBridge\DTOs\PrintableTicket;

/**
 * Speaks ESC/POS over TCP/IP — the protocol nearly every thermal receipt
 * printer supports (Epson TM-T20III, generic 80mm ESC/POS printers, ...).
 */
class EscPosNetworkPrinterDriver implements PrinterDriverInterface
{
    public function __construct(
        private readonly string $host,
        private readonly int $port = 9100,
    ) {
    }

    public function print(PrintableTicket $ticket): void
    {
        $connector = new NetworkPrintConnector($this->host, $this->port);
        $printer = new Printer($connector);

        try {
            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->setTextSize(2, 2);
            $printer->text($ticket->branchName."\n");
            $printer->setTextSize(1, 1);
            $printer->text($ticket->serviceTypeName."\n");
            $printer->feed();

            $printer->setTextSize(4, 4);
            $printer->text($ticket->ticketNumber."\n");
            $printer->setTextSize(1, 1);
            $printer->feed();

            $printer->text($ticket->issuedAt->format('Y-m-d H:i:s')."\n");
            $printer->feed(2);
            $printer->cut();
        } finally {
            $printer->close();
        }
    }
}
