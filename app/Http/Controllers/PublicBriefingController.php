<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitBriefingRequest;
use App\Models\Briefing;
use App\Models\BriefingQuestion;
use App\Services\BriefingQuoteGenerator;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PublicBriefingController extends Controller
{
    public function show(string $token): Response
    {
        $briefing = Briefing::where('share_token', $token)
            ->with(['questions', 'company.companySetting'])
            ->firstOrFail();

        return Inertia::render('Briefings/Public', [
            'briefing' => $this->payload($briefing),
            'token' => $token,
            'submitted' => false,
            'canSubmit' => $briefing->isActive(),
        ]);
    }

    public function submit(SubmitBriefingRequest $request, string $token, BriefingQuoteGenerator $generator): RedirectResponse
    {
        $briefing = Briefing::where('share_token', $token)
            ->with('questions')
            ->firstOrFail();

        if (! $briefing->isActive()) {
            return back()->with('error', 'This briefing is not open for answers.');
        }

        $answers = $request->input('answers', []);
        foreach ($briefing->questions as $question) {
            if ($question->type === BriefingQuestion::TYPE_HEADING || ! $question->required) {
                continue;
            }
            if (! $this->answered($question, $answers[$question->id] ?? null)) {
                return back()->withErrors([
                    "answers.{$question->id}" => 'This question is required.',
                ])->withInput();
            }
        }

        $response = $briefing->responses()->create([
            'respondent_name' => $request->validated()['respondent_name'],
            'respondent_email' => $request->validated()['respondent_email'],
            'submitted_at' => now(),
        ]);

        foreach ($briefing->questions as $question) {
            if ($question->type === BriefingQuestion::TYPE_HEADING) {
                continue;
            }
            $raw = $answers[$question->id] ?? null;
            if ($raw === null || $raw === '') {
                continue;
            }
            $response->answers()->create([
                'question_id' => $question->id,
                'value' => $this->normalizeAnswer($question, $raw),
            ]);
        }

        $response->load(['answers.question', 'briefing.questions.service']);
        $generator->generate($response);

        return redirect()->route('briefings.public', $token)->with('status', 'briefing-submitted');
    }

    private function answered(BriefingQuestion $question, mixed $raw): bool
    {
        if ($raw === null || $raw === '') {
            return false;
        }
        if (is_array($raw)) {
            if ($question->type === BriefingQuestion::TYPE_YES_NO) {
                return array_key_exists('yes', $raw);
            }
            if ($question->type === BriefingQuestion::TYPE_QUANTITY) {
                return isset($raw['quantity']) && $raw['quantity'] !== '' && $raw['quantity'] !== null;
            }
            return filled($raw['text'] ?? $raw['label'] ?? $raw['index'] ?? null);
        }

        return filled($raw);
    }

    private function normalizeAnswer(BriefingQuestion $question, mixed $raw): array
    {
        if (! is_array($raw)) {
            return match ($question->type) {
                BriefingQuestion::TYPE_YES_NO => ['yes' => $raw === 'yes' || $raw === true || $raw === '1'],
                BriefingQuestion::TYPE_QUANTITY => ['quantity' => (int) $raw],
                default => ['text' => (string) $raw],
            };
        }

        return $raw;
    }

    private function payload(Briefing $briefing): array
    {
        $settings = $briefing->company?->companySetting;
        $theme = is_array($settings?->theme) ? $settings->theme : [];

        return [
            'id' => $briefing->id,
            'title' => $briefing->title,
            'intro' => $briefing->intro,
            'status' => $briefing->status,
            'company' => [
                'name' => $briefing->company?->company_name,
                'logo_url' => $settings?->invoice_logo ? asset('storage/'.$settings->invoice_logo) : null,
                'theme' => [
                    'primary' => $theme['primary'] ?? '#4054b2',
                    'secondary' => $theme['secondary'] ?? '#0f172a',
                ],
            ],
            'questions' => $briefing->questions->map(fn ($question) => [
                'id' => $question->id,
                'type' => $question->type,
                'label' => $question->label,
                'help_text' => $question->help_text,
                'required' => $question->required,
                'options' => $question->options ?? [],
            ]),
        ];
    }
}
