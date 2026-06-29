import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/**
 * SetupWizard — One-page guide for non-technical users to configure
 * "Refresh Products from Shopify" so the admin button works.
 *
 * The wizard has 4 steps, each with:
 *   - Plain-English description
 *   - Exact URL to click (with a "Open" button)
 *   - Exact value to type or paste (with a "Copy" button)
 *   - "I did this" checkbox to mark the step complete
 *
 * At the bottom: a "Test Setup" button that calls /api/refresh-products
 * and reports whether everything is configured correctly.
 *
 * All state is local — no save. Once setup is verified working, the user
 * can collapse the wizard and just use the "Refresh Products Now" button
 * on the admin dashboard.
 */

interface StepProps {
  number: number;
  title: string;
  done: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Step({ number, title, done, onToggle, children }: StepProps) {
  const [expanded, setExpanded] = useState(!done);
  return (
    <div className={`border rounded-lg ${done ? 'border-green-300 bg-green-50/50' : 'border-border'}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {number}
            </span>
          )}
          <span className={`font-medium ${done ? 'line-through text-muted-foreground' : ''}`}>
            {title}
          </span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3 text-sm text-muted-foreground">
          {children}
          <Button
            variant={done ? 'outline' : 'default'}
            size="sm"
            onClick={onToggle}
            className="mt-2"
          >
            {done ? 'Mark as not done' : "I did this ✓"}
          </Button>
        </div>
      )}
    </div>
  );
}

function CopyField({ label, value, description }: { label: string; value: string; description?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — select the text manually and copy');
    }
  };
  return (
    <div className="space-y-1">
      {description && <p className="text-xs">{description}</p>}
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-muted rounded text-xs font-mono break-all">{value}</code>
        <Button variant="outline" size="sm" onClick={copy} className="shrink-0">
          {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          <span className="ml-1">{copied ? 'Copied!' : 'Copy'}</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground/70">{label}</p>
    </div>
  );
}

function OpenLinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
    >
      {label}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

const SetupWizard = () => {
  const [stepsDone, setStepsDone] = useState({
    s1: false,
    s2: false,
    s3: false,
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | { ok: boolean; message: string }>(null);

  const toggleStep = (k: keyof typeof stepsDone) =>
    setStepsDone(prev => ({ ...prev, [k]: !prev[k] }));

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Get current Supabase session token
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !session?.access_token) {
        setTestResult({
          ok: false,
          message: 'You are not logged in. Please log in to the admin dashboard and try again.',
        });
        setTesting(false);
        return;
      }

      const resp = await fetch('/api/refresh-products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await resp.json().catch(() => ({}));

      if (resp.ok && data.ok) {
        setTestResult({
          ok: true,
          message: '✅ Setup complete! Vercel deploy was triggered. Check your Vercel deployments — a new build should appear within 30 seconds.',
        });
        // Mark all steps done since the test succeeded
        setStepsDone({ s1: true, s2: true, s3: true });
      } else if (resp.status === 500 && data.message?.includes('VERCEL_DEPLOY_HOOK_URL')) {
        setTestResult({
          ok: false,
          message: 'Almost there! The button works, but VERCEL_DEPLOY_HOOK_URL is not set in Vercel. Complete Steps 1-3 above first.',
        });
      } else if (resp.status === 401 || resp.status === 403) {
        setTestResult({
          ok: false,
          message: `Auth failed: ${data.error || data.message || 'You may not be logged in as admin'}. Try refreshing the page and logging in again.`,
        });
      } else {
        setTestResult({
          ok: false,
          message: `Test failed (HTTP ${resp.status}): ${data.error || data.message || 'Unknown error'}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: `Network error: ${err?.message ?? String(err)}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          First-time setup: "Refresh Products" button
        </CardTitle>
        <CardDescription>
          You only need to do this once. After setup, the "Refresh Products Now" button above
          will work forever. Estimated time: 5-10 minutes. No coding required.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1 */}
        <Step
          number={1}
          title="Create a Deploy Hook in Vercel"
          done={stepsDone.s1}
          onToggle={() => toggleStep('s1')}
        >
          <p>
            This creates a special URL that triggers a rebuild of your website. You'll only create it once.
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click the button below to open Vercel (log in if prompted).</li>
            <li>Scroll down to the <strong>"Deploy Hooks"</strong> section.</li>
            <li>Click <strong>"Create Hook"</strong>.</li>
            <li>In the <strong>Name</strong> field, type: <code className="px-1 py-0.5 bg-muted rounded">Shopify Refresh</code></li>
            <li>In the <strong>Branch</strong> dropdown, select: <code className="px-1 py-0.5 bg-muted rounded">main</code></li>
            <li>Click <strong>"Create"</strong>.</li>
            <li>
              A URL will appear (looks like <code className="px-1 py-0.5 bg-muted rounded text-xs">https://api.vercel.com/v1/integrations/deploy/Qm...</code>).
              <strong> Copy this URL</strong> — you'll paste it in Step 2.
            </li>
          </ol>
          <div className="pt-2">
            <OpenLinkButton
              href="https://vercel.com/leylabernie/luxemiashop/settings/git"
              label="Open Vercel Settings"
            />
          </div>
        </Step>

        {/* Step 2 */}
        <Step
          number={2}
          title="Add the Hook URL to your environment variables"
          done={stepsDone.s2}
          onToggle={() => toggleStep('s2')}
        >
          <p>
            This tells your website which URL to call when you click "Refresh Products Now".
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click the button below to open Vercel Environment Variables.</li>
            <li>Click <strong>"Create New Variable"</strong>.</li>
            <li>
              In the <strong>Name</strong> field, paste exactly this (use the Copy button):
            </li>
          </ol>
          <div className="py-1">
            <CopyField
              label="Paste this into the Name field"
              value="VERCEL_DEPLOY_HOOK_URL"
            />
          </div>
          <ol className="list-decimal list-inside space-y-1 ml-2" start={4}>
            <li>
              In the <strong>Value</strong> field, paste the URL you copied in Step 1
              (looks like <code className="px-1 py-0.5 bg-muted rounded text-xs">https://api.vercel.com/v1/integrations/deploy/Qm...</code>).
            </li>
            <li>
              Check all three boxes: <strong>Production</strong>, <strong>Preview</strong>, <strong>Development</strong>.
            </li>
            <li>Click <strong>"Save"</strong>.</li>
          </ol>
          <div className="pt-2">
            <OpenLinkButton
              href="https://vercel.com/leylabernie/luxemiashop/settings/environment-variables"
              label="Open Vercel Env Vars"
            />
          </div>
        </Step>

        {/* Step 3 */}
        <Step
          number={3}
          title="Redeploy so the new env var takes effect"
          done={stepsDone.s3}
          onToggle={() => toggleStep('s3')}
        >
          <p>
            Environment variables only take effect on the next build. Trigger one now.
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click the button below to open your Vercel deployments.</li>
            <li>Click the most recent deployment (the top one).</li>
            <li>Click the <strong>⋯ (three dots)</strong> menu in the top-right.</li>
            <li>Click <strong>"Redeploy"</strong>.</li>
            <li>Click <strong>"Redeploy"</strong> again to confirm.</li>
            <li>Wait 2-3 minutes for the build to finish (the status will turn green).</li>
          </ol>
          <div className="pt-2">
            <OpenLinkButton
              href="https://vercel.com/leylabernie/luxemiashop/deployments"
              label="Open Vercel Deployments"
            />
          </div>
        </Step>

        {/* Test button */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Button onClick={runTest} disabled={testing} className="min-w-[180px]">
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Setup & Refresh Products
                </>
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              This will also trigger a real Vercel deploy if setup is correct.
            </span>
          </div>

          {testResult && (
            <div
              className={`mt-4 p-4 rounded-md text-sm ${
                testResult.ok
                  ? 'bg-green-50 border border-green-200 text-green-900'
                  : 'bg-red-50 border border-red-200 text-red-900'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="h-4 w-4 inline mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 inline mr-2" />
              )}
              {testResult.message}
            </div>
          )}

          {/* Status summary */}
          <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
            {Object.entries(stepsDone).filter(([, v]) => v).length === 3 ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                All 3 steps marked complete. Click "Test Setup" to verify.
              </>
            ) : (
              <>
                <Circle className="h-3 w-3" />
                {Object.entries(stepsDone).filter(([, v]) => v).length} of 3 steps complete.
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SetupWizard;
