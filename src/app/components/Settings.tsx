import { useState, useEffect } from "react";
import { User, Bell, Shield, Globe, Save } from "lucide-react";
import { api, type UserProfile, type NotificationSettings } from "../../lib/api";

interface SettingsProps {
  user: UserProfile;
  onProfileUpdate: (user: UserProfile) => void;
}

export function Settings({ user, onProfileUpdate }: SettingsProps) {
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    dob: user.dob,
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true, push: false, reminders: true, updates: false,
  });

  const [language, setLanguage] = useState(user.language ?? "vi");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getNotifications()
      .then(setNotifications)
      .catch((err) => console.error("Lỗi tải thông báo:", err));
  }, []);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-all duration-300"
      style={{ background: checked ? "linear-gradient(135deg, #4A9EE0, #E84545)" : "#E5E7EB" }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300"
        style={{ left: checked ? "calc(100% - 22px)" : "2px" }}
      />
    </button>
  );

  const profileFields: { label: string; key: keyof typeof profile }[] = [
    { label: "Họ và tên",      key: "name" },
    { label: "Email",          key: "email" },
    { label: "Số điện thoại",  key: "phone" },
    { label: "Ngày sinh",      key: "dob" },
  ];

  async function handleSave() {
    setSaving(true);
    try {
      const [updatedUser] = await Promise.all([
        api.updateProfile({ name: profile.name, phone: profile.phone, dob: profile.dob, language }),
        api.updateNotifications(notifications),
      ]);
      onProfileUpdate(updatedUser);
      alert("Đã lưu thay đổi thành công!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    const current = prompt("Nhập mật khẩu hiện tại:");
    if (!current) return;
    const next = prompt("Nhập mật khẩu mới (ít nhất 6 ký tự):");
    if (!next) return;
    try {
      const res = await api.changePassword(current, next);
      alert(res.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi đổi mật khẩu");
    }
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-3 shadow-sm">
        <h1 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>Cài đặt</h1>
        <p className="text-gray-400" style={{ fontSize: "12px" }}>Quản lý tài khoản và tuỳ chỉnh trải nghiệm</p>
      </div>

      <div className="p-6 max-w-2xl">
        {/* Profile */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-3 mb-4">
            <User size={16} style={{ color: "#4A9EE0" }} />
            <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#1F2937" }}>Thông tin cá nhân</h2>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <img
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.avatar_seed}&backgroundColor=b6e3f4`}
                alt="avatar"
                className="w-16 h-16 rounded-2xl ring-2 ring-blue-100"
              />
              <button
                onClick={() => alert("Chức năng tải ảnh sẽ được cập nhật sau.")}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full text-white flex items-center justify-center"
                style={{ background: "#4A9EE0", fontSize: "12px" }}
              >
                +
              </button>
            </div>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#1F2937" }}>{profile.name}</p>
              <p style={{ fontSize: "13px", color: "#9CA3AF" }}>{profile.email}</p>
              <span className="inline-block px-2 py-0.5 rounded-md mt-1"
                style={{ background: "#EEF6FD", color: "#4A9EE0", fontSize: "11px", fontWeight: 600 }}>
                Học viên
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {profileFields.map((field) => (
              <div key={field.key}>
                <label className="block mb-1" style={{ fontSize: "12px", fontWeight: 500, color: "#6B7280" }}>
                  {field.label}
                </label>
                <input
                  value={profile[field.key]}
                  onChange={(e) => setProfile((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  disabled={field.key === "email"}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 outline-none transition-all duration-200 focus:border-blue-300 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontSize: "13px" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-3 mb-4">
            <Bell size={16} style={{ color: "#E84545" }} />
            <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#1F2937" }}>Thông báo</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: "email",     label: "Thông báo qua Email",   desc: "Nhận cập nhật khóa học qua email" },
              { key: "push",      label: "Thông báo đẩy",         desc: "Nhận thông báo trực tiếp trên trình duyệt" },
              { key: "reminders", label: "Nhắc nhở học tập",      desc: "Nhắc nhở lịch học hàng ngày" },
              { key: "updates",   label: "Cập nhật nội dung",     desc: "Thông báo khi có bài học mới" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{item.label}</p>
                  <p style={{ fontSize: "12px", color: "#9CA3AF" }}>{item.desc}</p>
                </div>
                <Toggle
                  checked={!!notifications[item.key]}
                  onChange={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Security & Language */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={15} style={{ color: "#4A9EE0" }} />
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1F2937" }}>Bảo mật</h3>
            </div>
            <button
              onClick={handleChangePassword}
              className="w-full py-2 rounded-xl text-center transition-all duration-200 hover:opacity-90"
              style={{ background: "#F3F4F6", fontSize: "12px", fontWeight: 500, color: "#374151" }}
            >
              Đổi mật khẩu
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Globe size={15} style={{ color: "#E84545" }} />
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1F2937" }}>Ngôn ngữ</h3>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-gray-200 bg-gray-50 outline-none"
              style={{ fontSize: "12px", color: "#374151" }}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #4A9EE0, #E84545)",
            fontSize: "14px",
            fontWeight: 600,
            boxShadow: "0 4px 15px rgba(74,158,224,0.35)",
          }}
        >
          <Save size={16} />
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}
