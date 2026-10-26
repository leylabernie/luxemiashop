export const FIT_COPY_REVIEW_DATE: '2026-10-26';
type FitCopyProduct = { id?: string; description?: string; descriptionHtml?: string };
export function getReviewedFitCopy(product?: FitCopyProduct): string[];
export function appendReviewedFitCopy(description: string, product?: FitCopyProduct): string;
export function renderReviewedFitCopy(product?: FitCopyProduct): string;
