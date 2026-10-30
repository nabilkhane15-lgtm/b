import {
  ClubSettings,
  EmailLogEntry,
  EmailSettings,
  EmailTemplateConfig,
  EmailTemplateType,
  Member,
} from '../types';

const EMAIL_SETTINGS_KEY = 'bcf_email_settings_v1';
const EMAIL_LOGS_KEY = 'bcf_email_logs_v1';

export const DEFAULT_EMAIL_TEMPLATES: Record<EmailTemplateType, EmailTemplateConfig> = {
  DUE_REMINDER: {
    subjectBn: '🔔 চাঁদা পরিশোধের রিমাইন্ডার: {{periodTitle}} — {{clubName}}',
    bodyBn: `প্রিয় {{name}} (সদস্য আইডি: #{{memberCode}}),

আসসালামু আলাইকুম ও শুভেচ্ছা!
{{clubName}}-এর পক্ষ থেকে আপনাকে জানানো যাচ্ছে যে, "{{periodTitle}}"-এর আপনার নির্ধারিত চাঁদার হিসাব নিচে দেওয়া হলো:

📌 সময়কাল / খাত: {{periodTitle}}
💰 নির্ধারিত চাঁদা: ৳{{expectedAmount}}
✅ পরিশোধিত: ৳{{paidAmount}}
⚠️ বর্তমান বকেয়া: ৳{{dueAmount}}

অনুগ্রহ করে ক্লাবের কার্যক্রম সুষ্ঠুভাবে পরিচালনার স্বার্থে আপনার বকেয়া ৳{{dueAmount}} দ্রুত পরিশোধ করার জন্য বিশেষ অনুরোধ করা হচ্ছে।

📲 পেমেন্ট মাধ্যম:
{{paymentNumbersInfo}}

(যদি ইতিমধ্যে পরিশোধ করে থাকেন, তবে এই বার্তাটি উপেক্ষা করুন।)

ধন্যবাদান্তে,
{{senderName}}
{{clubName}}`,
    subjectEn: '🔔 Payment Reminder: {{periodTitle}} — {{clubName}}',
    bodyEn: `Dear {{name}} (Member ID: #{{memberCode}}),

Greetings from {{clubName}}!
This is a friendly reminder regarding your club contribution for "{{periodTitle}}":

📌 Period / Fund: {{periodTitle}}
💰 Determined Fee: ৳{{expectedAmount}}
✅ Paid Amount: ৳{{paidAmount}}
⚠️ Current Due: ৳{{dueAmount}}

Kindly clear your outstanding due of ৳{{dueAmount}} at your earliest convenience.

📲 Payment Info:
{{paymentNumbersInfo}}

Thank you,
{{senderName}}
{{clubName}}`,
  },

  PAID_RECEIPT: {
    subjectBn: '✅ পেমেন্ট সম্পন্ন ও ডিজিটাল রসিদ: {{periodTitle}} — {{clubName}}',
    bodyBn: `প্রিয় {{name}} (সদস্য আইডি: #{{memberCode}}),

আসসালামু আলাইকুম!
আপনার "{{periodTitle}}"-এর চাঁদা সফলভাবে গৃহীত হয়েছে। আপনার পেমেন্টের ডিজিটাল রসিদ নিচে দেওয়া হলো:

🧾 ডিজিটাল পেমেন্ট রসিদ (Receipt)
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 সদস্যের নাম: {{name}} (#{{memberCode}})
📅 সময়কাল / খাত: {{periodTitle}}
💵 নির্ধারিত ফি: ৳{{expectedAmount}}
✅ পরিশোধিত পরিমাণ: ৳{{paidAmount}}
💳 পেমেন্ট মাধ্যম: {{paymentMethod}}
🗓️ পরিশোধের তারিখ: {{paymentDate}}
📊 বর্তমান স্ট্যাটাস: পরিশোধিত (PAID ✓)
━━━━━━━━━━━━━━━━━━━━━━━━━━

সময়মতো ক্লাবের চাঁদা পরিশোধ করার জন্য আপনাকে আন্তরিক ধন্যবাদ!

শুভেচ্ছান্তে,
{{senderName}}
{{clubName}}`,
    subjectEn: '✅ Payment Confirmation & Receipt: {{periodTitle}} — {{clubName}}',
    bodyEn: `Dear {{name}} (Member ID: #{{memberCode}}),

Thank you! Your payment for "{{periodTitle}}" has been received and recorded.

🧾 Digital Payment Receipt
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Member: {{name}} (#{{memberCode}})
📅 Period / Fund: {{periodTitle}}
💵 Determined Fee: ৳{{expectedAmount}}
✅ Paid Amount: ৳{{paidAmount}}
💳 Method: {{paymentMethod}}
🗓️ Date: {{paymentDate}}
📊 Status: PAID ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for your timely contribution to {{clubName}}!

Best regards,
{{senderName}}
{{clubName}}`,
  },

  PARTIAL_REMINDER: {
    subjectBn: '⏳ আংশিক পেমেন্ট প্রাপ্তি ও অবশিষ্ট বকেয়া রিমাইন্ডার: {{periodTitle}}',
    bodyBn: `প্রিয় {{name}} (সদস্য আইডি: #{{memberCode}}),

শুভেচ্ছা! "{{periodTitle}}"-এর জন্য আপনার আংশিক পেমেন্ট ৳{{paidAmount}} গৃহীত হয়েছে।

📌 সময়কাল / খাত: {{periodTitle}}
💰 মোট নির্ধারিত চাঁদা: ৳{{expectedAmount}}
✅ জমা হয়েছে: ৳{{paidAmount}}
⚠️ অবশিষ্ট বকেয়া: ৳{{dueAmount}}

অনুগ্রহ করে সুবিধাজনক সময়ে অবশিষ্ট ৳{{dueAmount}} পরিশোধ করে পূর্ণাঙ্গ রসিদ সংগ্রহ করুন।

📲 পেমেন্ট মাধ্যম:
{{paymentNumbersInfo}}

ধন্যবাদান্তে,
{{senderName}}
{{clubName}}`,
    subjectEn: '⏳ Partial Payment Received & Balance Reminder: {{periodTitle}}',
    bodyEn: `Dear {{name}} (Member ID: #{{memberCode}}),

We have received your partial payment of ৳{{paidAmount}} for "{{periodTitle}}".

📌 Period: {{periodTitle}}
💰 Total Fee: ৳{{expectedAmount}}
✅ Paid: ৳{{paidAmount}}
⚠️ Remaining Balance Due: ৳{{dueAmount}}

Kindly clear the remaining balance of ৳{{dueAmount}} when convenient.

Thank you,
{{senderName}}
{{clubName}}`,
  },

  FUND_NOTICE: {
    subjectBn: '🤝 বিশেষ ফান্ড ও ক্লাব নোটিশ: {{periodTitle}} — {{clubName}}',
    bodyBn: `প্রিয় {{name}} (সদস্য আইডি: #{{memberCode}}),

আসসালামু আলাইকুম!
{{clubName}}-এর বিশেষ উদ্যোগ "{{periodTitle}}"-এ আপনার অংশগ্রহণ ও সহযোগিতা কামনা করছি।

📌 ফান্ড / ইভেন্ট: {{periodTitle}}
💰 আপনার নির্ধারিত লক্ষ্যমাত্রা: ৳{{expectedAmount}}
✅ আপনার বর্তমান জমা: ৳{{paidAmount}}
⚠️ বাকি: ৳{{dueAmount}}

📲 পেমেন্ট মাধ্যম:
{{paymentNumbersInfo}}

ধন্যবাদান্তে,
{{senderName}}
{{clubName}}`,
    subjectEn: '🤝 Special Fund Notice: {{periodTitle}} — {{clubName}}',
    bodyEn: `Dear {{name}} (Member ID: #{{memberCode}}),

Greetings from {{clubName}}! We invite your kind contribution towards "{{periodTitle}}".

📌 Fund / Event: {{periodTitle}}
💰 Target Contribution: ৳{{expectedAmount}}
✅ Paid So Far: ৳{{paidAmount}}
⚠️ Remaining: ৳{{dueAmount}}

Thank you,
{{senderName}}
{{clubName}}`,
  },

  CUSTOM: {
    subjectBn: '📢 {{clubName}} — জরুরি বার্তা ({{periodTitle}})',
    bodyBn: `প্রিয় {{name}} (সদস্য আইডি: #{{memberCode}}),

আসসালামু আলাইকুম!
{{clubName}}-এর পক্ষ থেকে আপনার অবগতির জন্য জানানো যাচ্ছে:

[আপনার বার্তা এখানে লিখুন]

ধন্যবাদান্তে,
{{senderName}}
{{clubName}}`,
    subjectEn: '📢 {{clubName}} — Club Notice ({{periodTitle}})',
    bodyEn: `Dear {{name}} (Member ID: #{{memberCode}}),

Greetings from {{clubName}}!

[Write your custom message here]

Best regards,
{{senderName}}
{{clubName}}`,
  },
};

export const GOOGLE_APPS_SCRIPT_AUTO_MAILER_CODE = `// Brothers Badminton (brothersking.cyou) — 100% Free Automatic Email Server
// 1. Go to https://script.google.com -> New Project -> Paste this code
// 2. Click "Deploy" -> "New deployment" -> Type: "Web app"
// 3. Execute as: "Me" | Who has access: "Anyone" -> Click "Deploy" & Copy Web App URL

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    MailApp.sendEmail({
      to: data.to,
      subject: data.subject,
      body: data.body,
      htmlBody: data.htmlBody || data.body.replace(/\\n/g, '<br/>'),
      name: data.senderName || 'Brothers Badminton (brothersking.cyou)',
      replyTo: data.replyTo || 'info@brothersking.cyou'
    });
    return ContentService.createTextOutput(JSON.stringify({ ok: true, domain: 'brothersking.cyou' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export const CLOUDFLARE_WORKER_BROTHERSKING_CODE = `// Cloudflare Worker for brothersking.cyou (e.g. https://mail.brothersking.cyou)
// Sends 100% automatic emails directly from noreply@brothersking.cyou via Resend or MailChannels
export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    try {
      const data = await request.json();
      const fromAddress = data.fromDomain || 'noreply@brothersking.cyou';
      const senderTitle = data.senderName || 'Brothers Badminton (Brothers King)';

      // If RESEND_API_KEY is configured in Cloudflare Worker Environment Variables:
      if (env && env.RESEND_API_KEY) {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + env.RESEND_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: senderTitle + ' <' + fromAddress + '>',
            to: [data.to],
            reply_to: data.replyTo || 'info@brothersking.cyou',
            subject: data.subject,
            html: data.htmlBody || data.body,
            text: data.body,
          }),
        });
        const resJson = await r.json();
        return new Response(JSON.stringify({ ok: r.ok, result: resJson }), { headers: corsHeaders });
      }

      // Default MailChannels relay for brothersking.cyou:
      const mc = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: data.to, name: data.name || 'Member' }] }],
          from: { email: fromAddress, name: senderTitle },
          reply_to: { email: data.replyTo || 'info@brothersking.cyou', name: senderTitle },
          subject: data.subject,
          content: [
            { type: 'text/plain', value: data.body },
            { type: 'text/html', value: data.htmlBody || data.body },
          ],
        }),
      });
      return new Response(JSON.stringify({ ok: mc.ok }), { headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: corsHeaders });
    }
  }
};`;

export function buildBrandedHtmlEmail(params: {
  subject: string;
  bodyText: string;
  senderName: string;
  fromDomainEmail?: string;
  replyToEmail?: string;
  isPaidReceipt?: boolean;
}): string {
  const { subject, bodyText, senderName, fromDomainEmail, replyToEmail, isPaidReceipt } = params;
  const escapedHtmlBody = bodyText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  const accentColor = isPaidReceipt ? '#059669' : '#d97706';
  const badgeText = isPaidReceipt
    ? 'OFFICIAL PAYMENT RECEIPT • PAID ✓'
    : 'OFFICIAL CLUB REMINDER • BROTHERSKING.CYOU';
  const domainAddress = fromDomainEmail || 'noreply@brothersking.cyou';

  return `<div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;border-radius:16px;border:1px solid #e2e8f0;">
  <div style="background:linear-gradient(135deg,#0f172a 0%,#064e3b 100%);padding:24px;border-radius:14px 14px 0 0;text-align:center;color:#ffffff;">
    <div style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(255,255,255,0.14);font-size:11px;font-weight:700;letter-spacing:1px;color:#34d399;margin-bottom:8px;">
      🏸 ${badgeText}
    </div>
    <h2 style="margin:0;font-size:21px;font-weight:800;color:#ffffff;">Brothers Badminton • Brothers King</h2>
    <p style="margin:4px 0 0;font-size:12px;color:#cbd5e1;">${senderName} • <span style="color:#6ee7b7;font-family:monospace;">${domainAddress}</span></p>
  </div>
  <div style="background:#ffffff;padding:24px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-top:4px solid ${accentColor};color:#1e293b;font-size:14px;line-height:1.7;">
    <div style="font-weight:700;font-size:15px;color:#0f172a;margin-bottom:14px;padding-bottom:10px;border-bottom:1px dashed #e2e8f0;">
      ${subject}
    </div>
    <div>${escapedHtmlBody}</div>
  </div>
  <div style="background:#f1f5f9;padding:14px 20px;border-radius:0 0 14px 14px;border:1px solid #e2e8f0;border-top:none;text-align:center;font-size:11px;color:#64748b;">
    <strong>Brothers Badminton • Official Domain: <a href="https://brothersking.cyou" style="color:#059669;text-decoration:none;">brothersking.cyou</a></strong><br/>
    প্রেরক ডোমেইন: ${domainAddress} ${replyToEmail ? `| যোগাযোগ / Reply-To: ${replyToEmail}` : ''}
  </div>
</div>`;
}

export function loadEmailSettings(clubSettings?: Partial<ClubSettings>): EmailSettings {
  const envResendKey = ((import.meta as any).env?.VITE_RESEND_API_KEY || '').trim();
  const envFromEmail = ((import.meta as any).env?.VITE_RESEND_FROM_EMAIL || 'noreply@brothersking.cyou').trim();

  try {
    const raw = localStorage.getItem(EMAIL_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const savedDomain = parsed.fromDomainEmail || '';
      const upgradedFromDomain =
        !savedDomain || savedDomain === 'noreply@brothersking.com'
          ? envFromEmail
          : savedDomain;

      const savedReply = parsed.replyToEmail || '';
      const upgradedReply =
        !savedReply ||
        savedReply === 'club.smashers.bd@gmail.com' ||
        savedReply === 'brothersbadminton@gmail.com'
          ? 'info@brothersking.cyou'
          : savedReply;

      const savedSender = parsed.senderName || '';
      const upgradedSender =
        !savedSender || savedSender === 'ক্লাব অ্যাডমিন প্যানেল'
          ? 'Brothers Badminton (Brothers King)'
          : savedSender;

      const savedBrand = parsed.senderBrandName || '';
      const upgradedBrand =
        !savedBrand || savedBrand === 'Brothers Badminton • Brothers King'
          ? 'Brothers Badminton • brothersking.cyou'
          : savedBrand;

      return {
        autoSendOnPaid: parsed.autoSendOnPaid ?? true,
        autoSendOnPartial: parsed.autoSendOnPartial ?? true,
        autoRemindUnpaid: parsed.autoRemindUnpaid ?? true,
        autoOpenGmailOnPaid: parsed.autoOpenGmailOnPaid ?? false,
        senderName: upgradedSender,
        senderBrandName: upgradedBrand,
        fromDomainEmail: upgradedFromDomain,
        replyToEmail: upgradedReply,
        paymentNumbersInfo:
          parsed.paymentNumbersInfo ||
          'বিকাশ (bKash Personal/Send Money): 01711-223344 | নগদ (Nagad): 01819-876543',
        provider: 'CUSTOM_DOMAIN',
        emailJsServiceId: parsed.emailJsServiceId || '',
        emailJsTemplateId: parsed.emailJsTemplateId || '',
        emailJsPublicKey: parsed.emailJsPublicKey || '',
        webhookUrl: parsed.webhookUrl || 'https://mail.brothersking.cyou',
        brevoApiKey: parsed.brevoApiKey || envResendKey,
        customTemplates: parsed.customTemplates || {},
      };
    }
  } catch (e) {
    console.error('Failed to load email settings', e);
  }
  return {
    autoSendOnPaid: true,
    autoSendOnPartial: true,
    autoRemindUnpaid: true,
    autoOpenGmailOnPaid: false,
    senderName: clubSettings?.adminName
      ? `Brothers Badminton (${clubSettings.adminName})`
      : 'Brothers Badminton (Brothers King)',
    senderBrandName: 'Brothers Badminton • brothersking.cyou',
    fromDomainEmail: envFromEmail,
    replyToEmail: 'info@brothersking.cyou',
    paymentNumbersInfo:
      'বিকাশ (bKash Personal/Send Money): 01711-223344 | নগদ (Nagad): 01819-876543',
    provider: 'CUSTOM_DOMAIN',
    emailJsServiceId: '',
    emailJsTemplateId: '',
    emailJsPublicKey: '',
    webhookUrl: 'https://mail.brothersking.cyou',
    brevoApiKey: envResendKey,
    customTemplates: {},
  };
}

export function saveEmailSettings(settings: EmailSettings): void {
  try {
    localStorage.setItem(EMAIL_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save email settings', e);
  }
}

export function loadEmailLogs(): EmailLogEntry[] {
  try {
    const raw = localStorage.getItem(EMAIL_LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load email logs', e);
  }
  return [];
}

export function saveEmailLogs(logs: EmailLogEntry[]): void {
  try {
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(logs.slice(0, 250)));
  } catch (e) {
    console.error('Failed to save email logs', e);
  }
}

export interface EmailTemplateVariables {
  name: string;
  memberCode: string;
  periodTitle: string;
  expectedAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod?: string;
  paymentDate?: string;
  clubName: string;
  senderName: string;
  paymentNumbersInfo: string;
}

export function renderEmailTemplate(
  templateText: string,
  vars: EmailTemplateVariables
): string {
  return templateText
    .replace(/\{\{name\}\}/g, vars.name)
    .replace(/\{\{memberCode\}\}/g, vars.memberCode)
    .replace(/\{\{periodTitle\}\}/g, vars.periodTitle)
    .replace(/\{\{expectedAmount\}\}/g, String(vars.expectedAmount))
    .replace(/\{\{paidAmount\}\}/g, String(vars.paidAmount))
    .replace(/\{\{dueAmount\}\}/g, String(vars.dueAmount))
    .replace(/\{\{paymentMethod\}\}/g, vars.paymentMethod || 'Cash / bKash')
    .replace(/\{\{paymentDate\}\}/g, vars.paymentDate || new Date().toLocaleDateString('en-GB'))
    .replace(/\{\{clubName\}\}/g, vars.clubName)
    .replace(/\{\{senderName\}\}/g, vars.senderName)
    .replace(/\{\{paymentNumbersInfo\}\}/g, vars.paymentNumbersInfo);
}

export function getEffectiveTemplate(
  type: EmailTemplateType,
  settings: EmailSettings
): EmailTemplateConfig {
  const custom = settings.customTemplates?.[type];
  const base = DEFAULT_EMAIL_TEMPLATES[type];
  return {
    subjectBn: custom?.subjectBn || base.subjectBn,
    bodyBn: custom?.bodyBn || base.bodyBn,
    subjectEn: custom?.subjectEn || base.subjectEn,
    bodyEn: custom?.bodyEn || base.bodyEn,
  };
}

/**
 * Opens Gmail Web Compose in a new tab with To, optional BCC, Subject, and Body prefilled.
 */
export function openGmailCompose(
  toEmail: string,
  subject: string,
  body: string,
  bccEmails?: string[]
): void {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: toEmail,
    su: subject,
    body: body,
  });
  if (bccEmails && bccEmails.length > 0) {
    params.set('bcc', bccEmails.join(','));
  }
  window.open(`https://mail.google.com/mail/?${params.toString()}`, '_blank', 'noopener,noreferrer');
}

/**
 * Opens default device mail client via mailto: URL.
 */
export function openMailtoClient(
  toEmail: string,
  subject: string,
  body: string,
  bccEmails?: string[]
): void {
  const params = new URLSearchParams();
  params.set('subject', subject);
  params.set('body', body);
  if (bccEmails && bccEmails.length > 0) {
    params.set('bcc', bccEmails.join(','));
  }
  const queryString = params.toString().replace(/\+/g, '%20');
  window.location.href = `mailto:${encodeURIComponent(toEmail)}?${queryString}`;
}

/**
 * Sends email automatically in the background via Custom Domain API (brothersking.cyou via Resend/Brevo), Cloudflare/Google Webhook, or EmailJS.
 */
export async function sendEmailViaConfiguredApi(
  settings: EmailSettings,
  payload: {
    toEmail: string;
    toName: string;
    subject: string;
    body: string;
    memberCode: string;
    periodTitle: string;
    amount: number;
    isPaidReceipt?: boolean;
  }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const fromDomain = settings.fromDomainEmail?.trim() || 'noreply@brothersking.cyou';
    const senderTitle = settings.senderName || 'Brothers Badminton (Brothers King)';
    const htmlBody = buildBrandedHtmlEmail({
      subject: payload.subject,
      bodyText: payload.body,
      senderName: senderTitle,
      fromDomainEmail: fromDomain,
      replyToEmail: settings.replyToEmail || 'info@brothersking.cyou',
      isPaidReceipt: payload.isPaidReceipt,
    });

    const effectiveApiKey = (
      settings.brevoApiKey ||
      ((import.meta as any).env?.VITE_RESEND_API_KEY ?? '')
    ).trim();

    // 1. Custom Domain API (brothersking.cyou via Resend API or Brevo v3 SMTP API)
    if (settings.provider === 'CUSTOM_DOMAIN' && effectiveApiKey) {
      // Support Resend API key (starts with re_)
      if (effectiveApiKey.startsWith('re_')) {
        const sendViaResend = async (fromAddr: string) => {
          const reqBody = JSON.stringify({
            from: `${senderTitle} <${fromAddr}>`,
            to: [payload.toEmail],
            reply_to: settings.replyToEmail || 'info@brothersking.cyou',
            subject: payload.subject,
            html: htmlBody,
            text: payload.body,
          });
          const headers = {
            Authorization: `Bearer ${effectiveApiKey}`,
            'Content-Type': 'application/json',
          };
          try {
            const proxyRes = await fetch('/api/resend/emails', {
              method: 'POST',
              headers,
              body: reqBody,
            });
            const contentType = proxyRes.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              return proxyRes;
            }
          } catch {
            // fallback to direct URL below
          }
          return fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers,
            body: reqBody,
          });
        };

        let response = await sendViaResend(fromDomain);
        if (!response.ok) {
          const errText = await response.text();
          // If brothersking.cyou is still awaiting DNS verification in Resend, fallback to onboarding@resend.dev
          if (errText.toLowerCase().includes('not verified') && fromDomain !== 'onboarding@resend.dev') {
            const fallbackRes = await sendViaResend('onboarding@resend.dev');
            if (fallbackRes.ok) {
              return { ok: true };
            }
          }
          return { ok: false, error: errText || `Resend HTTP ${response.status}` };
        }
        return { ok: true };
      }

      // Default Brevo v3 SMTP API (sends directly from @brothersking.cyou)
      const apiKey = effectiveApiKey;
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: senderTitle,
            email: fromDomain,
          },
          to: [{ email: payload.toEmail, name: payload.toName }],
          replyTo: settings.replyToEmail
            ? { email: settings.replyToEmail, name: senderTitle }
            : undefined,
          subject: payload.subject,
          htmlContent: htmlBody,
          textContent: payload.body,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        return { ok: false, error: text || `Domain API HTTP ${response.status}` };
      }
      return { ok: true };
    }

    // 2. EmailJS Background API
    if (
      settings.provider === 'EMAILJS' &&
      settings.emailJsServiceId &&
      settings.emailJsTemplateId &&
      settings.emailJsPublicKey
    ) {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: settings.emailJsServiceId.trim(),
          template_id: settings.emailJsTemplateId.trim(),
          user_id: settings.emailJsPublicKey.trim(),
          template_params: {
            to_email: payload.toEmail,
            to_name: payload.toName,
            subject: payload.subject,
            message: payload.body,
            html_message: htmlBody,
            member_code: payload.memberCode,
            period_title: payload.periodTitle,
            amount: payload.amount,
            reply_to: settings.replyToEmail || 'info@brothersking.cyou',
            from_name: senderTitle,
            from_domain: fromDomain,
          },
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        return { ok: false, error: text || `HTTP ${response.status}` };
      }
      return { ok: true };
    }

    // 3. Cloudflare Worker (https://mail.brothersking.cyou) or Google Apps Script Webhook
    if (
      (settings.provider === 'WEBHOOK' || settings.provider === 'CUSTOM_DOMAIN') &&
      settings.webhookUrl?.trim() &&
      settings.webhookUrl.trim() !== 'https://mail.brothersking.cyou'
    ) {
      const response = await fetch(settings.webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          to: payload.toEmail,
          name: payload.toName,
          subject: payload.subject,
          body: payload.body,
          htmlBody,
          memberCode: payload.memberCode,
          periodTitle: payload.periodTitle,
          amount: payload.amount,
          replyTo: settings.replyToEmail || 'info@brothersking.cyou',
          senderName: senderTitle,
          fromDomain,
        }),
      });
      if (!response.ok) {
        return { ok: false, error: `Webhook HTTP ${response.status}` };
      }
      return { ok: true };
    }

    return { ok: false, error: 'NO_API_CONFIGURED' };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error' };
  }
}

/**
 * Generates and dispatches/logs an automatic confirmation or reminder email when payment status changes.
 */
export async function triggerAutoPaymentEmail(params: {
  member: Member;
  periodTitle: string;
  expectedAmount: number;
  paidAmount: number;
  paymentMethod?: string;
  paymentDate?: string;
  clubSettings: ClubSettings;
  isBangla: boolean;
  onLogCreated?: (entry: EmailLogEntry) => void;
}): Promise<{ sentViaApi: boolean; openedGmail: boolean; logEntry?: EmailLogEntry }> {
  const {
    member,
    periodTitle,
    expectedAmount,
    paidAmount,
    paymentMethod,
    paymentDate,
    clubSettings,
    isBangla,
    onLogCreated,
  } = params;

  const settings = loadEmailSettings(clubSettings);
  const isPaid = paidAmount >= expectedAmount && expectedAmount > 0;
  const isPartial = paidAmount > 0 && paidAmount < expectedAmount;
  const isUnpaid = paidAmount === 0 && expectedAmount > 0;

  if (isPaid && !settings.autoSendOnPaid) {
    return { sentViaApi: false, openedGmail: false };
  }
  if (isPartial && settings.autoSendOnPartial === false) {
    return { sentViaApi: false, openedGmail: false };
  }
  if (isUnpaid && !settings.autoRemindUnpaid) {
    return { sentViaApi: false, openedGmail: false };
  }

  const recipientEmail = (member.email || '').trim();
  if (!recipientEmail) {
    return { sentViaApi: false, openedGmail: false };
  }

  const dueAmount = Math.max(0, expectedAmount - paidAmount);
  const templateType: EmailTemplateType = isPaid
    ? 'PAID_RECEIPT'
    : isPartial
    ? 'PARTIAL_REMINDER'
    : 'DUE_REMINDER';

  const tpl = getEffectiveTemplate(templateType, settings);
  const clubName =
    settings.senderBrandName ||
    (isBangla && clubSettings.clubNameBangla
      ? clubSettings.clubNameBangla
      : clubSettings.clubName);

  const vars: EmailTemplateVariables = {
    name: isBangla && member.banglaName ? member.banglaName : member.name,
    memberCode: member.memberCode || '1000',
    periodTitle,
    expectedAmount,
    paidAmount,
    dueAmount,
    paymentMethod: paymentMethod || 'Cash',
    paymentDate: paymentDate || new Date().toLocaleDateString('en-GB'),
    clubName,
    senderName: settings.senderName || 'Brothers Badminton (Brothers King)',
    paymentNumbersInfo: settings.paymentNumbersInfo,
  };

  const subject = renderEmailTemplate(isBangla ? tpl.subjectBn : tpl.subjectEn, vars);
  const body = renderEmailTemplate(isBangla ? tpl.bodyBn : tpl.bodyEn, vars);

  let sentViaApi = false;
  let openedGmail = false;
  let deliveryMethod: EmailLogEntry['deliveryMethod'] = 'AUTO_LOG';
  let status: EmailLogEntry['status'] = 'QUEUED';

  if (
    settings.provider === 'CUSTOM_DOMAIN' ||
    settings.provider === 'EMAILJS' ||
    settings.provider === 'WEBHOOK'
  ) {
    const apiRes = await sendEmailViaConfiguredApi(settings, {
      toEmail: recipientEmail,
      toName: vars.name,
      subject,
      body,
      memberCode: vars.memberCode,
      periodTitle,
      amount: paidAmount > 0 ? paidAmount : dueAmount,
      isPaidReceipt: isPaid,
    });
    if (apiRes.ok) {
      sentViaApi = true;
      deliveryMethod = 'API_AUTO';
      status = 'SENT';
    }
  }

  if (!sentViaApi && settings.autoOpenGmailOnPaid) {
    openGmailCompose(recipientEmail, subject, body);
    openedGmail = true;
    deliveryMethod = 'GMAIL_WEB';
    status = 'OPENED';
  } else if (!sentViaApi) {
    status = 'SENT';
  }

  const logEntry: EmailLogEntry = {
    id: `em-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleString('en-GB'),
    memberId: member.id,
    memberName: vars.name,
    memberCode: vars.memberCode,
    recipientEmail,
    templateType,
    subject,
    body,
    deliveryMethod,
    status,
    periodTitle,
    amount: paidAmount > 0 ? paidAmount : dueAmount,
  };

  const existingLogs = loadEmailLogs();
  saveEmailLogs([logEntry, ...existingLogs]);
  if (onLogCreated) {
    onLogCreated(logEntry);
  }

  return { sentViaApi, openedGmail, logEntry };
}
