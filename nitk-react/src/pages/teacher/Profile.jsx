import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge, Button, Avatar, ProgressBar } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as teacherApi from '../../services/teacherApi';
import { uploadFileToSupabase } from '../../services/uploadHelper';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../../components/ui/StateDisplays';
import { stagger, showToast, AnimatedCounter } from '../../components/ui/animations';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeacherProfile() {
  const { profile, refetchProfile } = useAuth();
  const { data: courses } = useApi(teacherApi.getCourses);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [editData, setEditData] = useState({});
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPwd, setChangingPwd] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (!profile) return <LoadingState message="Loading profile..." />;

  const p = profile;
  const name = p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Faculty';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const deptCode = p.department?.code || p.department_code || '';
  const teacherCourses = courses || [];

  const tabs = [
    { id: 'info', label: '👤 Info' },
    { id: 'academic', label: '🎓 Academic' },
    { id: 'security', label: '🔒 Security' },
  ];

  const info = [
    { label: 'Full Name', value: name },
    { label: 'Employee ID', value: p.employee_id || '—' },
    { label: 'Email', value: p.email || '—' },
    { label: 'Phone', value: p.phone || '—', editValue: p.phone || '', editable: true, field: 'phone' },
    { label: 'Office', value: p.office || '—', editValue: p.office || '', editable: true, field: 'office' },
    { label: 'Department', value: p.department?.name || deptCode || '—' },
    { label: 'Designation', value: p.designation || '—' },
    { label: 'Date of Joining', value: p.joining_date ? new Date(p.joining_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
  ];

  const academic = [
    { label: 'Qualification', value: p.qualification || '—' },
    { label: 'Specialization', value: p.specialization || '—', editValue: p.specialization || '', editable: true, field: 'specialization' },
    { label: 'Experience', value: p.experience || '—' },
    { label: 'Office Hours', value: p.office_hours || '—', editValue: p.office_hours || '', editable: true, field: 'office_hours' },
    { label: 'Courses Teaching', value: teacherCourses.map(c => c.code || c.course_code).join(', ') || '—' },
  ];

  const currentData = activeTab === 'info' ? info : academic;

  const stats = [
    { label: 'Courses', value: teacherCourses.length, max: 5, color: 'var(--color-blue)' },
    { label: 'Students', value: teacherCourses.reduce((s, c) => s + (c.student_count || c.students || 0), 0), max: 200, color: 'var(--color-green)' },
  ];

  const handleSave = async () => {
    try {
      if (Object.keys(editData).length > 0) {
        await teacherApi.updateProfile(editData);
      }
      await refetchProfile();
      setIsEditing(false);
      setEditData({});
      showToast('Profile updated!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to update profile', 'error');
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
      await teacherApi.changePassword({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword });
      showToast('Password updated successfully', 'success');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update password', 'error');
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
      const { signedUrl, publicUrl } = await teacherApi.uploadAvatar();
      await uploadFileToSupabase(signedUrl, file);
      await teacherApi.updateProfile({ profile_pic: publicUrl });
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
                <Avatar initials={initials} color="var(--color-blue)" size="lg" src={p.profile_pic} />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-[20px]">{uploadingAvatar ? '...' : '📷'}</span>
                </div>
              </label>
              <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </motion.div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold">{name}</h2>
              <p className="mt-0.5 text-[13px] text-[var(--t2)]">{p.designation || 'Faculty'} · {deptCode} Department · NIT Kurukshetra</p>
              <div className="mt-2.5 flex items-center gap-2">
                {p.employee_id && <Badge variant="blue">{p.employee_id}</Badge>}
                <Badge variant="green">Active</Badge>
              </div>
            </div>
            <Button variant={isEditing ? 'success' : 'ghost'} onClick={isEditing ? handleSave : () => setIsEditing(true)}>
              {isEditing ? '✓ Save' : '✏️ Edit'}
            </Button>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div className="grid grid-cols-[1fr_300px] gap-5" variants={stagger.item}>
        <Card>
          <CardHeader>
            <div className="flex gap-1.5">
              {tabs.map((t) => (
                <motion.button key={t.id} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(t.id)}
                  className={`cursor-pointer rounded-lg px-3.5 py-2 text-[12px] font-semibold transition-all ${activeTab === t.id ? 'bg-orange text-white' : 'bg-[var(--s3)] text-[var(--t2)] hover:bg-[var(--s4)]'}`}>
                  {t.label}
                </motion.button>
              ))}
            </div>
          </CardHeader>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {activeTab === 'security' ? (
                <div className="p-5">
                  <h4 className="mb-4 text-[14px] font-semibold text-[var(--t1)]">Change Password</h4>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[var(--t2)]">Current Password</label>
                      <input type="password" required value={passwordData.oldPassword}
                        onChange={e => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                        className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s1)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[var(--t2)]">New Password</label>
                      <input type="password" required minLength={8} value={passwordData.newPassword}
                        onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s1)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
                      <p className="text-[10px] text-[var(--t3)]">Min 8 chars, 1 uppercase, 1 lowercase, 1 number.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[var(--t2)]">Confirm New Password</label>
                      <input type="password" required minLength={8} value={passwordData.confirmPassword}
                        onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s1)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
                    </div>
                    <Button type="submit" variant="blue" disabled={changingPwd}>
                      {changingPwd ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>
                </div>
              ) : (
                currentData.map((item, i) => (
                  <motion.div key={item.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between border-b border-[var(--bd1)] px-5 py-3.5 last:border-b-0">
                    <span className="text-[12px] font-medium text-[var(--t3)]">{item.label}</span>
                    {isEditing && item.editable ? (
                      <input type="text" defaultValue={item.editValue ?? item.value}
                        onChange={(e) => setEditData(prev => ({ ...prev, [item.field]: e.target.value }))}
                        className="rounded-md border border-orange/50 bg-[var(--s1)] px-3 py-1 text-right font-body text-[12px] text-[var(--t1)] outline-none" />
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
            <CardHeader><h3 className="font-display text-[15px] font-bold">📊 Stats</h3></CardHeader>
            <CardBody className="space-y-4">
              {stats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[var(--t2)]">{s.label}</span>
                    <span className="font-mono font-semibold" style={{ color: s.color }}>
                      <AnimatedCounter value={s.value} decimals={0} duration={1 + i * 0.2} />
                    </span>
                  </div>
                  <div className="mt-1.5"><ProgressBar value={(s.value / s.max) * 100} color={s.color} /></div>
                </motion.div>
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader><h3 className="font-display text-[15px] font-bold">📚 Active Courses</h3></CardHeader>
            <CardBody className="space-y-2">
              {teacherCourses.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.08, type: 'spring' }}
                  whileHover={{ x: 4 }} className="rounded-lg bg-[var(--s3)] px-3.5 py-2.5 text-[12px] font-medium cursor-pointer transition-colors hover:bg-[var(--s4)]">
                  {c.code || c.course_code} {c.name || c.course_name}
                </motion.div>
              ))}
              {teacherCourses.length === 0 && <p className="py-4 text-center text-[13px] text-[var(--t3)]">No courses assigned</p>}
            </CardBody>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
