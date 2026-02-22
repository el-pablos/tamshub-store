<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|exists:products,id',
            'target_id' => 'required|string|max:50',
            'zone_id' => 'nullable|string|max:20',
            'payment_method' => 'required|string|max:10',
            'customer_name' => 'nullable|string|max:100',
            'customer_email' => 'nullable|email|max:100',
            'customer_phone' => 'nullable|string|max:20',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Pilih produk terlebih dahulu.',
            'target_id.required' => 'Nomor tujuan / ID game wajib diisi.',
            'payment_method.required' => 'Pilih metode pembayaran.',
        ];
    }
}
