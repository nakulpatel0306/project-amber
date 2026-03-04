import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * Shown when a user cancels out of Stripe Checkout without completing payment.
 */
export function BillingCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
      <div className="text-center max-w-md px-6">
        <XCircle
          className="w-16 h-16 mx-auto mb-6"
          style={{ color: 'var(--color-textMuted)' }}
        />
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Checkout Canceled
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-textMuted)' }}>
          No worries! You weren't charged. You can upgrade anytime from the pricing page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/app/pricing')}>
            Back to Pricing
          </Button>
          <Button variant="outline" onClick={() => navigate('/app/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
