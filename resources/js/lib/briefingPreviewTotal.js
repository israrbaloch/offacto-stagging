export function briefingPreviewTotal(questions, answers, basePrice = 0, { byQuestionId = false } = {}) {
    let total = Number(basePrice) || 0;

    questions.forEach((question, index) => {
        const answer = byQuestionId ? answers[question.id] : answers[index];
        if (question.type === 'single_choice') {
            const optionIndex = byQuestionId ? answer?.index : answer;
            if (optionIndex != null) {
                total += Number(question.options?.[optionIndex]?.price || 0);
            }
        }
        if (question.type === 'multiple_choice') {
            const indices = byQuestionId ? answer?.indices || [] : answer || [];
            indices.forEach((optionIndex) => {
                total += Number(question.options?.[optionIndex]?.price || 0);
            });
        }
        if (question.type === 'quantity') {
            const qty = byQuestionId ? answer?.quantity : answer;
            if (qty) {
                const unit = Number(question.price_override || question.options?.[0]?.price || 0);
                total += Number(qty) * unit;
            }
        }
        if (question.type === 'yes_no') {
            const yes = byQuestionId ? answer?.yes : answer === true;
            if (yes) {
                total += Number(question.price_override || 0);
            }
        }
    });

    return total;
}

export function previewUrlLabel(shareUrl) {
    if (!shareUrl) {
        return 'offacto.app/b/…';
    }
    if (typeof window !== 'undefined' && !shareUrl.startsWith('http')) {
        return `${window.location.host}${shareUrl.startsWith('/') ? '' : '/'}${shareUrl}`;
    }
    return shareUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}
