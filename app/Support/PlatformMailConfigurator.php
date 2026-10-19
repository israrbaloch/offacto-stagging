<?php

namespace App\Support;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Schema;

/**
 * Applies platform email settings from site_settings over .env defaults when sending mail.
 */
final class PlatformMailConfigurator
{
    public static function apply(): void
    {
        try {
            if (! Schema::hasTable('site_settings')) {
                return;
            }
        } catch (\Throwable) {
            return;
        }

        $driver = SiteSetting::get('int_mail_driver');
        if (filled($driver)) {
            config(['mail.default' => $driver]);
        }

        $fromAddress = SiteSetting::get('int_mail_from_address');
        $fromName = SiteSetting::get('int_mail_from_name');
        if (filled($fromAddress)) {
            config(['mail.from.address' => $fromAddress]);
        }
        if (filled($fromName)) {
            config(['mail.from.name' => $fromName]);
        }

        $replyTo = SiteSetting::get('int_mail_reply_to');
        if (filled($replyTo)) {
            config(['mail.reply_to.address' => $replyTo]);
            config(['mail.reply_to.name' => $fromName ?: config('mail.from.name')]);
        }

        $useEnvFallback = SiteSetting::getBoolean('comm_outbound_use_env_fallback', true);

        if (($driver ?: config('mail.default')) === 'smtp') {
            $host = SiteSetting::get('int_smtp_host');
            $port = SiteSetting::get('int_smtp_port');
            $encryption = SiteSetting::get('int_smtp_encryption');
            $username = SiteSetting::get('int_smtp_username');
            $password = SiteSetting::get('int_smtp_password');

            if (filled($host) || ! $useEnvFallback) {
                config(['mail.mailers.smtp.host' => filled($host) ? $host : config('mail.mailers.smtp.host')]);
            }
            if (filled($port) || ! $useEnvFallback) {
                config(['mail.mailers.smtp.port' => filled($port) ? (int) $port : (int) config('mail.mailers.smtp.port')]);
            }
            if ($encryption !== null && $encryption !== '') {
                config(['mail.mailers.smtp.scheme' => $encryption === 'ssl' ? 'smtps' : null]);
                config(['mail.mailers.smtp.encryption' => $encryption === 'none' ? null : ($encryption === 'ssl' ? 'ssl' : 'tls')]);
            }
            if (filled($username)) {
                config(['mail.mailers.smtp.username' => $username]);
            }
            if (filled($password)) {
                config(['mail.mailers.smtp.password' => $password]);
            }
        }

        $postmark = SiteSetting::get('int_postmark_token');
        if (filled($postmark)) {
            config(['services.postmark.key' => $postmark]);
        }

        $resend = SiteSetting::get('int_resend_api_key');
        if (filled($resend)) {
            config(['services.resend.key' => $resend]);
        }
    }

    public static function isOutboundConfigured(): bool
    {
        $driver = SiteSetting::get('int_mail_driver', config('mail.default'));
        if ($driver === 'log' || $driver === 'array') {
            return false;
        }
        if ($driver === 'smtp') {
            return filled(SiteSetting::get('int_smtp_host')) || filled(config('mail.mailers.smtp.host'));
        }
        if ($driver === 'postmark') {
            return filled(SiteSetting::get('int_postmark_token')) || filled(config('services.postmark.key'));
        }
        if ($driver === 'resend') {
            return filled(SiteSetting::get('int_resend_api_key')) || filled(config('services.resend.key'));
        }

        return true;
    }
}
