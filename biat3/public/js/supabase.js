// Supabase configuration
const SUPABASE_URL = 'https://vpqcqsiglylfjauzzvuv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcWNxc2lnbHlsZmphdXp6dnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNjc5MTUsImV4cCI6MjA2MTg0MzkxNX0.D-o_zWB5GoOfJLBtJ9ueeBCnp5fbr03wqTwrTC09Rmc';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to check if user is logged in (uses local storage instead of Supabase Auth)
function checkAuth() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Function to sign up a new user
async function signUpUser(email, password, userData) {
    try {
        // First, create authentication user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;

        // Then insert user profile data into custom table
        const { data: profileData, error: profileError } = await supabase
            .from('users')
            .insert([
                { 
                    id: authData.user.id,
                    email: email,
                    ad_soyad: userData.adSoyad,
                    telefon: userData.telefon,
                    departman: userData.departman,
                    konum: userData.konum,
                    sifre: password // Not recommended to store passwords in plain text, this is only for demonstration
                }
            ]);

        if (profileError) throw profileError;

        return { success: true, data: authData };
    } catch (error) {
        console.error('Error signing up:', error);
        return { success: false, error };
    }
}

// Function to sign in a user (manual verification against database)
async function signInUser(email, password) {
    try {
        // Get user with matching email and password
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('sifre', password)
            .single();

        if (error) throw error;
        
        if (!data) {
            throw new Error('Kullanıcı adı veya şifre hatalı.');
        }

        // Store user data in local storage
        localStorage.setItem('user', JSON.stringify(data));

        return { success: true, data };
    } catch (error) {
        console.error('Error signing in:', error);
        return { success: false, error };
    }
}

// Function to sign out a user
function signOutUser() {
    try {
        // Clear local storage
        localStorage.removeItem('user');
        
        return { success: true };
    } catch (error) {
        console.error('Error signing out:', error);
        return { success: false, error };
    }
}

// Function to update user profile
async function updateUserProfile(userData) {
    try {
        const user = checkAuth();
        
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('users')
            .update({
                ad_soyad: userData.adSoyad,
                telefon: userData.telefon,
                departman: userData.departman,
                konum: userData.konum
            })
            .eq('id', user.id);

        if (error) throw error;

        // Update local storage
        const updatedUser = { ...user, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        return { success: true, data };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error };
    }
}

// Function to change password
async function changeUserPassword(currentPassword, newPassword) {
    try {
        const user = checkAuth();
        
        if (!user) throw new Error('User not authenticated');
        
        // Verify current password
        const { data: verifyData, error: verifyError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .eq('sifre', currentPassword)
            .single();
            
        if (verifyError || !verifyData) {
            throw new Error('Mevcut şifreniz hatalı.');
        }

        // Update password
        const { error } = await supabase
            .from('users')
            .update({
                sifre: newPassword
            })
            .eq('id', user.id);

        if (error) throw error;
        
        // Update local storage
        const updatedUser = { ...user, sifre: newPassword };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        return { success: true };
    } catch (error) {
        console.error('Error changing password:', error);
        return { success: false, error };
    }
}

// Function to get user profile data
function getUserProfile() {
    try {
        const user = checkAuth();
        
        if (!user) throw new Error('User not authenticated');

        return { success: true, data: user };
    } catch (error) {
        console.error('Error getting profile:', error);
        return { success: false, error };
    }
}

// Reset password function (simple version)
async function resetPasswordForEmail(email) {
    try {
        // Check if email exists
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
            
        if (error || !data) {
            throw new Error('Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.');
        }
        
        // In a real application, you would send an email with reset link
        // For this demo, we'll just reset to a default password
        const { error: updateError } = await supabase
            .from('users')
            .update({
                sifre: 'resetpass123'
            })
            .eq('id', data.id);
            
        if (updateError) throw updateError;
        
        return { success: true };
    } catch (error) {
        console.error('Error resetting password:', error);
        return { success: false, error };
    }
} 