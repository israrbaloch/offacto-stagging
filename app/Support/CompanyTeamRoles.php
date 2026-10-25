<?php

namespace App\Support;

use App\Models\Company;
use App\Models\CompanyTeamMember;
use App\Models\User;

final class CompanyTeamRoles
{
    /** @var list<string> */
    public const ROLES = ['owner', 'staff', 'accountant'];

    public static function roleLabelKey(string $role): string
    {
        return match ($role) {
            'owner' => 'company_settings.team_role_owner',
            'staff' => 'company_settings.team_role_staff',
            'accountant' => 'company_settings.team_role_accountant',
            default => 'company_settings.team_role_staff',
        };
    }

    public static function permissionsLabelKey(string $role): string
    {
        return match ($role) {
            'owner' => 'company_settings.team_permissions_owner',
            'staff' => 'company_settings.team_permissions_staff',
            'accountant' => 'company_settings.team_permissions_accountant',
            default => 'company_settings.team_permissions_staff',
        };
    }

    public static function initials(string $first, string $surname): string
    {
        $a = mb_substr(trim($first), 0, 1);
        $b = mb_substr(trim($surname), 0, 1);

        return strtoupper($a.$b) ?: '—';
    }

    /**
     * @return array{id: string, first_name: string, surname: string, email: string, role: string, initials: string, is_owner: bool}
     */
    public static function ownerRow(Company $company): array
    {
        $company->loadMissing('user');
        $user = $company->user;

        $first = trim((string) ($company->first_name ?: ''));
        $surname = trim((string) ($company->surname ?: ''));
        if ($first === '' && $user) {
            $parts = preg_split('/\s+/', trim((string) $user->name), 2) ?: [];
            $first = $parts[0] ?? '';
            $surname = $parts[1] ?? '';
        }

        $email = trim((string) ($company->email ?: $user?->email ?: ''));

        return [
            'id' => 'owner',
            'first_name' => $first,
            'surname' => $surname,
            'email' => $email,
            'role' => 'owner',
            'initials' => self::initials($first, $surname),
            'is_owner' => true,
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function membersForCompany(Company $company): array
    {
        return $company->teamMembers()
            ->orderBy('first_name')
            ->orderBy('surname')
            ->get()
            ->map(fn (CompanyTeamMember $member) => [
                'id' => $member->id,
                'first_name' => $member->first_name,
                'surname' => $member->surname,
                'email' => $member->email,
                'role' => in_array($member->role, ['staff', 'accountant'], true) ? $member->role : 'staff',
                'initials' => self::initials($member->first_name, $member->surname),
                'is_owner' => false,
                'pending' => $member->accepted_at === null,
            ])
            ->all();
    }

    public static function canManageTeam(?User $user, ?Company $company): bool
    {
        if (! $user || ! $company) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        return (int) $company->user_id === (int) $user->id;
    }
}
