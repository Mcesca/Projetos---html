// API Configuration
const API_CONFIG = {
    // Usuário deve substituir com suas credenciais reais
    apiKey: "your-api-key",
    orgID: "your-organization-id",
    baseURL: "https://test1-api.rescuegroups.org/v5/public"
};

// Global state
let currentPage = 1;
let totalPages = 1;
let currentFilters = {};
let allAnimals = [];
let organizations = [];

// Imagens reais de animais para substituir os placeholders
const ANIMAL_IMAGES = {
    dog: [
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1560743641-3914f2c45636?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop"
    ],
    cat: [
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=300&fit=crop"
    ],
    rabbit: [
        "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1575535468632-345892291673?w=400&h=300&fit=crop"
    ],
    bird: [
        "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1555169062-013468b47731?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1549608276-5786777e6587?w=400&h=300&fit=crop"
    ]
};

// DOM Elements
const elements = {
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    errorText: document.getElementById('error-text'),
    animalsGrid: document.getElementById('animals-grid'),
    pagination: document.getElementById('pagination'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    pageInfo: document.getElementById('pageInfo'),
    searchBtn: document.getElementById('searchBtn'),
    orgSelect: document.getElementById('orgSelect'),
    speciesFilter: document.getElementById('speciesFilter'),
    ageFilter: document.getElementById('ageFilter'),
    modal: document.getElementById('animalModal'),
    modalBody: document.getElementById('modal-body'),
    modalClose: document.querySelector('.modal-close')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Initialize application
async function initializeApp() {
    try {
        showLoading();
        await loadOrganizations();
        await loadAnimals();
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        showError('Erro ao carregar dados iniciais. Verifique sua conexão com a internet.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    elements.searchBtn.addEventListener('click', handleSearch);
    
    // Pagination
    elements.prevBtn.addEventListener('click', () => changePage(currentPage - 1));
    elements.nextBtn.addEventListener('click', () => changePage(currentPage + 1));
    
    // Modal
    elements.modalClose.addEventListener('click', closeModal);
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) closeModal();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Load organizations (mock data since API requires authentication)
async function loadOrganizations() {
    try {
        // Simulando organizações para demonstração
        organizations = [
            { id: "1", name: "Abrigo São Francisco" },
            { id: "2", name: "Lar dos Animais" },
            { id: "3", name: "Proteção Animal SP" },
            { id: "4", name: "Amigos de Quatro Patas" },
            { id: "5", name: "Resgate Animal" }
        ];
        
        populateOrganizationSelect();
    } catch (error) {
        console.error('Erro ao carregar organizações:', error);
    }
}

// Populate organization select
function populateOrganizationSelect() {
    elements.orgSelect.innerHTML = '<option value="">Selecione uma organização</option>';
    
    organizations.forEach(org => {
        const option = document.createElement('option');
        option.value = org.id;
        option.textContent = org.name;
        elements.orgSelect.appendChild(option);
    });
}

// Load animals from API
async function loadAnimals(page = 1, filters = {}) {
    try {
        showLoading();
        
        // Como a API real requer autenticação, vamos simular dados para demonstração
        const mockAnimals = generateMockAnimals();
        
        // Aplicar filtros
        let filteredAnimals = mockAnimals;
        
        if (filters.species) {
            filteredAnimals = filteredAnimals.filter(animal => 
                animal.species.toLowerCase() === filters.species.toLowerCase()
            );
        }
        
        if (filters.age) {
            filteredAnimals = filteredAnimals.filter(animal => 
                animal.ageGroup.toLowerCase() === filters.age.toLowerCase()
            );
        }
        
        if (filters.organization) {
            filteredAnimals = filteredAnimals.filter(animal => 
                animal.organizationId === filters.organization
            );
        }
        
        // Paginação
        const itemsPerPage = 9;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedAnimals = filteredAnimals.slice(startIndex, endIndex);
        
        // Atualizar estado global
        allAnimals = paginatedAnimals;
        currentPage = page;
        totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);
        
        // Renderizar animais
        renderAnimals(allAnimals);
        updatePagination();
        hideLoading();
        
    } catch (error) {
        console.error('Erro ao carregar animais:', error);
        showError('Não foi possível carregar os animais. Tente novamente mais tarde.');
    }
}

// Generate mock animals for demonstration
function generateMockAnimals() {
    const names = [
        'Buddy', 'Luna', 'Max', 'Bella', 'Charlie', 'Lucy', 'Cooper', 'Daisy',
        'Rocky', 'Molly', 'Bear', 'Sadie', 'Duke', 'Maggie', 'Zeus', 'Sophie',
        'Jack', 'Chloe', 'Oliver', 'Zoe', 'Tucker', 'Lily', 'Buster', 'Penny'
    ];
    
    const species = ['dog', 'cat', 'rabbit', 'bird'];
    const speciesNames = { dog: 'Cão', cat: 'Gato', rabbit: 'Coelho', bird: 'Pássaro' };
    const ages = ['baby', 'young', 'adult', 'senior'];
    const ageNames = { baby: 'Filhote', young: 'Jovem', adult: 'Adulto', senior: 'Idoso' };
    const breeds = {
        dog: ['Labrador', 'Golden Retriever', 'Bulldog', 'Pastor Alemão', 'Beagle', 'SRD'],
        cat: ['Persa', 'Siamês', 'Maine Coon', 'British Shorthair', 'SRD'],
        rabbit: ['Holandês', 'Angorá', 'Mini Lop', 'Rex'],
        bird: ['Canário', 'Periquito', 'Calopsita', 'Papagaio']
    };
    
    const descriptions = [
        'Um animal muito carinhoso e brincalhão, perfeito para famílias.',
        'Adora crianças e é muito sociável com outros animais.',
        'Calmo e tranquilo, ideal para apartamentos.',
        'Energético e ativo, precisa de exercícios diários.',
        'Muito inteligente e fácil de treinar.',
        'Companheiro leal e protetor da família.',
        'Adora brincar e é muito afetuoso.',
        'Animal dócil e carinhoso, ótimo para idosos.'
    ];
    
    const animals = [];
    
    for (let i = 0; i < 50; i++) {
        const animalSpecies = species[Math.floor(Math.random() * species.length)];
        const animalAge = ages[Math.floor(Math.random() * ages.length)];
        const animalBreed = breeds[animalSpecies][Math.floor(Math.random() * breeds[animalSpecies].length)];
        const speciesImages = ANIMAL_IMAGES[animalSpecies];
        const randomImage = speciesImages[Math.floor(Math.random() * speciesImages.length)];
        
        animals.push({
            id: `animal-${i + 1}`,
            name: names[Math.floor(Math.random() * names.length)],
            species: animalSpecies,
            speciesName: speciesNames[animalSpecies],
            breed: animalBreed,
            ageGroup: animalAge,
            ageGroupName: ageNames[animalAge],
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            organizationId: organizations[Math.floor(Math.random() * organizations.length)].id,
            organizationName: organizations[Math.floor(Math.random() * organizations.length)].name,
            gender: Math.random() > 0.5 ? 'Macho' : 'Fêmea',
            size: ['Pequeno', 'Médio', 'Grande'][Math.floor(Math.random() * 3)],
            vaccinated: Math.random() > 0.3,
            neutered: Math.random() > 0.4,
            microchipped: Math.random() > 0.6,
            adoptionFee: Math.floor(Math.random() * 200) + 50,
            photos: [randomImage]
        });
    }
    
    return animals;
}

// Render animals in the grid
function renderAnimals(animals) {
    if (!animals || animals.length === 0) {
        elements.animalsGrid.innerHTML = `
            <div class="no-animals">
                <i class="fas fa-search"></i>
                <h3>Nenhum animal encontrado</h3>
                <p>Tente ajustar os filtros de busca.</p>
            </div>
        `;
        return;
    }
    
    elements.animalsGrid.innerHTML = animals.map(animal => `
        <div class="animal-card" onclick="showAnimalDetails('${animal.id}')">
            <div class="animal-image">
                ${animal.photos && animal.photos.length > 0 
                    ? `<img src="${animal.photos[0]}" alt="${animal.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop'">`
                    : `<i class="fas fa-paw"></i>`
                }
            </div>
            <div class="animal-info">
                <h3 class="animal-name">${animal.name}</h3>
                <div class="animal-details">
                    <span class="animal-tag">${animal.speciesName}</span>
                    <span class="animal-tag">${animal.ageGroupName}</span>
                    <span class="animal-tag">${animal.gender}</span>
                    ${animal.breed ? `<span class="animal-tag">${animal.breed}</span>` : ''}
                </div>
                <p class="animal-description">${animal.description}</p>
                <div class="animal-actions">
                    <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); showAnimalDetails('${animal.id}')">
                        <i class="fas fa-info-circle"></i>
                        Ver Detalhes
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Show animal details in modal
function showAnimalDetails(animalId) {
    const animal = allAnimals.find(a => a.id === animalId);
    if (!animal) return;
    
    elements.modalBody.innerHTML = `
        <div class="animal-detail">
            <div class="animal-detail-image">
                ${animal.photos && animal.photos.length > 0 
                    ? `<img src="${animal.photos[0]}" alt="${animal.name}" onerror="this.src='https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop'">`
                    : `<div class="placeholder-image"><i class="fas fa-paw"></i></div>`
                }
            </div>
            <div class="animal-detail-info">
                <h2>${animal.name}</h2>
                <div class="detail-tags">
                    <span class="detail-tag">${animal.speciesName}</span>
                    <span class="detail-tag">${animal.ageGroupName}</span>
                    <span class="detail-tag">${animal.gender}</span>
                    <span class="detail-tag">${animal.size}</span>
                    ${animal.breed ? `<span class="detail-tag">${animal.breed}</span>` : ''}
                </div>
                
                <div class="detail-section">
                    <h3>Sobre ${animal.name}</h3>
                    <p>${animal.description}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Informações de Saúde</h3>
                    <div class="health-info">
                        <div class="health-item ${animal.vaccinated ? 'positive' : 'negative'}">
                            <i class="fas ${animal.vaccinated ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                            <span>Vacinado</span>
                        </div>
                        <div class="health-item ${animal.neutered ? 'positive' : 'negative'}">
                            <i class="fas ${animal.neutered ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                            <span>Castrado</span>
                        </div>
                        <div class="health-item ${animal.microchipped ? 'positive' : 'negative'}">
                            <i class="fas ${animal.microchipped ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                            <span>Microchipado</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Organização</h3>
                    <p>${animal.organizationName}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Taxa de Adoção</h3>
                    <p class="adoption-fee">R$ ${animal.adoptionFee}</p>
                </div>
                
                <div class="detail-actions">
                    <button class="btn btn-primary">
                        <i class="fas fa-heart"></i>
                        Quero Adotar
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-share"></i>
                        Compartilhar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = `
        <style>
            .animal-detail {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                padding: 2rem;
            }
            
            .animal-detail-image img {
                width: 100%;
                height: 300px;
                object-fit: cover;
                border-radius: var(--radius-lg);
            }
            
            .placeholder-image {
                width: 100%;
                height: 300px;
                background: var(--bg-accent);
                border-radius: var(--radius-lg);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 3rem;
                color: var(--text-light);
            }
            
            .animal-detail-info h2 {
                font-size: 2rem;
                margin-bottom: 1rem;
                color: var(--text-primary);
            }
            
            .detail-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-bottom: 2rem;
            }
            
            .detail-tag {
                background: var(--primary-color);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: var(--radius-md);
                font-size: 0.875rem;
                font-weight: 500;
            }
            
            .detail-section {
                margin-bottom: 2rem;
            }
            
            .detail-section h3 {
                font-size: 1.25rem;
                margin-bottom: 0.5rem;
                color: var(--text-primary);
            }
            
            .health-info {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .health-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .health-item.positive i {
                color: #10b981;
            }
            
            .health-item.negative i {
                color: #ef4444;
            }
            
            .adoption-fee {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--primary-color);
            }
            
            .detail-actions {
                display: flex;
                gap: 1rem;
            }
            
            @media (max-width: 768px) {
                .animal-detail {
                    grid-template-columns: 1fr;
                    padding: 1rem;
                }
                
                .detail-actions {
                    flex-direction: column;
                }
            }
        </style>
    `;
    
    elements.modalBody.insertAdjacentHTML('beforeend', modalStyles);
    elements.modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    elements.modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Handle search
function handleSearch() {
    const filters = {
        organization: elements.orgSelect.value,
        species: elements.speciesFilter.value,
        age: elements.ageFilter.value
    };
    
    currentFilters = filters;
    loadAnimals(1, filters);
}

// Change page
function changePage(page) {
    if (page < 1 || page > totalPages) return;
    loadAnimals(page, currentFilters);
}

// Update pagination
function updatePagination() {
    if (totalPages <= 1) {
        elements.pagination.style.display = 'none';
        return;
    }
    
    elements.pagination.style.display = 'flex';
    elements.pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    elements.prevBtn.disabled = currentPage === 1;
    elements.nextBtn.disabled = currentPage === totalPages;
}

// Show loading state
function showLoading() {
    elements.loading.style.display = 'block';
    elements.error.style.display = 'none';
    elements.animalsGrid.style.display = 'none';
    elements.pagination.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    elements.loading.style.display = 'none';
    elements.animalsGrid.style.display = 'grid';
}

// Show error state
function showError(message) {
    elements.loading.style.display = 'none';
    elements.animalsGrid.style.display = 'none';
    elements.pagination.style.display = 'none';
    elements.error.style.display = 'block';
    elements.errorText.textContent = message;
}

// Scroll to animals section
function scrollToAnimals() {
    document.getElementById('animals').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add smooth scroll behavior for better UX
document.addEventListener('scroll', debounce(() => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = 'var(--shadow-md)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
}, 10));

// Add loading animation for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        img.addEventListener('error', function() {
            // Fallback para imagem de placeholder se a imagem não carregar
            this.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop';
        });
    });
});