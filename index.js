
document.addEventListener('DOMContentLoaded', () => {
    function setupDropdown(btnId, dropdownId, arrowId) {
        const btn = document.getElementById(btnId);
        const dropdown = document.getElementById(dropdownId);
        const arrow = document.getElementById(arrowId);
        let isDropdownOpen = false;

        if (!btn || !dropdown || !arrow) return;

        function toggleDropdown() {
            isDropdownOpen = !isDropdownOpen;
            if (isDropdownOpen) {
                // Close other dropdowns if any (optional, but good UX)
                document.querySelectorAll('[id$="-dropdown"]').forEach(el => {
                    if (el.id !== dropdownId && !el.classList.contains('hidden')) {
                        el.classList.add('hidden', 'opacity-0', 'scale-95', 'translate-y-[-10px]');
                        el.classList.remove('opacity-100', 'scale-100', 'translate-y-0');
                        // Reset other arrows
                        const otherArrowId = el.id.replace('dropdown', 'arrow');
                        const otherArrow = document.getElementById(otherArrowId);
                        if (otherArrow) otherArrow.classList.remove('rotate-180');
                    }
                });


                // Show dropdown
                dropdown.classList.remove('hidden');
                requestAnimationFrame(() => {
                    dropdown.classList.remove('opacity-0', 'scale-95', 'translate-y-[-10px]');
                    dropdown.classList.add('opacity-100', 'scale-100', 'translate-y-0');
                });
                arrow.classList.add('rotate-180');
            } else {
                closeDropdown();
            }
        }

        function closeDropdown() {
            isDropdownOpen = false;
            dropdown.classList.remove('opacity-100', 'scale-100', 'translate-y-0');
            dropdown.classList.add('opacity-0', 'scale-95', 'translate-y-[-10px]');
            arrow.classList.remove('rotate-180');

            setTimeout(() => {
                if (!isDropdownOpen) {
                    dropdown.classList.add('hidden');
                }
            }, 200);
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });

        document.addEventListener('click', (e) => {
            if (isDropdownOpen && !btn.contains(e.target) && !dropdown.contains(e.target)) {
                closeDropdown();
            }
        });
    }

    setupDropdown('movies-menu-btn', 'movies-dropdown', 'movies-arrow');
    setupDropdown('series-menu-btn', 'series-dropdown', 'series-arrow');
});