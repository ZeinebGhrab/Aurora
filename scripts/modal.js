// Open Modal
function openModal() {
    const modal = document.getElementById('studentModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close Modal
function closeModal() {
    const modal = document.getElementById('studentModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        const form = document.getElementById('studentForm');
        const photoPreview = document.getElementById('photoPreview');
        const successMessage = document.getElementById('successMessage');
        
        if (form) form.reset();
        if (photoPreview) photoPreview.innerHTML = '<i class="fa-solid fa-user"></i>';
        if (successMessage) successMessage.classList.remove('show');
    }
}

// Preview Photo
function previewPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoPreview = document.getElementById('photoPreview');
            if (photoPreview) {
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            }
        };
        reader.readAsDataURL(file);
    }
}

// Save Student
function saveStudent() {
    const form = document.getElementById('studentForm');
    if (!form) return;
    
    // Basic validation
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Show success message
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.classList.add('show');
    }

    // Simulate saving
    setTimeout(() => {
        closeModal();
        console.log('Student data saved');
    }, 1500);
}

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Fonction pour réattacher les événements après le chargement
function attachModalEvents() {
    const modal = document.getElementById('studentModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
}