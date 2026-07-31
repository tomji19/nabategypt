// Deno Edge Function — deploy with: supabase functions deploy notify-new-order
// Secrets needed:
//   RESEND_API_KEY  (from https://resend.com)
//   ADMIN_EMAIL     (default youssefashour19@gmail.com)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'youssefashour19@gmail.com';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'نبات <onboarding@resend.dev>';

Deno.serve(async (req) => {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId required' }), {
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return new Response(JSON.stringify({ error: error?.message || 'not found' }), {
        status: 404,
      });
    }

    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set — skipping email');
      return new Response(JSON.stringify({ ok: true, emailed: false }), {
        status: 200,
      });
    }

    const itemsHtml = (order.order_items || [])
      .map(
        (i) =>
          `<li>${i.product_name} × ${i.quantity} — ${i.line_total} EGP</li>`
      )
      .join('');

    const html = `
      <h2>طلب جديد / New order</h2>
      <p><strong>${order.order_number}</strong></p>
      <p>${order.customer_first_name} ${order.customer_last_name}<br/>
      ${order.customer_phone}<br/>
      ${order.customer_email}</p>
      <p>${order.shipping_address}, ${order.shipping_apartment}<br/>
      ${order.shipping_city}, ${order.shipping_country}</p>
      <p>Payment: ${order.payment_method} · Status: ${order.status}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total: ${order.total} EGP</strong> (shipping ${order.shipping_fee} EGP)</p>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject: `طلب جديد / New order ${order.order_number}`,
        html,
      }),
    });

    const body = await res.json();
    return new Response(JSON.stringify({ ok: res.ok, body }), {
      status: res.ok ? 200 : 500,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
