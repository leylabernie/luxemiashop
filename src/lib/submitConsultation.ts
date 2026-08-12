const CONSULTATION_FUNCTION_URL =
  'https://jcyolouvxfxovzjyyrxu.supabase.co/functions/v1/submit-consultation';

export interface ConsultationSubmission {
  name: string;
  email: string;
  phone: string;
  country: string;
  occasion?: string;
  preferredDate?: string;
  budget?: string;
  requirements?: string;
}

interface ConsultationResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

export async function submitConsultation(
  submission: ConsultationSubmission,
): Promise<void> {
  const response = await fetch(CONSULTATION_FUNCTION_URL, {
    method: 'POST',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...submission,
      website: '',
    }),
  });

  const result = (await response.json().catch(() => ({}))) as ConsultationResponse;

  if (!response.ok || result.success !== true) {
    throw new Error(result.error || 'Unable to save your request');
  }
}
