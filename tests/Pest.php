<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class)->in('Feature', 'Unit');
uses(TestCase::class, RefreshDatabase::class)->in(
    __DIR__.'/../Modules/QueueEngine/tests/Unit',
    __DIR__.'/../Modules/QueueEngine/tests/Feature',
    __DIR__.'/../Modules/Signage/tests/Unit',
    __DIR__.'/../Modules/Signage/tests/Feature',
    __DIR__.'/../Modules/Auth/tests/Unit',
    __DIR__.'/../Modules/Auth/tests/Feature',
);
