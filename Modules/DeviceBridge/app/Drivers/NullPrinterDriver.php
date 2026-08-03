<?php

namespace Modules\DeviceBridge\Drivers;

use Illuminate\Support\Facades\Log;
use Modules\DeviceBridge\Contracts\PrinterDriverInterface;
use Modules\DeviceBridge\DTOs\PrintableTicket;

/**
 * No physical printer attached. Logs what would have been printed so local
 * dev and demos work without hardware. Set PRINTER_DRIVER=escpos + PRINTER_HOST
 * once a real network thermal printer is available.
 */
class NullPrinterDriver implements PrinterDriverInterface
{
    public function print(PrintableTicket $ticket): void
    {
        Log::info('[NullPrinterDriver] would print ticket', [
            'branch' => $ticket->branchName,
            'service' => $ticket->serviceTypeName,
            'ticket_number' => $ticket->ticketNumber,
            'issued_at' => $ticket->issuedAt->format('Y-m-d H:i:s'),
        ]);
    }
}
