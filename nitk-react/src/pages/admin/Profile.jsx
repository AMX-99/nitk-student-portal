import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge, Button, Avatar } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../services/adminApi';
import { uploadFileToSupabase } from '../../services/uploadHelper';
import { LoadingState } from '../../components/ui/StateDisplays';
import { stagger, showToast } from '../../components/ui/animations';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProfile() {
  const { profile, refetchProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [editData, setEditData] = useState({});
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPwd, setChangingPwd] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (!profile) return <LoadingState message="Loading profile..." />;

  const p = profile;
  const name = p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Admin User';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const personalInfo = [
    { label: 'Full Name', value: name, editable: false },
    { label: 'Role', value: 'Administrator', editable: false },
    { label: 'Email', value: p.email || '—', editable: false },
    { label: 'Phone', value: p.phone || '—', editValue: p.phone || '', field: 'phone', editable: true },
    { label: 'Department Access', value: 'All Departments', editable: false },
    { label: 'System Access Level', value: 'Super Admin', editable: false },
    { label: 'Employee ID', value: p.employee_id || 'ADM-001', editable: false },
    { label: 'Joined Date', value: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—', editable: false },
  ];

  const adminStats = [
    { label: 'Account Status', value: 'Active', color: 'var(--color-green)' },
    { label: 'Last Login', value: 'Today', color: 'var(--color-blue)' },
    { label: '2FA Enabled', value: 'Yes', color: 'var(--color-amber)' },
  ];

  const tabs = [
    { id: 'personal', label: '👤 Profile Details' },
    { id: 'security', label: '🔒 Security Settings' },
  ];

  const currentData = activeTab === 'personal' ? personalInfo : [];

  const handleSave = async () => {
    try {
      await adminApi.updateProfile(editData);
      await refetchProfile();
      setIsEditing(false);
      setEditData({});
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to update profile.', 'error');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setChangingPwd(true);
    try {
      await adminApi.changePassword({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword });
      showToast('Password updated successfully', 'success');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to update password', 'error');
    } finally {
      setChangingPwd(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return showToast('Image must be under 5MB', 'error');

    setUploadingAvatar(true);
    try {
      const { signedUrl, publicUrl } = await adminApi.uploadAvatar();
      await uploadFileToSupabase(signedUrl, file);
      await adminApi.updateProfile({ profile_pic: publicUrl });
      await refetchProfile();
      showToast('Profile image updated!', 'success');
    } catch (err) {
      showToast('Failed to upload image. Please try again.', 'error');
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div variants={stagger.item}>
        <Card>
          <CardBody className="flex items-center gap-6 py-6">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring' }} className="relative group cursor-pointer">
              <label htmlFor="avatar-upload" className="cursor-pointer block relative">
                <Avatar initials={initials} color="var(--color-purple)" size="lg" src={p.profile_pic} />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-[20px]">{uploadingAvatar ? '...' : '📷'}</span>
                </div>
              </label>
              <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </motion.div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold">{name}</h2>
              <p className="mt-0.5 text-[13px] text-[var(--t2)]">System Administrator · NIT Kurukshetra</p>
              <div className="mt-2.5 flex items-center gap-2">
                <Badge variant="purple">Admin</Badge>
                <Badge variant="green">Active</Badge>
                <Badge variant="blue">Full Access</Badge>
              </div>
            </div>
            <Button
              variant={isEditing ? 'success' : 'ghost'}
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
            >
              {isEditing ? '✓ Save Changes' : '✏️ Edit Profile'}
            </Button>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div className="grid grid-cols-[1fr_300px] gap-5" variants={stagger.item}>
        <Card>
          <CardHeader>
            <div className="flex gap-1.5">
              {tabs.map((t) => (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(t.id)}
                  className={`cursor-pointer rounded-lg px-3.5 py-2 text-[12px] font-semibold transition-all ${
                    activeTab === t.id ? 'bg-orange text-white' : 'bg-[var(--s3)] text-[var(--t2)] hover:bg-[var(--s4)]'
                  }`}
                >
                  {t.label}
                </motion.button>
              ))}
            </div>
          </CardHeader>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'security' ? (
                <div className="p-5">
                  <h4 className="mb-4 text-[14px] font-semibold text-[var(--t1)]">Change Password</h4>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[var(--t2)]">Current Password</label>
                      <input
                        type="password" required
                        value={passwordData.oldPassword}
                        onChange={e => setPasswordData(p => ({ ...p, oldPassword: e.target.value }))}
                        className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s1)] px-3 py-2 text-[13px] outline-none focus:border-orange"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[var(--t2)]">New Password</label>
                      <input
                        type="password" required minLength={8}
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                        className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s1)] px-3 py-2 text-[13px] outline-none focus:border-orange"
                      />
                      <p className="text-[10px] text-[var(--t3)]">Min 8 chars, 1 uppercase, 1 lowercase, 1 number.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[var(--t2)]">Confirm New Password</label>
                      <input
                        type="password" required minLength={8}
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                        className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s1)] px-3 py-2 text-[13px] outline-none focus:border-orange"
                      />
                    </div>
                    <Button type="submit" variant="blue" disabled={changingPwd}>
                      {changingPwd ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>
                </div>
              ) : (
                currentData.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between border-b border-[var(--bd1)] px-5 py-3.5 last:border-b-0"
                  >
                    <span className="text-[12px] font-medium text-[var(--t3)]">{item.label}</span>
                    {isEditing && item.editable ? (
                      <motion.input
                        initial={{ width: 0 }}
                        animate={{ width: 'auto' }}
                        type="text"
                        defaultValue={item.editValue ?? item.value}
                        onChange={(e) => setEditData(prev => ({ ...prev, [item.field]: e.target.value }))}
                        className="rounded-md border border-orange/50 bg-[var(--s1)] px-3 py-1 text-right font-body text-[12px] text-[var(--t1)] outline-none"
                      />
                    ) : (
                      <span className="font-mono text-[12px] font-medium">{item.value}</span>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader><h3 className="font-display text-[15px] font-bold">🛡️ System Identity</h3></CardHeader>
            <CardBody className="space-y-4">
              {adminStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex justify-between items-center py-1"
                >
                  <span className="text-[12px] text-[var(--t2)]">{s.label}</span>
                  <Badge variant={s.label === 'Account Status' ? 'green' : s.label === '2FA Enabled' ? 'amber' : 'blue'}>
                    {s.value}
                  </Badge>
                </motion.div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="font-display text-[15px] font-bold">🔑 Permissions</h3></CardHeader>
            <CardBody className="space-y-2.5">
              {[
                { emoji: '👥', text: 'Manage Users & Roles' },
                { emoji: '📚', text: 'Academic Records' },
                { emoji: '💰', text: 'Fee Structures & Demands' },
              ].map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1, type: 'spring' }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-2.5 rounded-lg bg-[var(--s3)] px-3.5 py-2.5"
                >
                  <span className="text-base">{a.emoji}</span>
                  <span className="text-[12px] font-medium">{a.text}</span>
                </motion.div>
              ))}
            </CardBody>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
