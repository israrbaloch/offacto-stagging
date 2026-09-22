<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitBriefingRequest;
use App\Models\Briefing;
use App\Models\BriefingQuestion;
use App\Services\BriefingCustomerService;
use App\Services\BriefingQuoteGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
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

    public function submit(
        SubmitBriefingRequest $request,
        string $token,
        BriefingQuoteGenerator $generator,
        BriefingCustomerService $customers,
    ): RedirectResponse {
        $briefing = Briefing::where('share_token', $token)
            ->with('questions')
            ->firstOrFail();

        if (! $briefing->isActive()) {
            return back()->with('error', 'This briefing is not open for answers.');
        }

        $answers = $request->input('answers', []);
        $answerFiles = $request->file('answer_files', []);

        foreach ($briefing->questions as $question) {
            if ($question->type === BriefingQuestion::TYPE_HEADING || ! $question->required) {
                continue;
            }

            if (! $this->answered($question, $answers[$question->id] ?? null, $answerFiles[$question->id] ?? null)) {
                return back()->withErrors([
                    "answers.{$question->id}" => 'This question is required.',
                ])->withInput();
            }
        }

        $validated = $request->validated();

        $customer = $customers->resolveOrCreate(
            $briefing->company_id,
            $validated['respondent_name'],
            $validated['respondent_email'],
        );

        $response = $briefing->responses()->create([
            'customer_id' => $customer?->id,
            'respondent_name' => $validated['respondent_name'],
            'respondent_email' => $validated['respondent_email'],
            'submitted_at' => now(),
        ]);

        foreach ($briefing->questions as $question) {
            if ($question->type === BriefingQuestion::TYPE_HEADING) {
                continue;
            }

            if ($question->type === BriefingQuestion::TYPE_FILE_UPLOAD) {
                $this->storeFileAnswer($response, $question, $answerFiles[$question->id] ?? null);

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

    private function answered(BriefingQuestion $question, mixed $raw, mixed $file = null): bool
    {
        if ($question->type === BriefingQuestion::TYPE_FILE_UPLOAD) {
            return $file instanceof UploadedFile;
        }

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
            if ($question->type === BriefingQuestion::TYPE_MULTIPLE_CHOICE) {
                return ! empty($raw['indices']);
            }

            return filled($raw['text'] ?? $raw['label'] ?? $raw['index'] ?? null);
        }

        return filled($raw);
    }

    private function storeFileAnswer($response, BriefingQuestion $question, mixed $file): void
    {
        if (! $file instanceof UploadedFile) {
            return;
        }

        $path = $file->store('briefing-uploads/'.$response->id, 'public');

        $response->answers()->create([
            'question_id' => $question->id,
            'value' => ['original_name' => $file->getClientOriginalName()],
            'file_path' => $path,
        ]);
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

        if ($question->type === BriefingQuestion::TYPE_MULTIPLE_CHOICE) {
            $options = $question->options ?? [];
            $indices = collect($raw['indices'] ?? [])
                ->filter(fn ($index) => is_numeric($index))
                ->map(fn ($index) => (int) $index)
                ->unique()
                ->values()
                ->all();

            $labels = collect($indices)
                ->map(fn (int $index) => $options[$index]['label'] ?? null)
                ->filter()
                ->values()
                ->all();

            return [
                'indices' => $indices,
                'labels' => $labels,
            ];
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
