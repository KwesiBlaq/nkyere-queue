<?php

namespace Modules\DeviceBridge\Contracts;

use Modules\DeviceBridge\DTOs\PrintableTicket;

interface PrinterDriverInterface
{
    public function print(PrintableTicket $ticket): void;
}
