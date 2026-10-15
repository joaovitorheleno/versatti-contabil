import { Button, Checkbox, Modal } from "antd";
import { useEffect, useState } from "react";
import { openErrorNotification } from "../notification/error";
import {
  acceptTerms,
  getPrivacyStatus,
  type PrivacyStatus,
} from "../../service/privacy/integration";
import PrivacyPolicyContent from "./PrivacyPolicyContent";

type TermsGateProps = {
  onLogout: () => void;
};

const TermsGate = ({ onLogout }: TermsGateProps) => {
  const [status, setStatus] = useState<PrivacyStatus | null>(null);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPrivacyStatus()
      .then(setStatus)
      .catch(() => undefined);
  }, []);

  const handleAccept = async () => {
    if (!status) return;
    try {
      setSaving(true);
      setStatus(await acceptTerms(status.currentVersion));
    } catch (e: any) {
      openErrorNotification({
        title: "Não foi possível registrar o aceite",
        description: e?.response?.data?.message || e?.message || String(e),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!status?.mustAccept}
      title={
        status?.acceptedVersion
          ? "Atualizamos nossos termos de uso e privacidade"
          : "Termos de uso e privacidade"
      }
      closable={false}
      maskClosable={false}
      keyboard={false}
      width={720}
      footer={[
        <Button key="logout" onClick={onLogout}>
          Sair
        </Button>,
        <Button
          key="accept"
          type="primary"
          disabled={!checked}
          loading={saving}
          onClick={handleAccept}
          style={{ backgroundColor: checked ? "#16302A" : undefined }}
        >
          Aceitar e continuar
        </Button>,
      ]}
    >
      <div style={{ maxHeight: "55vh", overflowY: "auto", paddingRight: 8, marginBottom: 16 }}>
        <PrivacyPolicyContent />
      </div>
      <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
        Li e concordo com os termos de uso e a política de privacidade.
      </Checkbox>
    </Modal>
  );
};

export default TermsGate;
