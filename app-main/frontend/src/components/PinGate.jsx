import React, { useState } from "react";
import { CONFIG } from "@/config";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";

export default function PinGate({ onUnlock }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const handleChange = (v) => {
    setError(false);
    setValue(v);
    if (v.length === 4) {
      if (v === CONFIG.PIN_CODE) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => setValue(""), 500);
      }
    }
  };

  return (
    <div className="stresk-pin-page" data-testid="pin-gate">
      <div className="stresk-pin-card">
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "linear-gradient(135deg, #1a73e8, #4f8cf7)",
            boxShadow: "0 10px 28px rgba(26,115,232,0.35)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 18px",
          }}
        >
          <Lock size={24} color="#fff" />
        </div>
        <div style={{ fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em" }}>
          {CONFIG.APP_NAME} Dashboard
        </div>
        <div style={{ color: "var(--stresk-text-muted)", marginTop: 6, fontSize: 14 }}>
          Enter your 4-digit access PIN
        </div>

        <div style={{ display: "grid", placeItems: "center", margin: "26px 0 14px" }}>
          <InputOTP
            maxLength={4}
            value={value}
            onChange={handleChange}
            autoFocus
            data-testid="pin-input"
          >
            <InputOTPGroup>
              {[0, 1, 2, 3].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="!w-12 !h-14 !text-xl !font-semibold"
                  style={{
                    borderColor: error ? "var(--stresk-danger)" : undefined,
                  }}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div
          style={{
            minHeight: 20,
            fontSize: 13,
            color: error ? "var(--stresk-danger)" : "var(--stresk-text-subtle)",
          }}
          data-testid="pin-hint"
        >
          {error ? "Incorrect PIN — try again" : `Hint: default is ${CONFIG.PIN_CODE}`}
        </div>

        <div style={{ marginTop: 22 }}>
          <Button
            variant="ghost"
            className="text-[12px] text-[var(--stresk-text-subtle)] hover:text-[var(--stresk-text)]"
            onClick={() => handleChange(CONFIG.PIN_CODE)}
            data-testid="pin-demo-unlock"
          >
            <Sparkles size={14} className="mr-1.5" />
            Use demo PIN
          </Button>
        </div>
      </div>
    </div>
  );
}
