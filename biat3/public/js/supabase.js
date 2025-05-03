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

// Function to get session history
async function getUserSessions() {
    try {
        const user = checkAuth();
        
        if (!user) throw new Error('User not authenticated');

        // In a real app, you would fetch session data from a dedicated sessions table
        // For this demo, we'll create mock data using the user's info
        
        const currentDate = new Date();
        const yesterdayDate = new Date(currentDate);
        yesterdayDate.setDate(currentDate.getDate() - 1);
        const lastWeekDate = new Date(currentDate);
        lastWeekDate.setDate(currentDate.getDate() - 7);
        
        // Format dates
        const formatDate = (date) => {
            return date.toLocaleDateString('tr-TR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };
        
        // Mock session data
        const sessions = [
            {
                id: 'session-current',
                device: 'Windows 10 - Chrome',
                ip: '192.168.1.1',
                location: 'Ankara, Türkiye',
                lastActive: 'Şu anda aktif',
                lastActiveDate: formatDate(currentDate),
                isCurrentSession: true
            },
            {
                id: 'session-yesterday',
                device: 'iPhone 13 - Safari',
                ip: '192.168.1.2',
                location: 'Ankara, Türkiye',
                lastActive: '1 gün önce',
                lastActiveDate: formatDate(yesterdayDate),
                isCurrentSession: false
            },
            {
                id: 'session-lastweek',
                device: 'MacBook Pro - Firefox',
                ip: '192.168.1.3',
                location: 'İstanbul, Türkiye',
                lastActive: '1 hafta önce',
                lastActiveDate: formatDate(lastWeekDate),
                isCurrentSession: false
            }
        ];

        return { success: true, data: sessions };
    } catch (error) {
        console.error('Error getting sessions:', error);
        return { success: false, error };
    }
}

// Function to terminate a session
async function terminateSession(sessionId) {
    try {
        const user = checkAuth();
        
        if (!user) throw new Error('User not authenticated');

        // In a real app, you would delete the session from your database
        // For this demo, we'll just simulate success
        
        console.log(`Terminating session: ${sessionId}`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return { success: true };
    } catch (error) {
        console.error('Error terminating session:', error);
        return { success: false, error };
    }
} 