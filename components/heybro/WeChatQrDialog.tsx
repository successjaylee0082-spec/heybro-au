"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { WeChatContact } from "@/lib/booking-links";

export function WeChatQrDialog({
  contact,
  triggerClassName = "sticky-cta sticky-cta-wechat",
}: {
  contact: WeChatContact;
  triggerClassName?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);

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
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={triggerClassName}>
          <MessageCircle className="h-4 w-4" />
          WeChat Chat
        </button>
      </DialogTrigger>
      <DialogContent className="wechat-dialog">
        <DialogHeader>
          <DialogTitle>WeChat Chat 微信</DialogTitle>
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
              <button type="button" className="wechat-copy-btn" onClick={copyId}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
    </Dialog>
  );
}
