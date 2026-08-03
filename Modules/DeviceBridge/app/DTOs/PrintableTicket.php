<?php

namespace Modules\DeviceBridge\DTOs;

readonly class PrintableTicket
{
    public function __construct(
        public string $branchName,
        public string $serviceTypeName,
        public string $ticketNumber,
        public \DateTimeInterface $issuedAt,
    ) {
    }
}
