<?php

namespace App\Support;

final class SupportSettingsRegistry
{
    /**
     * @return list<array<string, mixed>>
     */
    public static function sections(): array
    {
        $config = array_map(
            fn (string $id, array $def) => [
                'id' => $id,
                'group' => $def['group'],
                'title' => $def['title'],
                'description' => $def['description'],
                'kind' => 'config',
                'href' => '/admin/support/'.$id,
            ],
            array_keys(self::definitions()),
            self::definitions(),
        );

        $ops = array_map(
            fn (array $row) => [...$row, 'kind' => 'operation', 'href' => '/admin/support/operations/'.$row['id']],
            self::operationSections(),
        );

        $tickets = [
            'id' => 'tickets',
            'group' => 'Cases',
            'title' => 'Support ticket management',
            'description' => 'Create, assign, prioritize, and resolve customer tickets.',
            'kind' => 'tickets',
            'href' => '/admin/support/tickets',
        ];

        return array_values([$tickets, ...$config, ...$ops]);
    }

    /**
     * @return list<array{id: string, group: string, title: string, description: string}>
     */
    public static function operationSections(): array
    {
        return [
            ['id' => 'access-approvals', 'group' => 'Access', 'title' => 'Support access approval', 'description' => 'Documented approval before staff review customer workspace context.'],
            ['id' => 'activity-timeline', 'group' => 'Context', 'title' => 'Customer activity timeline', 'description' => 'Account, subscription, delivery, and restriction events.'],
            ['id' => 'account-recovery', 'group' => 'Access', 'title' => 'Account recovery assistance', 'description' => 'Verified recovery — no password exposure or bypass.'],
            ['id' => 'macros-knowledge', 'group' => 'Knowledge', 'title' => 'Support macros & knowledge base', 'description' => 'Reusable replies and internal guides.'],
            ['id' => 'feedback', 'group' => 'Voice of customer', 'title' => 'Customer feedback management', 'description' => 'Requests, complaints, and satisfaction ratings.'],
            ['id' => 'escalations', 'group' => 'Escalations', 'title' => 'Support escalations', 'description' => 'Billing, fraud, privacy, and legal routing.'],
        ];
    }

    public static function definition(string $id): ?array
    {
        return self::definitions()[$id] ?? null;
    }

    public static function isOperationSection(string $id): bool
    {
        return collect(self::operationSections())->contains(fn ($s) => $s['id'] === $id);
    }

    /**
     * @return array<string, array{group: string, title: string, description: string, fields: list<array<string, mixed>>}>
     */
    public static function definitions(): array
    {
        return [
            'sla-policies' => [
                'group' => 'SLA',
                'title' => 'SLA & escalation policies',
                'description' => 'Response targets, working hours, and priority rules (Belgium / CET-oriented defaults).',
                'fields' => [
                    ['key' => 'sup_sla_first_response_hours', 'type' => 'structured', 'widget' => 'sla_priorities', 'label' => 'First response (hours)', 'default' => [
                        'urgent' => 4, 'high' => 8, 'normal' => 24, 'low' => 48,
                    ]],
                    ['key' => 'sup_working_hours', 'type' => 'structured', 'widget' => 'working_hours', 'label' => 'Working hours', 'default' => [
                        'timezone' => 'Europe/Brussels', 'days' => 'Mon-Fri', 'start' => '09:00', 'end' => '17:00',
                    ]],
                    ['key' => 'sup_escalation_paths', 'type' => 'structured', 'widget' => 'escalation_paths', 'label' => 'Escalation paths', 'default' => [
                        ['type' => 'billing_dispute', 'team' => 'billing'],
                        ['type' => 'privacy', 'team' => 'compliance'],
                        ['type' => 'legal', 'team' => 'legal'],
                        ['type' => 'fraud', 'team' => 'security'],
                    ]],
                    ['key' => 'sup_require_access_approval', 'type' => 'boolean', 'label' => 'Require access approval before workspace context review', 'default' => true],
                ],
            ],
        ];
    }
}
