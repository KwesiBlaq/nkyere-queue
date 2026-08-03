<?php

namespace Modules\DeviceBridge\Providers;

use Nwidart\Modules\Support\ModuleServiceProvider;
use Illuminate\Console\Scheduling\Schedule;
use Modules\DeviceBridge\Contracts\PrinterDriverInterface;
use Modules\DeviceBridge\Drivers\EscPosNetworkPrinterDriver;
use Modules\DeviceBridge\Drivers\NullPrinterDriver;

class DeviceBridgeServiceProvider extends ModuleServiceProvider
{
    /**
     * The name of the module.
     */
    protected string $name = 'DeviceBridge';

    /**
     * The lowercase version of the module name.
     */
    protected string $nameLower = 'devicebridge';

    /**
     * Command classes to register.
     *
     * @var string[]
     */
    // protected array $commands = [];

    /**
     * Provider classes to register.
     *
     * @var string[]
     */
    protected array $providers = [
        EventServiceProvider::class,
        RouteServiceProvider::class,
    ];

    public function register(): void
    {
        parent::register();

        $this->app->bind(PrinterDriverInterface::class, function () {
            return match (config('devicebridge.printer.driver')) {
                'escpos' => new EscPosNetworkPrinterDriver(
                    config('devicebridge.printer.host'),
                    (int) config('devicebridge.printer.port'),
                ),
                default => new NullPrinterDriver(),
            };
        });
    }

    /**
     * Define module schedules.
     * 
     * @param $schedule
     */
    // protected function configureSchedules(Schedule $schedule): void
    // {
    //     $schedule->command('inspire')->hourly();
    // }
}
