<?php

namespace Modules\Tenancy\Console;

use App\Models\Tenant;
use Illuminate\Console\Command;

/**
 * Onboards a new bank: provisions its own isolated database and domain.
 * Usage: php artisan tenant:create "Demo Bank" demo demo.localhost --seed
 */
class CreateTenantCommand extends Command
{
    protected $signature = 'tenant:create {name} {id} {domain} {--seed}';

    protected $description = 'Create a new bank tenant, provision its database, and map its domain.';

    public function handle(): int
    {
        $tenant = Tenant::create([
            'id' => $this->argument('id'),
            'name' => $this->argument('name'),
        ]);

        $tenant->domains()->create(['domain' => $this->argument('domain')]);

        $this->info("Tenant [{$tenant->id}] created. Running tenant migrations...");
        $this->call('tenants:migrate', ['--tenants' => [$tenant->id]]);

        if ($this->option('seed')) {
            $this->call('tenants:seed', ['--tenants' => [$tenant->id]]);
        }

        $this->info("Bank \"{$this->argument('name')}\" is live at {$this->argument('domain')}.");

        return self::SUCCESS;
    }
}
