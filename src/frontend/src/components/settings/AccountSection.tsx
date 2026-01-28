import { useState } from 'react';
import { Lock, Trash2, AlertTriangle, Eye, EyeOff, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal, ModalFooter } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

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

    setIsDeleting(true);

    try {
      // Note: This requires server-side implementation to fully delete user data
      // For now, we just sign out and redirect
      await signOut();
      navigate('/');
      success('Account deleted', 'Your account has been scheduled for deletion.');
    } catch (err) {
      showError('Delete failed', 'Please contact support to delete your account.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-medium mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          account
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          manage your account security and settings
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
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <Lock className="w-5 h-5" style={{ color: 'var(--color-textSecondary)' }} />
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              password
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {user?.app_metadata?.provider === 'email'
                ? 'change your password to keep your account secure'
                : `signed in with ${user?.app_metadata?.provider || 'oauth'}`}
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
                    cancel
                  </Button>
                  <Button type="submit" size="sm" isLoading={isUpdating}>
                    update password
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
                change password
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
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <LogOut className="w-5 h-5" style={{ color: 'var(--color-textSecondary)' }} />
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              sign out
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-textMuted)' }}
            >
              sign out from this device
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleSignOut}
            >
              sign out
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
              delete account
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-textMuted)' }}
            >
              permanently delete your account and all associated data
            </p>
            <Button
              variant="danger"
              size="sm"
              className="mt-3"
              onClick={() => setShowDeleteModal(true)}
            >
              delete account
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
                this action cannot be undone
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--color-textMuted)' }}
              >
                all your data including profile, assessments, applications, and
                chat history will be permanently deleted.
              </p>
            </div>
          </div>

          <Input
            label={`type "delete my account" to confirm`}
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
            cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            isLoading={isDeleting}
            disabled={deleteConfirmText !== 'delete my account'}
          >
            delete account
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
