import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, auth } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// The API requires 8+ for a new password, so match it rather than let the
// server be the one to reject a 6-character entry.
const newPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type Mode = 'login' | 'reset';

// There is no self-serve signup route on the API at all. Bootstrap the first
// admin from the backend with `npm run seed:admin`, which creates the account
// and grants the admin role in one step.

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('login');

  // A reset link sends the admin back here with the token in the query
  // string; presence of it switches the form into "set a new password" mode.
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('reset_token');
    if (token) {
      setResetToken(token);
      return;
    }
    const checkAuth = async () => {
      if (await auth.me()) {
        navigate('/admin/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (resetToken) {
        newPasswordSchema.parse({ password: newPassword });
        await auth.resetPassword(resetToken, newPassword);
        toast.success('Password updated. Sign in with your new password.');
        // Drop the token from the URL so a reload can't replay it.
        window.history.replaceState({}, '', '/admin/login');
        setResetToken(null);
        setNewPassword('');
        setMode('login');
      } else if (mode === 'reset') {
        resetSchema.parse({ email });
        await auth.forgotPassword(email);
        toast.success('If that email is registered, a reset link is on its way.');
        setMode('login');
      } else {
        loginSchema.parse({ email, password });
        const user = await auth.login(email, password);
        // Block sign-in until the email is verified.
        if (!user.email_confirmed_at) {
          await auth.logout();
          toast.error('Please verify your email before signing in. Check your inbox.');
          setLoading(false);
          return;
        }
        if (!user.roles.includes('admin')) {
          await auth.logout();
          toast.error('This account does not have admin access.');
          setLoading(false);
          return;
        }
        navigate('/admin/dashboard');
        toast.success('Logged in successfully!');
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof ApiError && error.status === 401) {
        toast.error('Invalid email or password');
      } else if (error instanceof ApiError && error.status === 429) {
        toast.error(error.message);
      } else {
        toast.error(error.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const title = resetToken ? 'Set a New Password' : mode === 'reset' ? 'Reset Password' : 'Admin Login';
  const description = resetToken
    ? 'Choose a new password for your admin account'
    : mode === 'reset'
    ? 'Enter your email and we will send you a password reset link'
    : 'Sign in to access the admin dashboard';
  const submitLabel = resetToken
    ? 'Update Password'
    : mode === 'reset'
    ? 'Send Reset Link'
    : 'Sign In';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!resetToken && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}
            {resetToken && (
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            )}
            {!resetToken && mode !== 'reset' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : submitLabel}
            </Button>
            {(mode === 'reset' || resetToken) && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setResetToken(null);
                  setMode('login');
                }}
              >
                Back to Sign In
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
