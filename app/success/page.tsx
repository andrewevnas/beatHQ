// app/success/page.tsx
// Server component. Shown after successful Stripe payment.
// Verifies the Stripe session, extracts beatName, and generates 24-hr download links.

import { stripe } from '@/lib/stripe';
import { getSignedUrls } from '@/lib/getSignedUrls';

interface SuccessPageProps {
  searchParams: { session_id?: string };
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams['session_id'];

  if (!sessionId) {
    return <ErrorState message="No payment session found." />;
  }

  let beatName: string;
  let mp3Url: string;
  let wavUrl: string;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return <ErrorState message="Payment not completed." />;
    }

    beatName = session.metadata?.['beatName'] ?? '';
    if (!beatName) {
      return <ErrorState message="Could not identify the purchased beat." />;
    }

    ({ mp3Url, wavUrl } = await getSignedUrls(beatName));
  } catch (error) {
    console.error('[success] Failed to retrieve session or generate URLs:', error);
    return <ErrorState message="Something went wrong. Please contact support." />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-canvas">
      <div className="border-2 border-ink p-10 w-full max-w-md text-center">
        <h1 className="text-sm font-bold tracking-[3px] uppercase text-ink mb-2">
          Purchase Complete
        </h1>
        <p className="text-[10px] tracking-[1px] uppercase text-muted mb-8">
          {beatName} — Links expire in 24 hours
        </p>

        <div className="flex flex-col gap-3">
          <a
            href={mp3Url}
            download
            className="w-full py-3 text-[11px] font-bold tracking-[2px] uppercase bg-ink text-canvas text-center hover:bg-ink/90 transition-colors duration-150 block"
          >
            Download MP3
          </a>
          <a
            href={wavUrl}
            download
            className="w-full py-3 text-[11px] font-bold tracking-[2px] uppercase border-2 border-ink text-ink text-center hover:bg-ink hover:text-canvas transition-colors duration-150 block"
          >
            Download WAV
          </a>
        </div>

        <p className="mt-8 text-[9px] tracking-[1px] uppercase text-muted">
          <a href="/" className="hover:text-ink transition-colors duration-150">
            ← Back to beats
          </a>
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-canvas">
      <div className="border-2 border-ink p-10 w-full max-w-md text-center">
        <h1 className="text-sm font-bold tracking-[3px] uppercase text-ink mb-4">
          Something went wrong
        </h1>
        <p className="text-[10px] tracking-[1px] uppercase text-muted mb-8">{message}</p>
        <a
          href="/"
          className="text-[10px] tracking-[1px] uppercase text-muted hover:text-ink transition-colors duration-150"
        >
          ← Back to beats
        </a>
      </div>
    </div>
  );
}
