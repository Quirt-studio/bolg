"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authAPI } from "@/lib/api/auth";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function PasswordSettingsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error(t("error.fillAllFields"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("error.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("error.passwordMismatch"));
      return;
    }
    setSaving(true);
    try {
      await authAPI.changePassword(oldPassword, newPassword);
      toast.success(t("success.passwordChanged"));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error(t("error.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("settings.password.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("settings.password.desc")}</p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("settings.password.change")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("settings.password.old")}</Label>
              <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.password.new")}</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.password.confirm")}</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? t("common.saving") : t("settings.password.save")}</Button>
          <Button type="button" variant="outline" onClick={() => router.push("/settings")}>{t("settings.password.cancel")}</Button>
        </div>
      </form>
    </div>
  );
}
