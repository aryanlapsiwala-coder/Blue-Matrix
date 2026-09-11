const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const canManageComment = (comment, authUserId) => Boolean(authUserId && comment.authUserId === authUserId);
export const mapComment = (row) => ({
  id: row.id, authUserId: row.auth_user_id, user: row.user_name, role: row.user_role,
  text: row.text, time: new Date(row.created_at).toLocaleString(),
  edited: Boolean(row.updated_at && row.updated_at !== row.created_at),
});
const validText = (text) => {
  const value = String(text || '').trim();
  if (!value || value.length > 2000) throw new Error('Comments must contain 1–2,000 characters.');
  return value;
};

export function createComments(client) {
  const actor = async (entryId) => {
    if (!client) throw new Error('Comments are unavailable. Please try again later.');
    if (!uuid.test(entryId)) throw new Error('Comments are available on published posts.');
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user?.email_confirmed_at) throw new Error('Verify your email and sign in to manage comments.');
    return data.user.id;
  };
  return {
    async get(entryId) {
      if (!client || !uuid.test(entryId)) return [];
      const { data, error } = await client.from('entry_comments').select('*').eq('entry_id', entryId).order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map(mapComment);
    },
    async add(entryId, { text }) {
      const value = validText(text);
      await actor(entryId);
      // The database supplies the authenticated author's identity and display details.
      const { data, error } = await client.from('entry_comments').insert({ entry_id: entryId, text: value }).select().single();
      if (error) throw new Error('Your comment could not be posted. Please try again.');
      return mapComment(data);
    },
    async edit(entryId, commentId, text) {
      const value = validText(text);
      const ownerId = await actor(entryId);
      const { data, error } = await client.from('entry_comments').update({ text: value })
        .eq('id', commentId).eq('entry_id', entryId).eq('auth_user_id', ownerId).select().single();
      if (error || !data) throw new Error('Could not edit this comment. You can only edit your own comments; please try again.');
      return mapComment(data);
    },
    async remove(entryId, commentId) {
      const ownerId = await actor(entryId);
      const { data, error } = await client.from('entry_comments').delete()
        .eq('id', commentId).eq('entry_id', entryId).eq('auth_user_id', ownerId).select('id');
      if (error || !data?.length) throw new Error('Could not delete this comment. You can only delete your own comments; please try again.');
    },
  };
}
