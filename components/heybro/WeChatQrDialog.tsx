"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { WeChatContact } from "@/lib/booking-links";

function TriggerButton({
  className,
  label,
  onClick,
  disabled,
}: {
  className: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning
    >
      {label}
    </button>
  );
}

export function WeChatQrDialog({
  contact,
  triggerClassName = "sticky-cta sticky-cta-wechat",
  label = "WeChat QR",
  onOpen,
}: {
  contact: WeChatContact;
  triggerClassName?: string;
  label?: string;
  /** Fired when the QR dialog opens (GA4 lead conversion). */
  onOpen?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);
  const [open, setOpen] = useState(false);

  async function copyId() {
    if (!contact.id) return;
    try {
      await navigator.clipboard.writeText(contact.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <ClientOnly
      fallback={
        <TriggerButton className={triggerClassName} label={label} disabled />
      }
    >
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) onOpen?.();
        }}
      >
        <DialogTrigger asChild>
          <TriggerButton className={triggerClassName} label={label} />
        </DialogTrigger>
        {open ? (
          <DialogContent className="wechat-dialog">
            <DialogHeader>
              <DialogTitle>WeChat Chat</DialogTitle>
              <DialogDescription>
                Scan the QR or copy the WeChat ID to message this venue directly.
              </DialogDescription>
            </DialogHeader>

            {contact.configured ? (
              <div className="wechat-dialog-body">
                {contact.qrSrc && !qrFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={contact.qrSrc}
                    alt="WeChat QR code"
                    width={220}
                    height={220}
                    className="wechat-qr-image"
                    onError={() => setQrFailed(true)}
                  />
                ) : (
                  <div className="wechat-qr-placeholder">
                    QR image not uploaded yet — use the WeChat ID below.
                  </div>
                )}
                <div className="wechat-id-row">
                  <code>{contact.id}</code>
                  <button
                    type="button"
                    className="wechat-copy-btn"
                    onClick={copyId}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copied" : "Copy ID"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="wechat-unconfigured">
                WeChat is not configured for this listing yet. Please use Call or
                WhatsApp, or ask the venue for their WeChat ID.
              </div>
            )}
          </DialogContent>
        ) : null}
      </Dialog>
    </ClientOnly>
  );
}
