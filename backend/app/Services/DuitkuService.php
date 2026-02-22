<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DuitkuService
{
    private string $merchantCode;
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->merchantCode = config('services.duitku.merchant_code', '');
        $this->apiKey = config('services.duitku.api_key', '');
        $this->baseUrl = config('services.duitku.sandbox', true)
            ? 'https://sandbox.duitku.com/webapi/api/merchant'
            : 'https://passport.duitku.com/webapi/api/merchant';
    }

    private function generateSignature(string $merchantOrderId, int $amount): string
    {
        return md5($this->merchantCode . $merchantOrderId . $amount . $this->apiKey);
    }

    public function getPaymentMethods(int $amount): array
    {
        try {
            $datetime = now()->format('Y-m-d H:i:s');
            $signature = hash('sha256', $this->merchantCode . $amount . $datetime . $this->apiKey);

            $response = Http::post($this->baseUrl . '/paymentmethod/getpaymentmethod', [
                'merchantcode' => $this->merchantCode,
                'amount' => $amount,
                'datetime' => $datetime,
                'signature' => $signature,
            ]);

            if ($response->successful()) {
                return $response->json('paymentFee', []);
            }

            Log::error('Duitku get payment methods error', ['response' => $response->body()]);
            return [];
        } catch (\Exception $e) {
            Log::error('Duitku get payment methods exception', ['error' => $e->getMessage()]);
            return [];
        }
    }

    public function createInvoice(Order $order, string $paymentMethod): array
    {
        try {
            $amount = (int) $order->total_amount;
            $signature = $this->generateSignature($order->invoice, $amount);

            $payload = [
                'merchantCode' => $this->merchantCode,
                'paymentAmount' => $amount,
                'paymentMethod' => $paymentMethod,
                'merchantOrderId' => $order->invoice,
                'productDetails' => $order->product->product_name ?? 'Top Up',
                'customerVaName' => $order->customer_name ?? 'Customer',
                'email' => $order->customer_email ?? '',
                'phoneNumber' => $order->customer_phone ?? '',
                'callbackUrl' => config('services.duitku.callback_url'),
                'returnUrl' => config('services.duitku.return_url') . '?invoice=' . $order->invoice,
                'signature' => $signature,
                'expiryPeriod' => 60, // 60 menit
            ];

            Log::info('Duitku create invoice', ['invoice' => $order->invoice]);

            $response = Http::post($this->baseUrl . '/v2/inquiry', $payload);
            $data = $response->json();

            Log::info('Duitku invoice response', [
                'invoice' => $order->invoice,
                'statusCode' => $data['statusCode'] ?? 'unknown',
            ]);

            return $data ?? [];
        } catch (\Exception $e) {
            Log::error('Duitku create invoice exception', ['error' => $e->getMessage()]);
            return ['statusCode' => 'error', 'statusMessage' => $e->getMessage()];
        }
    }

    public function checkTransaction(string $merchantOrderId): array
    {
        try {
            $signature = $this->generateSignature($merchantOrderId, 0);
            // Duitku check uses different signature
            $signature = md5($this->merchantCode . $merchantOrderId . $this->apiKey);

            $response = Http::post($this->baseUrl . '/transactionStatus', [
                'merchantCode' => $this->merchantCode,
                'merchantOrderId' => $merchantOrderId,
                'signature' => $signature,
            ]);

            return $response->json() ?? [];
        } catch (\Exception $e) {
            Log::error('Duitku check transaction exception', ['error' => $e->getMessage()]);
            return ['statusCode' => 'error'];
        }
    }

    public function validateCallback(array $data): bool
    {
        $merchantCode = $data['merchantCode'] ?? '';
        $amount = $data['amount'] ?? '';
        $merchantOrderId = $data['merchantOrderId'] ?? '';
        $signature = $data['signature'] ?? '';

        $expected = md5($merchantCode . $amount . $merchantOrderId . $this->apiKey);
        return hash_equals($expected, $signature);
    }
}
