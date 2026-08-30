'use client';

import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ContactPayload = {
  email: string;
  message: string;
  name: string;
  reason: string;
  subject: string;
};

type ContactResult = { ok: true } | { ok: false; reason: 'not-configured' };

// The repository does not currently expose a contact endpoint. Replace only this
// function when the API contract exists; the form and validation can stay unchanged.
async function submitContactRequest(_payload: ContactPayload): Promise<ContactResult> {
  void _payload;
  return { ok: false, reason: 'not-configured' };
}

const fieldClassName =
  'min-h-12 w-full rounded-xl border border-[#dedfe4] bg-white px-4 text-[14px] text-[#26262a] shadow-[0_4px_14px_rgba(0,0,0,0.025)] transition-[border-color,box-shadow] placeholder:text-[#aaaab0] hover:border-[#cfd1d8] focus:border-[#143CFB] focus:outline-none focus:ring-4 focus:ring-[#143CFB]/10';

export function ContactForm() {
  const [state, setState] = useState<'idle' | 'submitting' | 'unavailable'>('idle');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('submitting');

    const form = event.currentTarget;
    const data = new FormData(form);
    const result = await submitContactRequest({
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
      name: String(data.get('name') ?? ''),
      reason: String(data.get('reason') ?? ''),
      subject: String(data.get('subject') ?? ''),
    });

    setState(result.ok ? 'idle' : 'unavailable');
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-[12px] font-bold text-[#44454a]">
          نام و نام خانوادگی
          <input
            autoComplete="name"
            className={fieldClassName}
            minLength={2}
            name="name"
            placeholder="نام شما"
            required
            type="text"
          />
        </label>
        <label className="grid gap-2 text-[12px] font-bold text-[#44454a]">
          ایمیل
          <input
            autoComplete="email"
            className={fieldClassName}
            name="email"
            placeholder="name@example.com"
            required
            type="email"
            dir="ltr"
          />
        </label>
      </div>

      <label className="grid gap-2 text-[12px] font-bold text-[#44454a]">
        موضوع تماس
        <select className={fieldClassName} defaultValue="" name="reason" required>
          <option disabled value="">
            یک گزینه را انتخاب کنید
          </option>
          <option value="about-waand">سوال درباره وآند</option>
          <option value="account">مشکل حساب</option>
          <option value="collaboration">همکاری</option>
          <option value="feedback">بازخورد</option>
          <option value="other">سایر</option>
        </select>
      </label>

      <label className="grid gap-2 text-[12px] font-bold text-[#44454a]">
        عنوان کوتاه
        <input
          className={fieldClassName}
          maxLength={120}
          minLength={4}
          name="subject"
          placeholder="موضوع را در یک جمله بنویسید"
          required
          type="text"
        />
      </label>

      <label className="grid gap-2 text-[12px] font-bold text-[#44454a]">
        پیام
        <textarea
          className={`${fieldClassName} min-h-40 resize-y py-3 leading-7`}
          maxLength={3000}
          minLength={12}
          name="message"
          placeholder="جزئیاتی را بنویسید که برای فهم بهتر موضوع لازم است."
          required
          rows={6}
        />
      </label>

      <div className="flex flex-col gap-3 border-t border-[#ececee] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[430px] text-[11px] leading-6 text-[#7b7b82]">
          در این نسخه فرم هنوز به سامانه پشتیبانی متصل نیست و اطلاعاتی ارسال نمی‌شود.
        </p>
        <Button className="min-w-36" disabled={state === 'submitting'} type="submit">
          {state === 'submitting' ? 'در حال بررسی…' : 'ارسال پیام'}
          {state === 'submitting' ? (
            <Send aria-hidden="true" className="size-4" />
          ) : (
            <ArrowLeft aria-hidden="true" className="size-4" />
          )}
        </Button>
      </div>

      <p aria-live="polite" className="min-h-6 text-[12px] leading-6 text-[#8a5b26]" role="status">
        {state === 'unavailable'
          ? 'فرم از نظر ساختار آماده است؛ ارسال آنلاین پس از تعریف مسیر پشتیبانی فعال می‌شود.'
          : ''}
      </p>
    </form>
  );
}
