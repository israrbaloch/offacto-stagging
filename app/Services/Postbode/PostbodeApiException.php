<?php

namespace App\Services\Postbode;

use Exception;

class PostbodeApiException extends Exception
{
    /**
     * @param  array<string, array<int, string>|string>  $errors
     */
    public function __construct(
        string $message,
        public readonly int $status = 0,
        public readonly array $errors = [],
    ) {
        parent::__construct($message, $status);
    }
}
