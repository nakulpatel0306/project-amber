import { useState } from 'react';
import { Lock, Trash2, AlertTriangle, Eye, EyeOff, LogOut, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal, ModalFooter } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';

export function AccountSection() {
  const navigate = useNavigate();
  const { user, updatePassword, signOut } = useAuth();
  const { success, error: showError } = useToast();

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      showError('Password too short', 'Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords don\'t match', 'Please make sure your passwords match.');
      return;
    }

    setIsUpdating(true);

    try {
      await updatePassword(newPassword);
      success('Password updated', 'Your password has been changed successfully.');
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update password';
      showError('Update failed', message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'delete my account') {
      showError('Confirmation required', 'Please type "delete my account" to confirm.');
      return;
    }

    if (!user) return;
    setIsDeleting(true);

    try {
      // Delete user data from all related tables (RLS policies allow users to delete own data)
      const deletions = [
        supabase.from('feedback').delete().eq('user_id', user.id),
        supabase.from('user_settings').delete().eq('user_id', user.id),
        supabase.from('coffee_chats').delete().or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`),
        supabase.from('personality_results').delete().eq('user_id', user.id),
        supabase.from('match_scores').delete().or(`candidate_id.eq.${user.id},employer_id.eq.${user.id}`),
        supabase.from('profiles').delete().eq('id', user.id),
      ];

      const results = await Promise.allSettled(deletions);
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        console.warn('Some deletions failed:', failures);
      }

      // Sign out after data cleanup
      await signOut();
      navigate('/');
      success('Account Deleted', 'Your account and data have been removed.');
    } catch (err) {
      showError('Delete Failed', 'Some data could not be removed. Please contact support at amberfounders@gmail.com.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: personalityData } = await supabase
        .from('personality_results')
        .select('*')
        .eq('user_id', user.id);

      const exportData = {
        exported_at: new Date().toISOString(),
        email: user.email,
        profile: profileData,
        settings: settingsData,
        personality_results: personalityData,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `amber-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      success('Data Exported', 'Your data has been downloaded as a JSON file.');
    } catch (err) {
      showError('Export Failed', 'Could not export your data. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
          >
            <Lock className="w-4 h-4" style={{ color: '#f59e0b' }} />
          </div>
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--color-text)' }}
          >
            Account
          </h2>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--color-textMuted)' }}>
          Manage Your Account Security & Settings
        </p>
      </div>

      {/* Password Section */}
      <div
        className="p-4 rounded-xl border"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
          >
            <Lock className="w-5 h-5" style={{ color: '#f59e0b' }} />
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Password
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {user?.app_metadata?.provider === 'email'
                ? 'Change your password to keep your account secure'
                : `Signed in with ${user?.app_metadata?.provider || 'OAuth'}`}
            </p>

            {isChangingPassword ? (
              <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                <Input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password (min 8 characters)"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />
                <Input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" isLoading={isUpdating}>
                    Update Password
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setIsChangingPassword(true)}
                disabled={user?.app_metadata?.provider !== 'email'}
              >
                Change Password
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div
        className="p-4 rounded-xl border"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
          >
            <LogOut className="w-5 h-5" style={{ color: '#d97706' }} />
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Sign Out
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Sign out from this device
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Export Data */}
      <div
        className="p-4 rounded-xl border"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
          >
            <Download className="w-5 h-5" style={{ color: '#10B981' }} />
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Export Your Data
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Download a copy of your profile, settings, and assessment data
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleExportData}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="p-4 rounded-xl border"
        style={{
          borderColor: 'var(--color-error)',
          backgroundColor: 'rgba(220, 38, 38, 0.05)',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
          >
            <Trash2 className="w-5 h-5" style={{ color: 'var(--color-error)' }} />
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-error)' }}
            >
              Delete Account
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Permanently delete your account and all associated data
            </p>
            <Button
              variant="danger"
              size="sm"
              className="mt-3"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="sm"
      >
        <div className="space-y-4">
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-error)' }} />
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-error)' }}
              >
                This action cannot be undone
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--color-textMuted)' }}
              >
                All your data including profile, assessments, applications, and
                chat history will be permanently deleted.
              </p>
            </div>
          </div>

          <Input
            label={`Type "delete my account" to confirm`}
            value={deleteConfirmText}
            onChange={e => setDeleteConfirmText(e.target.value)}
            placeholder="delete my account"
          />
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            isLoading={isDeleting}
            disabled={deleteConfirmText !== 'delete my account'}
          >
            Delete Account
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
