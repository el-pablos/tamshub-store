<?php

namespace App\Console\Commands;

use App\Services\DigiflazzService;
use Illuminate\Console\Command;

class SyncDigiflazzProducts extends Command
{
    protected $signature = 'digiflazz:sync';
    protected $description = 'Sinkronisasi produk dari Digiflazz';

    public function handle(DigiflazzService $digiflazz): int
    {
        $this->info('Memulai sync produk Digiflazz...');
        $count = $digiflazz->syncProducts();
        $this->info("Berhasil sinkron {$count} produk.");
        return Command::SUCCESS;
    }
}
