<?php

namespace Modules\DeviceBridge\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Modules\DeviceBridge\Contracts\PrinterDriverInterface;
use Modules\DeviceBridge\DTOs\PrintableTicket;

class PrintTicketJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(private readonly PrintableTicket $ticket)
    {
    }

    public function handle(PrinterDriverInterface $printer): void
    {
        $printer->print($this->ticket);
    }
}
