document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    const submenuItems = document.querySelectorAll('.has-submenu');
    
    // Toggle sidebar collapse
    toggleSidebar.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        
        // Update toggle button icon and text
        const icon = toggleSidebar.querySelector('i');
        const text = toggleSidebar.querySelector('span');
        
        if (sidebar.classList.contains('collapsed')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-bars-staggered');
            text.textContent = 'Menü Genişlet';
        } else {
            icon.classList.remove('fa-bars-staggered');
            icon.classList.add('fa-bars');
            text.textContent = 'Menü Küçült';
        }
        
        // Save sidebar state
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
    
    // Toggle submenu
    submenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.submenu')) return;
            
            const wasActive = item.classList.contains('active');
            
            // Close all other submenus
            submenuItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle clicked submenu
            item.classList.toggle('active', !wasActive);
        });
    });
    
    // Check for saved sidebar state
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        const icon = toggleSidebar.querySelector('i');
        const text = toggleSidebar.querySelector('span');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-bars-staggered');
        text.textContent = 'Menü Genişlet';
    }
    
    // Set active submenu based on current page
    const currentPage = window.location.pathname.split('/').pop();
    const currentLink = document.querySelector(`a[href="${currentPage}"]`);
    
    if (currentLink) {
        const submenuParent = currentLink.closest('.has-submenu');
        if (submenuParent) {
            submenuParent.classList.add('active');
        }
        currentLink.classList.add('active');
    }
}); 