/**
 * Supabase configuration for email/password auth and user data.
 *
 * Setup: Create a project at https://supabase.com, then replace the placeholder
 * values below with your project URL and anon key (Settings → API).
 *
 * Passwords are hashed and stored securely by Supabase; they never touch your frontend.
 */

const SUPABASE_URL = 'https://nfezihuvehuvcvnjkdmq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lUvOjPO1bOoxHLTve7zvyA_WlZMjYy5';

let supabase = null;

function getSupabase() {
    if (supabase) return supabase;
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase client not loaded. Include the Supabase script in your HTML.');
        return null;
    }
    const { createClient } = window.supabase;
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabase;
}

// ---- Auth ----
async function signUp(email, password) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    return data.user;
}

async function signIn(email, password) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
}

async function signOut() {
    const client = getSupabase();
    if (!client) return;
    await client.auth.signOut();
}

async function getSession() {
    const client = getSupabase();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data?.session ?? null;
}

async function getUser() {
    const session = await getSession();
    return session?.user ?? null;
}

function onAuthStateChange(callback) {
    const client = getSupabase();
    if (!client) return () => {};
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
    });
    return () => subscription?.unsubscribe?.();
}

// ---- Data: Saved properties ----
async function fetchProperties(userId) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');
    const { data, error } = await client
        .from('saved_properties')
        .select('properties')
        .eq('user_id', userId)
        .maybeSingle();
    if (error) throw error;
    return (data?.properties ?? []);
}

async function saveProperties(userId, properties) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');
    const { error } = await client
        .from('saved_properties')
        .upsert({ user_id: userId, properties, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) throw error;
}

async function saveProperty(userId, property) {
    const properties = await fetchProperties(userId);
    const index = properties.findIndex(p => p.id === property.id);
    if (index >= 0) properties[index] = property;
    else properties.unshift(property);
    await saveProperties(userId, properties);
}

async function deleteProperty(userId, propertyId) {
    const properties = await fetchProperties(userId);
    const filtered = properties.filter(p => p.id !== propertyId);
    await saveProperties(userId, filtered);
}

// ---- Data: Net worth ----
async function fetchNetWorth(userId) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');
    const { data: row, error } = await client
        .from('net_worth_data')
        .select('data, updated_at')
        .eq('user_id', userId)
        .maybeSingle();
    if (error) throw error;
    if (!row) return null;
    return { ...(row.data || {}), updated_at: row.updated_at };
}

async function saveNetWorthData(userId, data) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');
    const { error } = await client
        .from('net_worth_data')
        .upsert({ user_id: userId, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) throw error;
}

window.supabaseAuth = {
    signUp,
    signIn,
    signOut,
    getSession,
    getUser,
    onAuthStateChange
};

window.supabaseData = {
    fetchProperties,
    saveProperties,
    saveProperty,
    deleteProperty,
    fetchNetWorth,
    saveNetWorthData
};
