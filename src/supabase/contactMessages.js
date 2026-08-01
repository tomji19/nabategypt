import { supabase } from './supabase';

/**
 * Save a contact-form submission for the dashboard inbox.
 */
export async function submitContactMessage({ name, email, message }) {
  const payload = {
    name: String(name || '').trim(),
    email: String(email || '').trim(),
    message: String(message || '').trim(),
  };

  if (!payload.name || !payload.email || !payload.message) {
    throw new Error('Please fill in name, email, and message.');
  }

  const { data, error } = await supabase
    .from('contact_messages')
    .insert(payload)
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

/**
 * All contact messages for the dashboard (newest first).
 */
export async function fetchContactMessages() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, name, email, message, is_read, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function markContactMessageRead(id, isRead = true) {
  const { error } = await supabase
    .from('contact_messages')
    .update({ is_read: isRead })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteContactMessage(id) {
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
